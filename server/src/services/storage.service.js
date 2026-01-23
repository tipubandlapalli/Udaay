import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Cloud Storage
let storage;
let bucket;

try {
    // Option 1: Use service account key file (for development)
    if (process.env.GOOGLE_CLOUD_KEY_FILE) {
        storage = new Storage({
            keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        });
    } 
    // Option 2: Use application default credentials (for production/Cloud Run)
    else if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
        storage = new Storage({
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        });
    }
    
    if (storage && process.env.GOOGLE_CLOUD_BUCKET_NAME) {
        bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);
        console.log('Google Cloud Storage initialized successfully');
    } else {
        console.warn('Google Cloud Storage not configured - using local storage fallback');
    }
} catch (error) {
    console.error('Error initializing Google Cloud Storage:', error);
}

/**
 * Check if Google Cloud Storage is configured
 * @returns {boolean}
 */
export const isGCSConfigured = () => {
    return !!bucket;
};

/**
 * Upload file to Google Cloud Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original filename
 * @param {string} folder - Folder path (e.g., 'issues', 'profiles')
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadToGCS = async (fileBuffer, fileName, folder = 'uploads', mimeType) => {
    if (!bucket) {
        throw new Error('Google Cloud Storage is not configured');
    }

    try {
        // Generate unique filename
        const timestamp = Date.now();
        const uniqueFileName = `${folder}/${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Create file reference
        const file = bucket.file(uniqueFileName);

        // Upload file
        await file.save(fileBuffer, {
            metadata: {
                contentType: mimeType,
                metadata: {
                    firebaseStorageDownloadTokens: timestamp
                }
            },
            validation: 'md5'
        });

        // Get public URL (bucket must have public access configured)
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;
        
        console.log(`File uploaded successfully: ${publicUrl}`);
        return publicUrl;

    } catch (error) {
        console.error('Error uploading to GCS:', error);
        throw new Error('Failed to upload file to cloud storage');
    }
};

/**
 * Delete file from Google Cloud Storage
 * @param {string} fileUrl - Full URL of the file to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFromGCS = async (fileUrl) => {
    if (!bucket) {
        console.warn('Google Cloud Storage not configured - skipping delete');
        return false;
    }

    try {
        // Extract filename from URL
        const fileName = fileUrl.split(`${bucket.name}/`)[1];
        if (!fileName) {
            throw new Error('Invalid file URL');
        }

        await bucket.file(fileName).delete();
        console.log(`File deleted successfully: ${fileName}`);
        return true;

    } catch (error) {
        console.error('Error deleting from GCS:', error);
        return false;
    }
};

/**
 * Generate signed URL for temporary access
 * @param {string} fileName - File path in bucket
 * @param {number} expiresIn - Expiration time in minutes (default: 15)
 * @returns {Promise<string>} - Signed URL
 */
export const getSignedUrl = async (fileName, expiresIn = 15) => {
    if (!bucket) {
        throw new Error('Google Cloud Storage is not configured');
    }

    try {
        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + expiresIn * 60 * 1000, // Convert minutes to milliseconds
        };

        const [url] = await bucket.file(fileName).getSignedUrl(options);
        return url;

    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw new Error('Failed to generate signed URL');
    }
};

/**
 * Upload base64 image to GCS
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} folder - Folder path
 * @returns {Promise<string>} - Public URL
 */
export const uploadBase64ToGCS = async (base64Data, folder = 'uploads') => {
    try {
        // Extract mime type and data
        const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Invalid base64 data');
        }

        const mimeType = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');

        // Generate filename based on mime type
        const extension = mimeType.split('/')[1];
        const fileName = `image.${extension}`;

        return await uploadToGCS(buffer, fileName, folder, mimeType);

    } catch (error) {
        console.error('Error uploading base64 to GCS:', error);
        throw new Error('Failed to upload base64 image');
    }
};

export default {
    uploadToGCS,
    deleteFromGCS,
    getSignedUrl,
    uploadBase64ToGCS
};
