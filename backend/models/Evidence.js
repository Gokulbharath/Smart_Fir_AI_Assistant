import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
    caseId: {
        type: String, // Can be FIR ID or generic Case ID
        default: null,
        index: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['image', 'video', 'pdf', 'document', 'audio', 'other'],
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        default: ''
    },
    uploadedBy: {
        type: String,
        required: true
    },
    cloudinaryUrl: {
        type: String,
        required: true
    },
    cloudinaryPublicId: {
        type: String,
        required: true
    },
    isEncrypted: {
        type: Boolean,
        default: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // This adds createdAt (and updatedAt) which we can use interchangeably with uploadedAt if needed
    versionKey: false
});

// Text index for search
evidenceSchema.index({ fileName: 'text', description: 'text', tags: 'text' });
evidenceSchema.index({ uploadedAt: -1 });

export const Evidence = mongoose.model('Evidence', evidenceSchema);
