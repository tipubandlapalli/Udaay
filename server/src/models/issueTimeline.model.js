import mongoose from "mongoose";

const issueTimelineSchema = new mongoose.Schema({
    issueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issue",
        required: true
    },
    status: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    actor: {
        type: String,
        enum: ["system", "officer", "citizen"],
        required: true
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: false // Using custom timestamp field
});

// Index for faster timeline queries
issueTimelineSchema.index({ issueId: 1, timestamp: -1 });

const IssueTimeline = mongoose.model("IssueTimeline", issueTimelineSchema);

export default IssueTimeline;
