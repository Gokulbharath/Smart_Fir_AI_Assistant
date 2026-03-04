/**
 * Evidence Routes
 * 
 * Handles file uploads to Cloudinary and metadata storage in MongoDB.
 */

import express from "express";
import multer from "multer";
import { authenticate } from "../middleware/authMiddleware.js";
import { Evidence } from "../models/Evidence.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";

const router = express.Router();

// Configure Multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images, videos, and PDFs
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|avi|mov|pdf/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, videos, and PDF files are allowed'));
    }
  }
});

/**
 * Helper function to format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Helper function to determine file type from MIME type
 */
function getFileType(mimetype, fileName) {
  if (mimetype.startsWith('image/')) {
    return 'image';
  } else if (mimetype.startsWith('video/')) {
    return 'video';
  } else if (mimetype === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    return 'pdf';
  }
  return 'pdf'; // Default to PDF for unknown types
}

/**
 * Transform MongoDB document to frontend Evidence format
 */
function transformEvidence(doc) {
  return {
    id: doc._id.toString(),
    name: doc.fileName,
    type: doc.fileType === 'pdf' ? 'document' : doc.fileType, // Map 'pdf' to 'document'
    size: formatFileSize(doc.fileSize),
    uploadedBy: doc.uploadedBy,
    uploadDate: doc.uploadedAt.toISOString(),
    tags: doc.tags || [],
    encrypted: doc.isEncrypted !== false, // Default to true
    description: doc.description || '',
    url: doc.cloudinaryUrl
  };
}

/**
 * GET /api/evidence
 * Get all evidence files with optional filters
 */
router.get("/", authenticate, async (req, res) => {
  try {
    console.log('[Evidence] GET /api/evidence - Query params:', req.query);
    
    // Build MongoDB query
    const query = {};
    
    // Filter by caseId
    if (req.query.caseId) {
      query.caseId = req.query.caseId;
    }
    
    // Filter by fileType
    if (req.query.fileType) {
      query.fileType = req.query.fileType; // 'image', 'video', or 'pdf'
    }
    
    // Text search (if provided)
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Fetch evidence from MongoDB
    const evidenceDocs = await Evidence.find(query)
      .sort({ uploadedAt: -1 }) // Latest first
      .lean();
    
    console.log(`[Evidence] Found ${evidenceDocs.length} evidence documents`);
    
    // Transform to frontend format
    const evidence = evidenceDocs.map(transformEvidence);
    
    res.json({
      success: true,
      evidence: evidence
    });
  } catch (error) {
    console.error('[Evidence] GET error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch evidence'
    });
  }
});

/**
 * POST /api/evidence/upload
 * Upload a file to Cloudinary and save metadata to MongoDB
 */
router.post("/upload", authenticate, upload.single('file'), async (req, res) => {
  try {
    console.log('[Evidence] POST /api/evidence/upload');
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    console.log('[Evidence] File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    // Get form data
    const uploadedBy = req.body.uploadedBy || 'Unknown';
    const caseId = req.body.caseId || null;
    const description = req.body.description || '';
    const tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Determine file type
    const fileType = getFileType(req.file.mimetype, req.file.originalname);
    
    console.log('[Evidence] Uploading to Cloudinary...');
    console.log('[Evidence] File buffer size:', req.file.buffer.length, 'bytes');
    
    // Upload to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        'smart-fir/evidence'
      );
      console.log('[Evidence] Cloudinary upload successful:', cloudinaryResult.publicId);
    } catch (cloudinaryError) {
      console.error('[Evidence] Cloudinary upload failed:', cloudinaryError);
      return res.status(500).json({
        success: false,
        error: `Cloudinary upload failed: ${cloudinaryError.message}`
      });
    }
    
    // Create evidence document
    const evidenceDoc = new Evidence({
      caseId: caseId,
      fileName: req.file.originalname,
      fileType: fileType,
      fileSize: req.file.size,
      tags: tags,
      description: description,
      uploadedBy: uploadedBy,
      cloudinaryUrl: cloudinaryResult.url,
      cloudinaryPublicId: cloudinaryResult.publicId,
      isEncrypted: true
    });
    
    // Save to MongoDB
    const savedEvidence = await evidenceDoc.save();
    
    console.log('[Evidence] Saved to MongoDB:', savedEvidence._id);
    
    // Transform to frontend format
    const evidence = transformEvidence(savedEvidence);
    
    res.json({
      success: true,
      evidence: evidence
    });
  } catch (error) {
    console.error('[Evidence] POST /upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload evidence'
    });
  }
});

/**
 * GET /api/evidence/download/:id
 * Get download URL for evidence file (redirects to Cloudinary)
 */
router.get("/download/:id", authenticate, async (req, res) => {
  try {
    const evidenceId = req.params.id;
    
    // Find evidence in MongoDB
    const evidence = await Evidence.findById(evidenceId);
    
    if (!evidence) {
      return res.status(404).json({
        success: false,
        error: 'Evidence not found'
      });
    }
    
    // Redirect to Cloudinary URL
    res.redirect(evidence.cloudinaryUrl);
  } catch (error) {
    console.error('[Evidence] GET /download/:id error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get download URL'
    });
  }
});

export default router;
