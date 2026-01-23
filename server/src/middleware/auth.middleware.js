import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

 
export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this");

        req.user = decoded;

        const user = await User.findById(decoded.userId || decoded._id).select("-__v");
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.userDetails = user;
        next();

    } catch (error) {
        console.error("Auth middleware error:", error);
        
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired, please login again"
            });
        }
        
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed",
            error: error.message
        });
    }
};

 
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }

        next();
    };
};
 
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this");
            req.user = decoded;
            
            const user = await User.findById(decoded.userId || decoded._id).select("-__v");
            if (user) {
                req.userDetails = user;
            }
        }

        next();

    } catch (error) { 
        next();
    }
};

// Export verifyToken as an alias for protect for backward compatibility
export const verifyToken = protect;
