# Evidence Management 404 Error - FIXED

## Problem
- Frontend was trying to connect to `http://127.0.0.1:5000/api/evidence`
- Backend is configured to run on port 4000 (default)
- Backend server was not running
- Port mismatch between frontend and backend

## Fixes Applied

### 1. Updated Vite Proxy Configuration
**File:** `frontend/vite.config.ts`
- Changed proxy target from `http://localhost:5000` to `http://localhost:4000`
- This allows frontend to proxy `/api/*` requests to the correct backend port

### 2. Updated Evidence Service
**File:** `frontend/src/api/evidenceService.ts`
- Changed API_BASE from `http://127.0.0.1:5000/api` to `/api`
- Now uses relative URLs which leverage the Vite proxy

## Next Steps

### 1. Start Backend Server
```bash
cd backend
npm run dev
```

The backend should start on port 4000 (or the port specified in `backend/.env`).

### 2. Restart Frontend
Stop the frontend dev server (Ctrl+C) and restart:
```bash
cd frontend
npm run dev
```

This will pick up the new Vite proxy configuration.

### 3. Verify Backend is Running
Check the backend console for:
```
🚀 Express server running on port 4000
✅ Connected to MongoDB
☁️  Cloudinary: Configured (your_cloud_name)
```

### 4. Test Evidence Endpoints
- Open browser DevTools (F12)
- Go to Evidence Locker page
- Check Network tab - requests should go to `/api/evidence` (proxied to port 4000)
- Try uploading a file

## Verification

After restarting both servers, you should see:
- ✅ No 404 errors in browser console
- ✅ Evidence list loads (even if empty)
- ✅ Upload button works
- ✅ Backend logs show evidence requests

## If Still Getting 404

1. **Check Backend is Running:**
   ```bash
   # Check if port 4000 is in use
   netstat -ano | findstr :4000
   ```

2. **Check Backend Port:**
   - Look at backend console output
   - Should say "Express server running on port 4000"
   - If different, update `frontend/vite.config.ts` proxy target

3. **Check Backend Routes:**
   - Backend console should show evidence route logs when you make requests
   - If no logs, routes might not be registered

4. **Check Vite Proxy:**
   - Frontend console should not show CORS errors
   - Network requests should show `/api/evidence` (not `127.0.0.1:5000`)

## Backend Logs to Watch For

When you access Evidence Locker, you should see:
```
[Evidence List] ========== LIST REQUEST STARTED ==========
[Evidence List] Query params: {}
[Evidence List] Found X evidence files in database
[Evidence List] ========== LIST REQUEST COMPLETED ==========
```

When you upload a file, you should see:
```
[Evidence Upload] ========== UPLOAD REQUEST STARTED ==========
[Multer] File received: filename.pdf, MIME type: application/pdf
[Evidence Upload] Processing file: ...
[Cloudinary] Successfully uploaded: ...
[Evidence Upload] Successfully saved to MongoDB: ...
```



