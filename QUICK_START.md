# Quick Start Guide - Fix Connection Refused Error

## 🔴 Problem: ERR_CONNECTION_REFUSED on Port 4000

**Error**: `GET http://127.0.0.1:4000/api/fir/drafts net::ERR_CONNECTION_REFUSED`

**Cause**: Backend server is not running on port 4000

---

## ✅ Solution: Start the Backend Server

### Step 1: Check Backend Configuration

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Check if `.env` file exists:
   ```bash
   # Windows PowerShell
   Test-Path .env
   
   # If false, create .env file with:
   ```

3. Create/Update `.env` file with:
   ```env
   MONGODB_URI=mongodb://localhost:27017/smart_fir
   PORT=4000
   FRONTEND_ORIGIN=http://localhost:5173
   LAWGPT_API_URL=http://127.0.0.1:5000
   GEMINI_API_KEY=your_gemini_key_here
   ```

### Step 2: Ensure MongoDB is Running

**Check if MongoDB is running:**
```bash
# Windows - Check MongoDB service
Get-Service MongoDB

# Or try to connect
mongosh
```

**If MongoDB is not running:**
- Start MongoDB service
- Or use MongoDB Atlas connection string in `.env`

### Step 3: Install Dependencies (if needed)

```bash
cd backend
npm install
```

### Step 4: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 Express server running on port 4000
📡 LawGPT API: http://127.0.0.1:5000
🌐 Frontend: http://localhost:5173
📊 MongoDB: Configured
```

### Step 5: Verify Server is Running

**Test the health endpoint:**
```bash
# In browser or curl
http://127.0.0.1:4000/api/health
```

**Should return:**
```json
{
  "ok": true,
  "port": 4000,
  "message": "Server is running"
}
```

---

## 🔍 Troubleshooting

### Issue 1: Port 4000 Already in Use

**Error**: `EADDRINUSE: address already in use :::4000`

**Solution**:
```bash
# Find process using port 4000
netstat -ano | findstr :4000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change PORT in .env to another port (e.g., 4001)
```

### Issue 2: MongoDB Connection Error

**Error**: `❌ MongoDB connection error`

**Solutions**:
1. **Local MongoDB**: Ensure MongoDB service is running
2. **MongoDB Atlas**: Use connection string from Atlas dashboard
3. **Check MONGODB_URI** in `.env` file

### Issue 3: Missing Dependencies

**Error**: `Cannot find module`

**Solution**:
```bash
cd backend
npm install
```

### Issue 4: Backend Starts but Frontend Still Can't Connect

**Check**:
1. ✅ Backend is running on port 4000 (check console output)
2. ✅ Frontend `.env` has `VITE_API_BASE=http://127.0.0.1:4000/api`
3. ✅ Restart frontend after changing `.env`
4. ✅ Check browser console for CORS errors

---

## 📋 Complete Startup Sequence

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3: MongoDB (if running locally)
```bash
# MongoDB should be running as a service
# Or start manually if needed
```

---

## 🎯 Quick Verification Checklist

- [ ] Backend server is running (check terminal output)
- [ ] Port 4000 is listening (check `netstat -ano | findstr :4000`)
- [ ] MongoDB is connected (check backend console for ✅)
- [ ] Frontend is running on port 5173
- [ ] Health endpoint works: `http://127.0.0.1:4000/api/health`
- [ ] No CORS errors in browser console

---

## 🔧 Port Configuration Summary

| Service | Port | Config File |
|---------|------|-------------|
| Backend (Express) | 4000 | `backend/.env` → `PORT=4000` |
| Frontend (Vite) | 5173 | `frontend/vite.config.ts` |
| LawGPT (Python) | 5000 | `backend/.env` → `LAWGPT_API_URL` |
| MongoDB | 27017 | `backend/.env` → `MONGODB_URI` |

---

## 💡 Common Mistakes

1. **Starting frontend before backend** → Start backend first
2. **Wrong port in .env** → Ensure `PORT=4000` in backend `.env`
3. **MongoDB not running** → Start MongoDB service
4. **Frontend not restarted after .env change** → Restart frontend dev server
5. **Using port 5000 for backend** → Backend should use 4000, 5000 is for LawGPT

---

**After following these steps, the connection refused error should be resolved!**

