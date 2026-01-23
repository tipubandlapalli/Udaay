import express from "express"
import cors from "cors";
import helmet from "helmet";
import connectDb from "./db/connect.db.js";
import config from "./config/env.config.js";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import issueRoutes from "./routes/issue.routes.js";

const app = express();
const PORT = config.PORT;

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({
    limit: "10MB"
}));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "LakeCity API Server is running",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/issues", issueRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        error: config.NODE_ENV === "dev" ? err : {}
    });
});

await connectDb()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running: http://localhost:${PORT}`);
        console.log(`Environment: ${config.NODE_ENV}`);
    })
})
.catch((err)=>{
    console.log("Error Running server:", err);
})
