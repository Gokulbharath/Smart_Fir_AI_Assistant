# Evidence Management Setup Guide

This guide will help you set up Evidence Management with Cloudinary in your Smart FIR AI Assistant project.

## Prerequisites

1. **Cloudinary Account**: Sign up for a free account at [cloudinary.com](https://cloudinary.com)
2. **Cloudinary Credentials**: Get your Cloud Name, API Key, and API Secret from your Cloudinary dashboard

## Backend Setup

### 1. Install Dependencies

Dependencies are already installed. If needed, run:
```bash
cd backend
npm install cloudinary multer
```

### 2. Configure Environment Variables

Add the following to your `backend/.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**How to get Cloudinary credentials:**
1. Log in to [Cloudinary Dashboard](https://console.cloudinary.com)
2. Go to Dashboard → Account Details
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret

### 3. Restart Backend Server

After adding environment variables, restart your backend:
```bash
cd backend
npm run dev
```

## Frontend Setup

No additional setup needed! The frontend is already configured to use the Evidence Management APIs.

## API Endpoints

### POST /api/evidence/upload
Upload a file to Cloudinary and save metadata to MongoDB.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file` (required): File to upload
  - `uploadedBy` (required): Name of person uploading
  - `caseId` (optional): Case/FIR ID to link evidence
  - `description` (optional): Description of evidence
  - `tags` (optional): Comma-separated tags

**Response:**
```json
{
  "success": true,
  "evidence": {
    "id": "...",
    "name": "filename.pdf",
    "type": "document",
    "size": "2.1 MB",
    "uploadedBy": "Inspector Name",
    "uploadDate": "2025-01-15",
    "tags": ["tag1", "tag2"],
    "encrypted": true,
    "description": "...",
    "url": "https://res.cloudinary.com/..."
  }
}
```

### GET /api/evidence
Get all evidence files with optional filtering.

**Query Parameters:**
- `caseId` (optional): Filter by case ID
- `fileType` (optional): Filter by type (`image`, `video`, `pdf`)
- `search` (optional): Search in filename, description, or tags

**Response:**
```json
{
  "success": true,
  "evidence": [...],
  "count": 10
}
```

### GET /api/evidence/download/:id
Get secure download URL for evidence file (redirects to Cloudinary).

**Response:** Redirects to Cloudinary secure URL

## File Storage

- **Storage Location**: Cloudinary cloud storage
- **Folder**: `smart-fir/evidence/`
- **Supported Types**: Images (JPEG, PNG, GIF, WebP), Videos (MP4, MPEG, QuickTime, AVI), PDFs
- **Max File Size**: 100 MB
- **Security**: All files are stored with HTTPS URLs

## MongoDB Schema

Evidence metadata is stored in MongoDB with the following fields:
- `caseId`: Optional case/FIR reference
- `fileName`: Original filename
- `fileType`: `image`, `video`, or `pdf`
- `fileSize`: Size in bytes
- `tags`: Array of tags
- `description`: Evidence description
- `uploadedBy`: Name of uploader
- `uploadedAt`: Upload timestamp
- `cloudinaryUrl`: HTTPS URL to file
- `cloudinaryPublicId`: Cloudinary public ID
- `isEncrypted`: Always `true`

## Usage

1. **Upload Evidence:**
   - Click "Upload Evidence" button
   - Select a file (image, video, or PDF)
   - Enter your name
   - Add description and tags (optional)
   - Click "Upload"

2. **View Evidence:**
   - Click the eye icon to view file in new tab
   - Files open directly from Cloudinary

3. **Download Evidence:**
   - Click the download icon
   - File opens in new tab for download

4. **Search & Filter:**
   - Use search bar to find files by name or tags
   - Use filter dropdown to filter by file type

## Troubleshooting

### "Failed to upload file to Cloudinary"
- Check that Cloudinary credentials are correct in `.env`
- Verify your Cloudinary account is active
- Check file size (max 100 MB)

### "No file uploaded"
- Ensure you selected a file before clicking Upload
- Check file type is supported (images, videos, PDFs only)

### Files not appearing
- Check backend logs for errors
- Verify MongoDB connection
- Ensure backend server is running

## Security Notes

- All files are stored securely in Cloudinary
- HTTPS URLs are used for all file access
- Files are marked as encrypted in the database
- File access is controlled through the API

## Production Considerations

1. **File Size Limits**: Adjust `limits.fileSize` in `server.js` if needed
2. **Allowed File Types**: Modify `allowedMimes` array in `server.js` for additional types
3. **Authentication**: Add authentication middleware to protect upload endpoints
4. **Rate Limiting**: Consider adding rate limiting for upload endpoints
5. **Cloudinary Settings**: Configure Cloudinary upload presets for optimization



