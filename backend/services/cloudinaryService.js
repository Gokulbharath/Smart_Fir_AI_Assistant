/**
 * Cloudinary Service
 * 
 * Handles file uploads to Cloudinary cloud storage.
 * Configured using environment variables:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with credentials from .env file
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('[Cloudinary] Warning: Cloudinary credentials not found in environment variables');
  console.warn('[Cloudinary] Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
} else {
  console.log(`[Cloudinary] Configured with cloud name: ${cloudName}`);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true // Always use HTTPS
});

/**
 * Upload a file to Cloudinary
 * @param {Buffer} fileBuffer - File data as buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Cloudinary folder path (default: 'smart-fir/evidence')
 * @returns {Promise<Object>} Cloudinary upload result with URL and public_id
 */
export async function uploadToCloudinary(fileBuffer, fileName, folder = 'smart-fir/evidence') {
  try {
    console.log('[Cloudinary] Starting upload...', {
      fileName: fileName,
      bufferSize: fileBuffer.length,
      folder: folder
    });

    // Verify credentials are set (use module-level variables)
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured');
    }

    // Create a unique public_id using timestamp and original filename
    // Note: Don't include folder in public_id when folder option is used separately
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const publicId = `${Date.now()}_${sanitizedFileName}`;
    
    console.log('[Cloudinary] Uploading with public_id:', publicId, 'in folder:', folder);

    // Upload options
    const uploadOptions = {
      resource_type: 'auto', // Auto-detect: image, video, or raw (for PDFs)
      public_id: publicId,
      folder: folder, // Folder is set separately, don't include in public_id
      use_filename: false, // Use our custom public_id instead
      unique_filename: false,
      overwrite: false, // Don't overwrite existing files
      secure: true // Force HTTPS URLs
    };

    // Upload file using upload_stream
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Upload error:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name
            });
            reject(new Error(`Failed to upload file to Cloudinary: ${error.message}`));
          } else {
            console.log('[Cloudinary] Upload successful:', {
              public_id: result.public_id,
              url: result.secure_url,
              bytes: result.bytes,
              format: result.format
            });
            resolve({
              url: result.secure_url, // HTTPS URL
              publicId: result.public_id,
              format: result.format,
              bytes: result.bytes,
              width: result.width,
              height: result.height
            });
          }
        }
      );

      // Handle stream errors
      uploadStream.on('error', (error) => {
        console.error('[Cloudinary] Stream error:', error);
        reject(new Error(`Upload stream error: ${error.message}`));
      });

      // Write buffer to upload stream
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('[Cloudinary] Upload function error:', error);
    throw error;
  }
}

/**
 * Get a secure download URL for a file
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} Secure HTTPS URL
 */
export function getSecureUrl(publicId) {
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: 'auto'
  });
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto'
    });
    console.log(`[Cloudinary] Deleted: ${publicId}`);
    return result;
  } catch (error) {
    console.error('[Cloudinary] Delete error:', error);
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
}

