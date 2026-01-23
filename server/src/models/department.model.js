import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    zone: {
        type: String,
        required: true,
        trim: true
    },
    officerIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    description: {
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    contactPhone: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
departmentSchema.index({ name: 1 });
departmentSchema.index({ zone: 1 });
departmentSchema.index({ isActive: 1 });

const Department = mongoose.model("Department", departmentSchema);

export default Department;
