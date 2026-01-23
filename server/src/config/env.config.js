import dotenv from "dotenv"

dotenv.config();

const config = {
    PORT : process.env.PORT || 8000,
    NODE_ENV : process.env.ENV || "dev",
    MONGO_URI : process.env.MONGO_URI,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "AIzaSyCfLUe8Zr8pL4YfP2pdKYAPUrbK7mLz9qw",
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_BUCKET_NAME: process.env.GOOGLE_CLOUD_BUCKET_NAME,
    GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE
}

export default config;