import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import { DraftFIR, FinalFIR } from "./models/FIR.js";
import { predictIPCSections, generateFIRNumber } from "./services/lawGPTService.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const MONGO = process.env.MONGODB_URI;

if (!MONGO) { 
  console.error("Missing MONGODB_URI"); 
  process.exit(1); 
}

app.use(cors({ origin: FRONTEND }));
app.use(express.json());

// Connect to MongoDB
try {
  await mongoose.connect(MONGO, { dbName: "smart_fir" });
  console.log("✅ Connected to MongoDB");
} catch (error) {
  console.error("❌ MongoDB connection error:", error.message);
  process.exit(1);
}

// Notification schema (kept for backward compatibility)
const notificationSchema = new mongoose.Schema({
  firId: String,
  message: String,
  type: { type: String, enum: ["submission","approval","rejection"], default: "submission" },
  timestamp: { type: Date, default: Date.now },
}, { versionKey: false });

const Notification = mongoose.model("Notification", notificationSchema);

// ============================================
// ROUTES
// ============================================

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, port: PORT, message: "Server is running" });
});

// Counts by status (define early to avoid conflict with /api/firs/:status)
app.get("/api/firs/counts", async (_req, res) => {
  try {
    const [draftCounts, finalCounts] = await Promise.all([
      DraftFIR.aggregate([{ $group: { _id: "$status", total: { $sum: 1 } } }]),
      FinalFIR.countDocuments({ status: "approved" })
    ]);
    const out = { draft: 0, pending_approval: 0, pending: 0, approved: finalCounts, rejected: 0 };
    draftCounts.forEach(c => {
      if (c._id === "pending_approval") {
        out.pending_approval = c.total;
        out.pending = c.total; // Backward compatibility
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

/**
 * POST /api/fir/create
 * Create a new draft FIR and auto-fetch predicted IPCs using LawGPT API
 */
app.post("/api/fir/create", async (req, res) => {
  try {
    const { caseDescription, description, victim, accused, incident, date, time, location, createdBy } = req.body;
    
    // Use caseDescription or description as the main text for LawGPT
    const caseText = caseDescription || description || incident || "";
    
    if (!caseText.trim()) {
      return res.status(400).json({ error: "Case description is required" });
    }

    console.log(`[API] Creating new draft FIR with case description (${caseText.length} chars)`);

    // Call LawGPT API to get IPC predictions
    let ipcPredictions = [];
    try {
      ipcPredictions = await predictIPCSections(caseText);
      console.log(`[API] Received ${ipcPredictions.length} IPC predictions from LawGPT`);
    } catch (error) {
      console.warn(`[API] LawGPT unavailable, creating draft without predictions: ${error.message}`);
      // Continue without predictions - allow draft creation even if LawGPT is down
    }

    // Generate FIR number
    const firNumber = generateFIRNumber();

    // Create draft FIR
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

    console.log(`[API] Draft FIR created: ${draftFIR.firNumber} (ID: ${draftFIR._id})`);

    res.json({ 
      success: true, 
      fir: draftFIR,
      message: "Draft FIR created successfully with IPC predictions"
    });

  } catch (error) {
    console.error("[API] Error creating draft FIR:", error);
    res.status(500).json({ error: error.message || "Failed to create draft FIR" });
  }
});

/**
 * GET /api/fir/drafts
 * Get all draft FIRs
 */
app.get("/api/fir/drafts", async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    } else {
      // Default: show both draft and pending_approval
      query.status = { $in: ['draft', 'pending_approval'] };
    }

    // Text search on caseDescription
    if (search) {
      query.$or = [
        { caseDescription: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { firNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const drafts = await DraftFIR.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    console.log(`[API] Retrieved ${drafts.length} draft FIRs`);
    res.json({ success: true, drafts, count: drafts.length });

  } catch (error) {
    console.error("[API] Error fetching drafts:", error);
    res.status(500).json({ error: error.message || "Failed to fetch draft FIRs" });
  }
});

/**
 * GET /api/fir/:id
 * Get single FIR details (checks both draft and final collections)
 */
// NOTE: Define specific routes before the dynamic ":id" route to avoid conflicts

/**
 * PUT /api/fir/update/:id
 * Edit an existing draft FIR
 */
app.put("/api/fir/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    // Remove fields that shouldn't be updated directly
    delete updateData.status; // Status should only change via specific routes
    delete updateData.createdAt;
    delete updateData._id;

    // If caseDescription is updated, re-fetch IPC predictions
    if (updateData.caseDescription || updateData.description) {
      const caseText = updateData.caseDescription || updateData.description || "";
      if (caseText.trim()) {
        try {
          const newPredictions = await predictIPCSections(caseText);
          updateData.ipcPredictions = newPredictions;
          console.log(`[API] Updated IPC predictions for FIR ${id}`);
        } catch (error) {
          console.warn(`[API] Could not update IPC predictions: ${error.message}`);
          // Continue without updating predictions
        }
      }
    }

    // Normalize ipcSections if it's a string
    if (typeof updateData.ipcSections === 'string') {
      updateData.ipcSections = updateData.ipcSections.split(',').map(s => s.trim()).filter(Boolean);
    }

    const fir = await DraftFIR.findByIdAndUpdate(id, updateData, { new: true });

    if (!fir) {
      return res.status(404).json({ error: "Draft FIR not found" });
    }

    console.log(`[API] Updated draft FIR: ${fir.firNumber}`);
    res.json({ success: true, fir, message: "Draft FIR updated successfully" });

  } catch (error) {
    console.error("[API] Error updating FIR:", error);
    res.status(500).json({ error: error.message || "Failed to update FIR" });
  }
});

/**
 * POST /api/fir/send-for-approval/:id
 * Change status from draft → pending_approval
 */
app.post("/api/fir/send-for-approval/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const fir = await DraftFIR.findByIdAndUpdate(
      id,
      { 
        status: "pending_approval",
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!fir) {
      return res.status(404).json({ error: "FIR not found" });
    }

    // Create notification
    await Notification.create({
      firId: String(fir._id),
      message: `FIR ${fir.firNumber} submitted for approval`,
      type: "submission",
    });

    console.log(`[API] FIR ${fir.firNumber} sent for approval`);
    res.json({ 
      success: true, 
      fir,
      message: "FIR submitted for approval"
    });

  } catch (error) {
    console.error("[API] Error sending FIR for approval:", error);
    res.status(500).json({ error: error.message || "Failed to send FIR for approval" });
  }
});

/**
 * POST /api/fir/approve/:id
 * Move FIR from pending_approval to approved and store in final_firs
 */
app.post("/api/fir/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    // Find the draft FIR
    const draftFIR = await DraftFIR.findById(id);

    if (!draftFIR) {
      return res.status(404).json({ error: "FIR not found" });
    }

    if (draftFIR.status !== "pending_approval") {
      return res.status(400).json({ error: "FIR must be in pending_approval status to be approved" });
    }

    // Create final FIR document
    const finalFIR = await FinalFIR.create({
      firNumber: draftFIR.firNumber,
      caseDescription: draftFIR.caseDescription,
      description: draftFIR.description,
      ipcPredictions: draftFIR.ipcPredictions,
      status: "approved",
      victim: draftFIR.victim,
      accused: draftFIR.accused,
      incident: draftFIR.incident,
      date: draftFIR.date,
      time: draftFIR.time,
      location: draftFIR.location,
      createdBy: draftFIR.createdBy,
      approvedBy: approvedBy || "inspector",
      approvedAt: new Date(),
      createdAt: draftFIR.createdAt,
      updatedAt: new Date()
    });

    // Delete from draft collection
    await DraftFIR.findByIdAndDelete(id);

    // Create notification
    await Notification.create({
      firId: String(finalFIR._id),
      message: `FIR ${finalFIR.firNumber} approved and finalized`,
      type: "approval",
    });

    console.log(`[API] FIR ${finalFIR.firNumber} approved and moved to final_firs`);
    res.json({ 
      success: true, 
      fir: finalFIR,
      message: "FIR approved and finalized successfully"
    });

  } catch (error) {
    console.error("[API] Error approving FIR:", error);
    res.status(500).json({ error: error.message || "Failed to approve FIR" });
  }
});

/**
 * GET /api/fir/final
 * Get all approved/final FIRs
 */
app.get("/api/fir/final", async (req, res) => {
  try {
    const { search } = req.query;
    let query = { status: "approved" };

    if (search) {
      query.$or = [
        { caseDescription: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { firNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const finalFIRs = await FinalFIR.find(query)
      .sort({ approvedAt: -1 })
      .limit(100);

    console.log(`[API] Retrieved ${finalFIRs.length} final FIRs`);
    res.json({ success: true, firs: finalFIRs, count: finalFIRs.length });

  } catch (error) {
    console.error("[API] Error fetching final FIRs:", error);
    res.status(500).json({ error: error.message || "Failed to fetch final FIRs" });
  }
});

/**
 * GET /api/fir/pending
 * Get all pending approval FIRs (for admin dashboard)
 */
app.get("/api/fir/pending", async (req, res) => {
  try {
    const pending = await DraftFIR.find({ status: "pending_approval" })
      .sort({ createdAt: -1 });

    console.log(`[API] Retrieved ${pending.length} pending FIRs`);
    res.json({ success: true, firs: pending, count: pending.length });

  } catch (error) {
    console.error("[API] Error fetching pending FIRs:", error);
    res.status(500).json({ error: error.message || "Failed to fetch pending FIRs" });
  }
});

// Get single FIR details (checks both draft and final collections)
app.get("/api/fir/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId to avoid treating strings like "pending" as IDs
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid FIR id" });
    }

    // Check draft FIRs first
    let fir = await DraftFIR.findById(id);
    
    // If not found, check final FIRs
    if (!fir) {
      fir = await FinalFIR.findById(id);
    }

    if (!fir) {
      return res.status(404).json({ error: "FIR not found" });
    }

    res.json({ success: true, fir });

  } catch (error) {
    console.error("[API] Error fetching FIR:", error);
    res.status(500).json({ error: error.message || "Failed to fetch FIR" });
  }
});

// ============================================
// BACKWARD COMPATIBILITY ROUTES
// ============================================

// Legacy route: create-draft (maps to /api/fir/create)
app.post("/api/fir/create-draft", async (req, res) => {
  try {
    // Ensure required fields are present
    const body = { 
      ...req.body, 
      status: "draft", 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    
    // Generate FIR number if not provided
    if (!body.firNumber) {
      body.firNumber = generateFIRNumber();
    }
    
    // Ensure caseDescription is set (required by schema)
    if (!body.caseDescription) {
      body.caseDescription = body.description || body.incident || "No description provided";
    }
    
    // Ensure ipcPredictions is an array if not provided
    if (!body.ipcPredictions) {
      body.ipcPredictions = [];
    }
    
    const fir = await DraftFIR.create(body);
    await Notification.create({
      firId: String(fir._id),
      message: `FIR ${fir.firNumber} saved as draft`,
      type: "submission"
    });
    res.json({ success: true, fir });
  } catch (e) {
    console.error("[API] Error in create-draft:", e);
    res.status(500).json({ error: e.message || "Create draft failed" });
  }
});

// Legacy route: submit (maps to send-for-approval)
app.put("/api/fir/submit/:id", async (req, res) => {
  try {
    const fir = await DraftFIR.findByIdAndUpdate(
      req.params.id,
      { status: "pending_approval", updatedAt: new Date() },
      { new: true }
    );
    if (!fir) return res.status(404).json({ error: "FIR not found" });
    await Notification.create({
      firId: String(fir._id),
      message: `FIR ${fir.firNumber} submitted for inspector approval`,
      type: "submission"
    });
    res.json({ success: true, fir });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Legacy route: list by status
app.get("/api/firs/:status", async (req, res) => {
  const { status } = req.params;
  if (!["draft", "pending_approval", "pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  
  // Map legacy "pending" to "pending_approval"
  const mappedStatus = status === "pending" ? "pending_approval" : status;
  
  if (status === "approved") {
    const items = await FinalFIR.find({ status: "approved" }).sort({ createdAt: -1 });
    res.json(items);
  } else {
    const items = await DraftFIR.find({ status: mappedStatus }).sort({ createdAt: -1 });
    res.json(items);
  }
});

// Legacy route: approve
app.put("/api/fir/:id/approve", async (req, res) => {
  try {
    const draftFIR = await DraftFIR.findById(req.params.id);
    if (!draftFIR) return res.status(404).json({ error: "FIR not found" });

    const finalFIR = await FinalFIR.create({
      ...draftFIR.toObject(),
      status: "approved",
      approvedBy: "inspector",
      approvedAt: new Date()
    });
    
    await DraftFIR.findByIdAndDelete(req.params.id);
    await Notification.create({ 
      firId: String(finalFIR._id), 
      message: `FIR ${finalFIR.firNumber} approved`, 
      type: "approval" 
    });
    res.json({ success: true, fir: finalFIR });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Legacy route: reject (send back to draft)
app.put("/api/fir/:id/reject", async (req, res) => {
  const fir = await DraftFIR.findByIdAndUpdate(
    req.params.id,
    { status: "draft", updatedAt: new Date() },
    { new: true }
  );
  if (!fir) return res.status(404).json({ error: "FIR not found" });
  await Notification.create({ 
    firId: String(fir._id), 
    message: `FIR ${fir.firNumber} sent back to draft`, 
    type: "rejection" 
  });
  res.json({ success: true, fir });
});

// Delete a draft FIR (only when status is 'draft')
app.delete("/api/fir/draft/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid FIR id" });
    }
    const draft = await DraftFIR.findById(id);
    if (!draft) return res.status(404).json({ error: "FIR not found" });
    const deletableStatuses = ["draft", "pending_approval", "pending"]; // include legacy 'pending'
    if (!deletableStatuses.includes(draft.status)) {
      return res.status(400).json({ error: "Only draft or pending approval FIRs can be deleted" });
    }
    await DraftFIR.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    console.error("[API] Error deleting draft:", e);
    res.status(500).json({ error: e.message || "Failed to delete draft" });
  }
});

// Legacy route: counts (kept above earlier; remove duplicate to prevent redefinition)

// Notifications
app.get("/api/notifications", async (_req, res) => {
  const notes = await Notification.find().sort({ timestamp: -1 }).limit(20);
  res.json(notes);
});

// PDF generation
app.get("/api/fir/pdf/:id", async (req, res) => {
  let fir = await DraftFIR.findById(req.params.id);
  if (!fir) fir = await FinalFIR.findById(req.params.id);
  if (!fir) return res.status(404).json({ error: "FIR not found" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=FIR_${fir.firNumber}.pdf`);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.fontSize(16).text(`FIR Number: ${fir.firNumber}`, { underline: true }).moveDown();
  
  ["victim", "accused", "incident", "date", "time", "location"].forEach((k) => {
    doc.fontSize(12).text(`${k[0].toUpperCase() + k.slice(1)}: ${fir[k] || ""}`);
  });
  
  doc.moveDown().fontSize(13).text("IPC Sections:");
  if (fir.ipcPredictions && fir.ipcPredictions.length > 0) {
    fir.ipcPredictions.forEach((pred) => {
      doc.text(`• ${pred.section}: ${pred.offense} (${pred.punishment})`);
    });
  } else if (fir.ipcSections) {
    fir.ipcSections.forEach((s) => doc.text(`• ${s}`));
  }
  
  doc.moveDown().fontSize(13).text("Description:");
  doc.fontSize(11).text(fir.description || fir.caseDescription || "", { align: "left" });
  doc.end();
  doc.pipe(res);
});

// Start server
// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Server] Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err);
  process.exit(1);
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error("[Server] Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log(`📡 LawGPT API: ${process.env.LAWGPT_API_URL || 'http://127.0.0.1:5000'}`);
  console.log(`🌐 Frontend: ${FRONTEND}`);
  console.log(`📊 MongoDB: ${MONGO ? 'Configured' : 'Not configured'}`);
});

server.on('error', (err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});