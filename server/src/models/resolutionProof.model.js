import mongoose from "mongoose";

const resolutionProofSchema = new mongoose.Schema({
    issueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
        required: true
    },
    officerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    beforeImageUrl: {
        type: String,
        required: true
    },
    afterImageUrl: {
        type: String,
        required: true
    },
    geminiVerification: {
        result: {
            type: String,
            enum: ["PASS", "FAIL"],
            required: true
        },
        reason: {
            type: String,
            trim: true
        },
        confidenceScore: {
            type: Number,
            min: 0,
            max: 1
        }
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes
resolutionProofSchema.index({ issueId: 1 });
resolutionProofSchema.index({ officerId: 1 });
resolutionProofSchema.index({ uploadedAt: -1 });

const ResolutionProof = mongoose.model("ResolutionProof", resolutionProofSchema);

export default ResolutionProof;
