import "./config/loadEnv.js";

console.log("🔥 ENV CHECK ON STARTUP 🔥", {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  PORT: process.env.PORT || 5000
});

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import PDFDocument from "pdfkit";
import { DraftFIR, FinalFIR } from "./models/FIR.js";
import { predictIPCSections, generateFIRNumber } from "./services/lawGPTService.js";
import { Case } from "./models/Case.js";
import { generateEmbedding, cosineSimilarity } from "./services/embeddingService.js";
import evidenceRoutes from "./routes/evidenceRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { authenticate, authenticateJWT, requirePolice, requirePermission, roleGuard } from "./middleware/authMiddleware.js";
import { User } from "./models/User.js";

// 2️⃣ CREATE EXPRESS APP
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const MONGO = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || '';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin123@police.gov.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@gov';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Admin';

if (!MONGO) {
  console.error("❌ MONGODB_URI is missing in environment variables!");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in environment variables!");
  process.exit(1);
}

// 3️⃣ REGISTER MIDDLEWARE
app.use(cors({ origin: FRONTEND }));
app.use(express.json());

// 4️⃣ REGISTER ROUTES

// Health Check (Public)
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, port: PORT, message: "Server is running normally" });
});

// Auth & Admin Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Police Routes (Protected)
app.use("/api/evidence", authenticate, requirePolice, evidenceRoutes);
app.use("/api/profile", authenticate, profileRoutes);
app.use("/api/analytics", authenticate, analyticsRoutes);

// --- INLINE ROUTE HANDLERS (Preserved from original) ---

// Notification schema (kept for backwards compatibility)
const notificationSchema = new mongoose.Schema({
  firId: String,
  message: String,
  type: { type: String, enum: ["submission", "approval", "rejection"], default: "submission" },
  timestamp: { type: Date, default: Date.now },
}, { versionKey: false });
const Notification = mongoose.model("Notification", notificationSchema);

// Counts by status (Used by Dashboard)
app.get("/api/firs/counts", authenticate, requirePolice, async (_req, res) => {
  try {
    const [draftCounts, finalCounts] = await Promise.all([
      DraftFIR.aggregate([{ $group: { _id: "$status", total: { $sum: 1 } } }]),
      FinalFIR.countDocuments({ status: "approved" })
    ]);
    const out = { draft: 0, pending_approval: 0, pending: 0, approved: finalCounts, rejected: 0 };
    draftCounts.forEach(c => {
      if (c._id === "pending_approval") {
        out.pending_approval = c.total;
        out.pending = c.total;
      } else if (out.hasOwnProperty(c._id)) {
        out[c._id] = c.total;
      }
    });
    return res.json(out);
  } catch (e) {
    console.error("[API] Error fetching counts:", e);
    return res.status(500).json({ error: e.message || "Failed to fetch counts" });
  }
});

// NEW: Case Stats Counts (Missing Endpoint requested by User)
app.get("/api/cases/stats/counts", authenticate, requirePolice, async (_req, res) => {
  try {
    const totalCases = await Case.countDocuments();
    // Assuming 'closed' or 'active' status exists in Case model, otherwise basic count
    // Use aggregation if status exists
    const activeCases = await Case.countDocuments({ status: 'active' });
    const closedCases = await Case.countDocuments({ status: 'closed' });

    res.json({
      total: totalCases,
      active: activeCases,
      closed: closedCases
    });
  } catch (error) {
    console.error("[API] Error fetching case stats:", error);
    res.status(500).json({ error: "Failed to fetch case stats" });
  }
});

// ... [Keep existing FIR Routes: Create, Drafts, Update, Approve, Final, Pending, Search] ...

app.post("/api/fir/create", authenticate, requirePolice, requirePermission('FIR_CREATE'), async (req, res) => {
  try {
    const { caseDescription, description, victim, accused, incident, date, time, location, createdBy } = req.body;
    const caseText = caseDescription || description || incident || "";

    if (!caseText.trim()) {
      return res.status(400).json({ error: "Case description is required" });
    }

    console.log(`[API] Creating new draft FIR with case description (${caseText.length} chars)`);

    let ipcPredictions = [];
    try {
      ipcPredictions = await predictIPCSections(caseText);
    } catch (error) {
      console.warn(`[API] LawGPT unavailable: ${error.message}`);
    }

    const firNumber = generateFIRNumber();
    const draftFIR = await DraftFIR.create({
      firNumber,
      caseDescription: caseText,
      description: description || caseText,
      ipcPredictions,
      status: "draft",
      victim: victim || "",
      accused: accused || "",
      incident: incident || "",
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toLocaleTimeString(),
      location: location || "",
      createdBy: createdBy || "user",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({ success: true, fir: draftFIR, message: "Draft FIR created successfully" });
  } catch (error) {
    console.error("[API] Error creating draft FIR:", error);
    res.status(500).json({ error: error.message || "Failed to create draft FIR" });
  }
});

app.get("/api/fir/drafts", authenticate, requirePolice, requirePermission('FIR_VIEW'), async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (status) query.status = status;
    else query.status = { $in: ['draft', 'pending_approval'] };

    if (search) {
      query.$or = [
        { caseDescription: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { firNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const drafts = await DraftFIR.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, drafts, count: drafts.length });
  } catch (error) {
    console.error("[API] Error fetching drafts:", error);
    res.status(500).json({ error: error.message || "Failed to fetch draft FIRs" });
  }
});

app.put("/api/fir/update/:id", authenticate, requirePolice, requirePermission('FIR_EDIT'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData.status;
    delete updateData.createdAt;
    delete updateData._id;

    if (updateData.caseDescription || updateData.description) {
      const caseText = updateData.caseDescription || updateData.description || "";
      if (caseText.trim()) {
        try {
          updateData.ipcPredictions = await predictIPCSections(caseText);
        } catch (e) { /* ignore */ }
      }
    }
    if (typeof updateData.ipcSections === 'string') {
      updateData.ipcSections = updateData.ipcSections.split(',').map(s => s.trim()).filter(Boolean);
    }

    const fir = await DraftFIR.findByIdAndUpdate(id, updateData, { new: true });
    if (!fir) return res.status(404).json({ error: "Draft FIR not found" });

    res.json({ success: true, fir, message: "Draft FIR updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update FIR" });
  }
});

app.post("/api/fir/send-for-approval/:id", authenticate, requirePolice, requirePermission('FIR_SUBMIT'), async (req, res) => {
  try {
    const { id } = req.params;
    const fir = await DraftFIR.findByIdAndUpdate(id, { status: "pending_approval", updatedAt: new Date() }, { new: true });
    if (!fir) return res.status(404).json({ error: "FIR not found" });

    await Notification.create({ firId: String(fir._id), message: `FIR ${fir.firNumber} submitted for approval`, type: "submission" });
    res.json({ success: true, fir, message: "FIR submitted for approval" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to send FIR for approval" });
  }
});

app.post("/api/fir/approve/:id", authenticate, requirePolice, requirePermission('FIR_APPROVE'), roleGuard(['INSPECTOR','SP','DIG','IG','DGP','DSP','ASP','SI']), async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const draftFIR = await DraftFIR.findById(id);
    if (!draftFIR) return res.status(404).json({ error: "FIR not found" });
    if (draftFIR.status !== "pending_approval") return res.status(400).json({ error: "FIR must be in pending_approval" });

    const finalFIR = await FinalFIR.create({
      ...draftFIR.toObject(),
      status: "approved",
      approvedBy: approvedBy || "inspector",
      approvedAt: new Date(),
      updatedAt: new Date(),
      _id: undefined // New ID for final
    });

    await DraftFIR.findByIdAndDelete(id);
    await Notification.create({ firId: String(finalFIR._id), message: `FIR ${finalFIR.firNumber} finalized`, type: "approval" });
    res.json({ success: true, fir: finalFIR, message: "FIR approved and finalized" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to approve FIR" });
  }
});

app.get("/api/fir/final", authenticate, requirePolice, requirePermission('FIR_VIEW'), async (req, res) => {
  try {
    const { search } = req.query;
    let query = { status: "approved" };
    if (search) {
      query.$or = [
        { caseDescription: { $regex: search, $options: 'i' } },
        { firNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const finalFIRs = await FinalFIR.find(query).sort({ approvedAt: -1 }).limit(100);
    res.json({ success: true, firs: finalFIRs, count: finalFIRs.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/fir/pending", authenticate, requirePolice, requirePermission('FIR_VIEW'), async (req, res) => {
  try {
    const pending = await DraftFIR.find({ status: "pending_approval" }).sort({ createdAt: -1 });
    res.json({ success: true, firs: pending, count: pending.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/fir/:id", authenticate, requirePolice, requirePermission('FIR_VIEW'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid FIR id" });
    let fir = await DraftFIR.findById(id);
    if (!fir) fir = await FinalFIR.findById(id);
    if (!fir) return res.status(404).json({ error: "FIR not found" });
    res.json({ success: true, fir });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy/Compat Routes
app.get("/api/firs/:status", authenticate, requirePolice, requirePermission('FIR_VIEW'), async (req, res) => {
  const { status } = req.params; // logic mapped...
  const mappedStatus = status === "pending" ? "pending_approval" : status;
  if (status === "approved") {
    res.json(await FinalFIR.find({ status: "approved" }).sort({ createdAt: -1 }));
  } else {
    res.json(await DraftFIR.find({ status: mappedStatus }).sort({ createdAt: -1 }));
  }
});

app.get("/api/notifications", authenticate, async (_req, res) => {
  const notes = await Notification.find().sort({ timestamp: -1 }).limit(20);
  res.json(notes);
});

app.get("/api/fir/pdf/:id", authenticate, requirePolice, requirePermission('FIR_VIEW'), async (req, res) => {
  let fir = await DraftFIR.findById(req.params.id) || await FinalFIR.findById(req.params.id);
  if (!fir) return res.status(404).json({ error: "FIR not found" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=FIR_${fir.firNumber}.pdf`);
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.fontSize(16).text(`FIR Number: ${fir.firNumber}`, { underline: true });
  doc.end();
  doc.pipe(res);
});

app.post("/api/cases/search", authenticate, requirePolice, requirePermission('CASE_SEARCH'), async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    if (!query || !query.trim()) return res.status(400).json({ error: "Query required" });

    // Simple mock or real implementation
    // Original implementation had embedding logic, preserving simplify for brevity in this response but 
    // real implementation should be kept. I am reusing original structure logic.
    // For safety, I'll rely on the fact I'm replacing the file content, so I must include the REAL logic.

    // RE-INJECTING REAL SEARCH LOGIC CAREFULLY...
    const cases = await Case.find({ isSynthetic: true, embedding: { $exists: true } }).select('+embedding').limit(100);
    if (cases.length === 0) return res.json({ success: true, cases: [], count: 0 });

    const queryEmbedding = await generateEmbedding(query);
    const casesWithSimilarity = cases.map(c => ({
      id: c._id,
      title: c.title,
      firNumber: c.firNumber,
      status: c.status || 'unknown',
      ipcSections: c.ipcSections || [],
      station: c.station || null,
      similarity: cosineSimilarity(queryEmbedding, c.embedding)
    }))
      .filter(c => c.similarity > 0.1)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    res.json({ success: true, cases: casesWithSimilarity, count: casesWithSimilarity.length });
  } catch (error) {
    console.error('[Case Search] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

console.log("✅ Routes registered");

// 5️⃣ CONNECT TO MONGODB & START SERVER
const startServer = async () => {
  try {
    await mongoose.connect(MONGO, { dbName: "smart_fir" });
    console.log("✅ MongoDB Connected");

    // Initialize Admin (auto-seed if missing)
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }).select('+password');
    if (!existingAdmin) {
      await User.create({
        email: ADMIN_EMAIL.toLowerCase(),
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
        role: 'ADMIN',
        createdBy: null,
        status: 'ACTIVE'
      });
      console.log(`✅ Admin account created: ${ADMIN_EMAIL}`);
    } else {
      // make sure the admin has a usable password
      if (!existingAdmin.password || !existingAdmin.password.startsWith('$2')) {
        console.warn(`⚠️  Admin account exists but password is missing or not hashed. Resetting to default.`);
        existingAdmin.password = ADMIN_PASSWORD;
        await existingAdmin.save();
        console.log(`✅ Admin password initialized/updated for ${ADMIN_EMAIL}`);
      } else {
        console.log(`✅ Admin account ready: ${ADMIN_EMAIL}`);
      }
    }

    // 6️⃣ LISTEN (Crucial Step)
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error("❌ Startup Error:", error);
    process.exit(1);
  }
};

startServer();