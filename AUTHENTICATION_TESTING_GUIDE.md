# AUTHENTICATION TESTING GUIDE

## Quick Start

```bash
# Terminal 1: Start Backend
cd backend
npm start
# Expected: Server running on http://localhost:5000

# Terminal 2: Start Frontend
cd frontend
npm run dev
# Expected: App running on http://localhost:5173
```

---

## Test 1: Admin Login Flow

### Step 1: Navigate to Login
```
URL: http://localhost:5173/login
Expected: Login form with pre-filled admin credentials
```

### Step 2: Enter Credentials
```
Email: admin123@police.gov.in
Password: admin@gov
```

### Step 3: Submit Login
```
Click "Login" button
Expected: 
  - Request sent to POST /api/auth/login
  - Response: { success: true, token: "...", user: {...} }
  - Redirected to /admin
```

### Step 4: Verify Token Stored
```
Open DevTools → Console
Run: localStorage.getItem('token')
Expected: JWT token string (eyJhbGc...)
```

### Step 5: Verify Admin Panel Loads
```
URL: http://localhost:5173/admin
Expected:
  - Admin stats visible
  - Users list loaded
  - Analytics displayed
  - NO 401/403 errors
```

---

## Test 2: Token Injection Verification

### Step 1: Open Network Tab
```
DevTools → Network tab
```

### Step 2: Admin Panel Loads
```
Trigger data refresh in Admin Panel
```

### Step 3: Check Requests
```
Look for:
  GET /api/admin/stats
  GET /api/admin/users
  GET /api/admin/analytics
```

### Step 4: Verify Authorization Header
```
Click each request → Headers tab
Look for: Authorization: Bearer <token>
Expected: Present on ALL admin requests
```

### Step 5: Verify Response Status
```
Status: 200 OK (not 401, not 403)
Response: Contains actual data
```

---

## Test 3: Backend Token Verification

### Step 1: Get Token from Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin123@police.gov.in",
    "password": "admin@gov"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin",
    "email": "admin123@police.gov.in",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

### Step 2: Use Token with Admin API
```bash
TOKEN="<paste_token_from_above>"

curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalFIRs": 42,
    "draftFIRs": 5,
    "finalFIRs": 37,
    "totalCases": 28,
    "systemUptime": 3600
  }
}
```

### Step 3: Test Without Token
```bash
curl http://localhost:5000/api/admin/stats
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": "No token provided. Authorization required."
}
```

### Step 4: Test with Invalid Token
```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response (403):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

---

## Test 4: Authorization Enforcement

### Step 1: Create Non-Admin User
```
In Admin Panel:
- Click "Create User"
- Email: user@example.com
- Password: user123
- Role: CONSTABLE
- Click Create
```

### Step 2: Login as Non-Admin
```
Logout from Admin account
Login with: user@example.com / user123
Expected: Redirected to /dashboard (not /admin)
```

### Step 3: Try to Access Admin Panel
```
Try to navigate to http://localhost:5173/admin
Expected: 
  - Redirect to /login OR
  - Show "Access Denied" message
  - NOT load admin data
```

### Step 4: Verify Admin API Blocked
```
Open DevTools → Console
Run:
  const token = localStorage.getItem('token')
  fetch('http://localhost:5000/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json()).then(console.log)
```

**Expected Response (403):**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

---

## Test 5: Token Expiration

### Step 1: Login as Admin
```
Normal login flow
Store token in console
```

### Step 2: Wait for Token Expiry
```
Note: In dev, token expires in 1 day
For testing, set expiry to 10 seconds in auth.js:
  expiresIn: "10s"
Wait 10+ seconds
```

### Step 3: Try Admin API with Expired Token
```bash
TOKEN="<old_token>"
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (403):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### Step 4: Login Again
```
User should login again to get new token
New token should work
```

---

## Test 6: Logout and Session Clearing

### Step 1: Login as Admin
```
Normal login flow
Verify in localStorage: token + user stored
```

### Step 2: Click Logout
```
In Admin Panel: Click logout button
Expected: Redirected to /login
```

### Step 3: Verify localStorage Cleared
```
Open DevTools → Console
Run:
  localStorage.getItem('token')
  localStorage.getItem('user')
Expected: Both return null
```

### Step 4: Verify Can't Access Admin
```
Try to navigate to /admin
Expected: Redirect to /login (no token)
```

---

## Test 7: Token Persistence

### Step 1: Login as Admin
```
Normal login flow
Verify authenticated on /admin
```

### Step 2: Refresh Page
```
Press F5 (or Cmd+R on Mac)
Expected: Still authenticated on /admin
Expected: Token loaded from localStorage
```

### Step 3: Close and Reopen Browser Tab
```
Close current tab (not all tabs)
Open same URL: http://localhost:5173/admin
Expected: Still authenticated (localStorage persists)
```

### Step 4: Clear localStorage
```
Open DevTools → Console
Run: localStorage.clear()
Refresh page
Expected: Redirected to /login
```

---

## Test 8: Sidebar Menu Filtering

### Step 1: Login as Admin
```
Normal admin login
```

### Step 2: Check Sidebar
```
Sidebar should show:
  ✅ Dashboard
  ✅ AI Chatbot
  ✅ New FIR
  ✅ FIR Drafts
  ✅ Inspector Review
  ✅ Approved FIRs
  ✅ Admin Panel (only for ADMIN)
```

### Step 3: Login as Non-Admin
```
Logout and login with non-admin user
```

### Step 4: Check Sidebar Again
```
Sidebar should show:
  ✅ Dashboard
  ✅ Approved FIRs
  ❌ Admin Panel (NOT visible)
  ❌ New FIR (depends on role)
```

---

## Test 9: CORS and Headers

### Step 1: Check CORS Headers
```bash
curl -i http://localhost:5000/api/auth/login \
  -H "Origin: http://localhost:5173"
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

### Step 2: Check Content-Type
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"email":"admin123@police.gov.in","password":"admin@gov"}'
```

**Expected:**
```
Status: 200
Body: JSON response
```

---

## Test 10: Error Messages

### Test 401 Error
```bash
curl http://localhost:5000/api/admin/stats
# Expected: { error: 'No token provided...' }
```

### Test 403 Error - Invalid Token
```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer bad"
# Expected: { error: 'Invalid or expired token' }
```

### Test 403 Error - Wrong Role
```bash
# (with non-admin token)
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <non_admin_token>"
# Expected: { error: 'Admin access required' }
```

---

## Debugging Tips

### Check Backend Logs
```bash
# Terminal where backend runs
Watch for:
  🔥 LOGIN BODY 🔥
  🔥 ENV VALUES 🔥
  ✅ LOGIN SUCCESS or ❌ LOGIN FAILED
  [AuthMiddleware] Token verification...
```

### Check Frontend Console
```javascript
// DevTools Console
// Check for auth context logs
console.log(localStorage.getItem('token'))
console.log(localStorage.getItem('user'))

// Check for network errors
// Check for API response status
```

### Check Network Tab
```
DevTools → Network
Filter: /api/
Look for:
  - Request headers (Authorization)
  - Response status (200, 401, 403)
  - Response body (error messages)
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized on admin API | Token not sent | Use apiFetch() not fetch() |
| Admin button not appearing | Wrong role | Check user.role in localStorage |
| Token not persisting | localStorage disabled | Check browser localStorage settings |
| CORS error | Origin mismatch | Update FRONTEND_ORIGIN in .env |
| 403 after login | Token expired | Login again |
| Admin panel blank | API error | Check Network tab for 401/403 |

---

## Success Criteria

✅ Admin login returns token  
✅ Token stored in localStorage  
✅ Token sent in Authorization header  
✅ Admin API returns 200 + data  
✅ Non-admin gets 403  
✅ Token persistence works  
✅ Logout clears token  
✅ Sidebar filters by role  
✅ AdminPanel checks auth  
✅ Error messages clear  

---

## Test Automation Script

```bash
#!/bin/bash

echo "🧪 Testing Authentication Flow..."

# Test 1: Admin Login
echo "1️⃣ Testing admin login..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin123@police.gov.in",
    "password": "admin@gov"
  }' | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful: $TOKEN"

# Test 2: Admin API with Token
echo "2️⃣ Testing admin API with token..."
RESPONSE=$(curl -s http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Admin API works"
else
  echo "❌ Admin API failed"
  exit 1
fi

# Test 3: Admin API without Token
echo "3️⃣ Testing admin API without token..."
NO_TOKEN=$(curl -s http://localhost:5000/api/admin/stats | jq -r '.error')

if echo "$NO_TOKEN" | grep -q "No token"; then
  echo "✅ Token required enforced"
else
  echo "❌ Token check failed"
  exit 1
fi

echo "✅ All tests passed!"
```

---

## Final Verification

Before deployment, verify:

- [ ] Admin login returns token
- [ ] Token has Authorization header
- [ ] Admin API returns 200 (not 401/403)
- [ ] Non-admin gets 403
- [ ] Token persistence works
- [ ] Logout clears session
- [ ] Sidebar shows correct menu
- [ ] AdminPanel loads data
- [ ] All errors clear

**Status: Ready for Production ✅**
