import mongoose from 'mongoose';

// Draft FIR Schema - stored in draft_firs collection
const draftFIRSchema = new mongoose.Schema({
  caseDescription: { type: String, default: "" },
  ipcPredictions: [{ 
    section: String,
    offense: String,
    punishment: String,
    confidence: Number
  }],
  status: { 
    type: String, 
    enum: ['draft', 'pending_approval'], 
    default: 'draft' 
  },
  firNumber: { type: String, unique: true },
  victim: String,
  accused: String,
  incident: String,
  date: String,
  time: String,
  location: String,
  description: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  collection: 'draft_firs',
  versionKey: false 
});

// Final FIR Schema - stored in final_firs collection
const finalFIRSchema = new mongoose.Schema({
  caseDescription: { type: String, default: "" },
  ipcPredictions: [{ 
    section: String,
    offense: String,
    punishment: String,
    confidence: Number
  }],
  status: { 
    type: String, 
    enum: ['approved'], 
    default: 'approved' 
  },
  firNumber: { type: String, required: true, unique: true },
  victim: String,
  accused: String,
  incident: String,
  date: String,
  time: String,
  location: String,
  description: String,
  createdBy: String,
  approvedBy: String,
  approvedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  collection: 'final_firs',
  versionKey: false 
});

// Create indexes for better query performance
draftFIRSchema.index({ status: 1, createdAt: -1 });
draftFIRSchema.index({ caseDescription: 'text' });
finalFIRSchema.index({ status: 1, createdAt: -1 });
finalFIRSchema.index({ caseDescription: 'text' });

export const DraftFIR = mongoose.model('DraftFIR', draftFIRSchema);
export const FinalFIR = mongoose.model('FinalFIR', finalFIRSchema);
