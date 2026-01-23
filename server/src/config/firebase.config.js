import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseInitialized = false;

try {
    let serviceAccount;
    
    try {
        const serviceAccountPath = join(__dirname, "serviceAccountKey.json");
        serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
    } catch (fileError) {
        if (process.env.FIREBASE_PROJECT_ID) {
            serviceAccount = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: process.env.FIREBASE_CERT_URL
            };
        } else {
            console.warn("\nFirebase credentials not found - Running in DEV MODE");
            console.warn("   Phone authentication will be bypassed for testing");
            console.warn("   To enable Firebase:");
            console.warn("      1. Download serviceAccountKey.json from Firebase Console");
            console.warn("      2. Place it in: server/src/config/serviceAccountKey.json");
            console.warn("      OR set environment variables in .env\n");
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        firebaseInitialized = true;
        console.log("Firebase Admin initialized successfully");
    }

} catch (error) {
    console.error("Firebase initialization error:", error.message);
    console.warn("   Running in DEV MODE - Authentication features will be limited\n");
}

export { admin as default, firebaseInitialized };
