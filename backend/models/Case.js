import mongoose from 'mongoose';

/**
 * Case Schema - Synthetic FIR Case Data for Similarity Search
 * 
 * IMPORTANT: This collection stores SYNTHETIC data only.
 * All case data is generated for academic/research purposes.
 * No real FIR records or personal information are stored.
 */

const caseSchema = new mongoose.Schema({
  firId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firNumber: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    index: 'text'
  },
  description: {
    type: String,
    required: true,
    index: 'text'
  },
  ipcSections: [{
    type: String,
    required: true
  }],
  location: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  officer: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Closed', 'Investigating', 'Pending'],
    required: true,
    index: true
  },
  // Vector embedding for similarity search (stored as array of numbers)
  embedding: {
    type: [Number],
    select: false // Don't return embeddings by default to save bandwidth
  },
  // Metadata
  isSynthetic: {
    type: Boolean,
    default: true, // Always true - all data is synthetic
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'synthetic_cases',
  versionKey: false
});

// Compound indexes for common queries
caseSchema.index({ status: 1, date: -1 });
caseSchema.index({ location: 1, status: 1 });
caseSchema.index({ ipcSections: 1 });

// Text search index on title and description
caseSchema.index({ title: 'text', description: 'text' });

export const Case = mongoose.model('Case', caseSchema);

