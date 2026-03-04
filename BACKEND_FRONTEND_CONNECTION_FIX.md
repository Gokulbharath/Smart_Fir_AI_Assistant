# Backend-Frontend Connection Fix

## Problem
- Frontend calls: `GET http://localhost:5000/api/evidence` → 404 Not Found
- Backend and frontend are not communicating

## Solution Steps

### Step 1: Verify Backend Server is Running
1. Check if backend is running on port 5000:
   ```bash
   netstat -ano | findstr :5000
   ```
   Should show Node.js process listening on port 5000

### Step 2: Restart Backend Server (CRITICAL)
The routes are configured correctly, but the server MUST be restarted to load them.

1. **Stop the current backend server:**
   - Go to the terminal where backend is running
   - Press `Ctrl+C` to stop it

2. **Restart the backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Verify in console output:**
   Look for these messages in order:
   ```
   [Evidence Routes] Router created and routes file loaded successfully
   [Server] Registering Evidence routes...
   [Server] Evidence routes registered at /api/evidence
   [Server] Available routes: GET /api/evidence, POST /api/evidence/upload, GET /api/evidence/download/:id
   ✅ Connected to MongoDB
   🚀 Express server running on port 5000
   ```

### Step 3: Test the Route
After restart, test in browser:
- Open: `http://localhost:5000/api/evidence`
- Should return: `{"success":true,"evidence":[],"count":0}`

Or test route:
- Open: `http://localhost:5000/api/evidence/test`
- Should return: `{"success":true,"message":"Evidence routes are working"}`

### Step 4: Verify Frontend Configuration
Frontend is already configured correctly:
- `frontend/src/api/evidenceService.ts` uses `http://localhost:5000/api`
- No changes needed to frontend

### Step 5: Restart Frontend (if needed)
If frontend was running, restart it to ensure fresh connection:
```bash
cd frontend
# Stop with Ctrl+C
npm run dev
```

## Verification Checklist

✅ Backend server running on port 5000
✅ Console shows "Evidence routes registered"
✅ Browser test: `http://localhost:5000/api/evidence` returns JSON
✅ Frontend calls: `http://localhost:5000/api/evidence`
✅ No 404 errors in browser console

## If Still Not Working

1. **Check backend console for errors:**
   - Look for any import errors
   - Look for MongoDB connection errors
   - Look for route registration errors

2. **Check if routes are actually being called:**
   - When you access `/api/evidence`, check backend console
   - Should see: `[Evidence Routes] GET / route handler called`
   - If you don't see this, routes aren't being matched

3. **Verify port:**
   - Backend console should say: `🚀 Express server running on port 5000`
   - If it says port 4000, check `.env` file has `PORT=5000`

## Current Configuration

- **Backend Port:** 5000 (from `.env` file)
- **Frontend API Base:** `http://localhost:5000/api`
- **Routes File:** `backend/routes/evidenceRoutes.js`
- **Route Registration:** `app.use("/api/evidence", evidenceRoutes)`

Everything is configured correctly. The server just needs to be restarted to load the routes.



