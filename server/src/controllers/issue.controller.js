import Issue from "../models/issue.model.js";
import { validateIssueWithAI, getLocationDetails } from "../services/ai.service.js";
import { uploadToGCS, uploadBase64ToGCS, isGCSConfigured } from "../services/storage.service.js";

// Submit new issue
export const submitIssue = async (req, res) => {
    try {
        let { title, description, category, location } = req.body;
        const userId = req.user.userId; // JWT contains userId, not _id
        let imageUrl = req.body.imageUrl;

        // Parse location if it's a JSON string (from FormData)
        if (typeof location === 'string') {
            try {
                location = JSON.parse(location);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid location format"
                });
            }
        }

        // Handle file upload from multipart form data
        if (req.file) {
            if (isGCSConfigured()) {
                try {
                    imageUrl = await uploadToGCS(
                        req.file.buffer,
                        req.file.originalname,
                        'issues',
                        req.file.mimetype
                    );
                } catch (gcsError) {
                    // Fallback to base64 if GCS upload fails
                    console.log('GCS upload failed, falling back to base64:', gcsError.message);
                    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
                    imageUrl = base64Image;
                }
            } else {
                // Fallback: Convert buffer to base64 if GCS not configured
                const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
                imageUrl = base64Image;
                console.log('GCS not configured - using base64 storage');
            }
        }
        // Handle base64 image upload
        else if (imageUrl && imageUrl.startsWith('data:image')) {
            if (isGCSConfigured()) {
                try {
                    imageUrl = await uploadBase64ToGCS(imageUrl, 'issues');
                } catch (gcsError) {
                    console.log('GCS upload failed, keeping base64:', gcsError.message);
                    // Keep the base64 as is if GCS fails
                }
            }
            // If GCS not configured, keep the base64 as is
        }

        if (!title || !description || !category || !imageUrl || !location) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const { lat, lng } = location;

        // Get location details from coordinates
        const locationDetails = await getLocationDetails(lat, lng);

        // Create issue with pending status
        const issue = await Issue.create({
            userId,
            title,
            description,
            category,
            imageUrl,
            location: {
                type: 'Point',
                coordinates: [lng, lat],
                lat,
                lng,
                ...locationDetails
            },
            status: "pending"
        });

        // Start AI validation in background
        validateAndUpdateIssue(issue._id, imageUrl, description, category);

        res.status(201).json({
            success: true,
            message: "Issue submitted successfully. AI validation in progress...",
            data: { issue }
        });
    } catch (error) {
        console.error("Error in submitIssue:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Background AI validation
async function validateAndUpdateIssue(issueId, imageUrl, description, category) {
    try {
        const validation = await validateIssueWithAI(imageUrl, description, category);

        const updateData = {
            'aiValidation.validated': true,
            'aiValidation.confidence': validation.confidence,
            'aiValidation.validatedAt': new Date(),
            'aiValidation.matchesDescription': validation.matchesDescription,
            'aiValidation.aiResponse': validation.aiResponse,
            detectedCategory: validation.detectedCategory,
            confidenceScore: validation.confidence
        };

        // If AI validates the image matches description, change status to live
        if (validation.matchesDescription && validation.confidence > 0.7) {
            updateData.status = "live";
        } else {
            updateData.status = "rejected";
        }

        await Issue.findByIdAndUpdate(issueId, updateData);
    } catch (error) {
        console.error("Error in validateAndUpdateIssue:", error);
        // Keep status as pending if validation fails
    }
}

// Get live issues (for map and issues list)
export const getLiveIssues = async (req, res) => {
    const startTime = Date.now();
    try {
        const { lat, lng, radius = 10000, category } = req.query; // radius in meters (default 10km)

        let query = { status: "live" };

        // Filter by category if provided
        if (category && category !== 'all') {
            query.category = category;
        }

        let issues;

        // Select only necessary fields for list view - include imageUrl
        const selectFields = '_id title description category status imageUrl location severity upvotes createdAt aiValidation.validated aiValidation.confidence detectedCategory';

        // If location provided, find nearby issues
        if (lat && lng) {
            issues = await Issue.find({
                ...query,
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        $maxDistance: parseFloat(radius)
                    }
                }
            })
            .select(selectFields)
            .lean()
            .sort({ createdAt: -1 })
            .limit(100);
        } else {
            // Get all live issues
            issues = await Issue.find(query)
                .select(selectFields)
                .lean()
                .sort({ createdAt: -1 })
                .limit(100);
        }

        res.status(200).json({
            success: true,
            count: issues.length,
            data: { issues }
        });
    } catch (error) {
        console.error("Error in getLiveIssues:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get user's issues
export const getUserIssues = async (req, res) => {
    try {
        const userId = req.user.userId; // JWT contains userId, not _id
        const { status } = req.query;

        let query = { userId };
        
        if (status) {
            query.status = status;
        }

        const issues = await Issue.find(query)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: issues.length,
            data: { issues }
        });
    } catch (error) {
        console.error("Error in getUserIssues:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get issue by ID
export const getIssueById = async (req, res) => {
    try {
        const { id } = req.params;

        const issue = await Issue.findById(id)
            .populate('userId', 'name phone city');

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.status(200).json({
            success: true,
            data: { issue }
        });
    } catch (error) {
        console.error("Error in getIssueById:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Upvote issue
export const upvoteIssue = async (req, res) => {
    try {
        const { id } = req.params;

        const issue = await Issue.findByIdAndUpdate(
            id,
            { $inc: { upvotes: 1 } },
            { new: true }
        );

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        res.status(200).json({
            success: true,
            data: { issue }
        });
    } catch (error) {
        console.error("Error in upvoteIssue:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete issue (only by owner)
export const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user._id;

        // Find issue
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found"
            });
        }

        // Check if user is the owner
        if (issue.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own issues"
            });
        }

        // Delete the issue
        await Issue.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Issue deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteIssue:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
