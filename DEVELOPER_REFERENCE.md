# DEVELOPER REFERENCE CARD

## 🔐 Authentication Quick Commands

### Login via curl
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin123@police.gov.in",
    "password": "admin@gov"
  }'
```

### Save Token
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin123@police.gov.in","password":"admin@gov"}' \
  | jq -r '.token')
echo $TOKEN
```

### Call Admin API
```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧠 Key Concepts

### JWT Token Structure
```javascript
Header:  { alg: "HS256", typ: "JWT" }
Payload: { userId: "admin", email: "...", role: "ADMIN" }
Signature: HMAC-SHA256(header + payload, JWT_SECRET)
```

### Authorization Header Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
              ^^^^^^^ Important!
```

### Error Codes
```
200 OK                    ✅ Success
401 Unauthorized          ❌ No token or invalid
403 Forbidden             ❌ Wrong role or no access
500 Server Error          ❌ Backend error
```

---

## 📍 Code Locations

### Frontend Services
```typescript
// Always use apiFetch(), NEVER use fetch() directly

import { apiFetch } from './apiClient'

// ✅ CORRECT
const response = await apiFetch('/admin/stats')

// ❌ WRONG
const response = await fetch('http://localhost:5000/api/admin/stats')
```

### Backend Middleware
```javascript
// Use this pattern for protected routes
router.get('/endpoint', 
  authenticateJWT,  // Step 1: Verify token
  requireAdmin,     // Step 2: Check role
  handler           // Step 3: Execute
)
```

### Frontend Checks
```typescript
// Always check auth before rendering admin UI
const { user, isAuthenticated } = useAuth()

if (!isAuthenticated || !user || user.role !== 'ADMIN') {
  return <AccessDenied />
}

// Now safe to call admin APIs
```

---

## 🔍 Debugging Checklist

### 401 Errors?
1. Check if token exists: `localStorage.getItem('token')`
2. Check if Authorization header present: DevTools → Network
3. Check if token valid: Decode at jwt.io
4. Check if token expired: Compare exp claim to current time

### 403 Errors?
1. Check user role: `localStorage.getItem('user')`
2. Verify role is 'ADMIN'
3. Check Backend middleware: Is requireAdmin present?
4. Check Authorization header format: "Bearer " (with space)

### API Call Not Sending Token?
1. Check if using apiFetch() or fetch()
2. If fetch(): ❌ WRONG, change to apiFetch()
3. Verify token exists in localStorage
4. Check DevTools → Network → Authorization header

### Component Rendering Before Auth Ready?
1. Check if using AuthContext correctly
2. Add: `if (!isAuthenticated) return <Loading />`
3. Move auth check AFTER all hooks (React Rules)
4. Check useEffect dependencies

---

## 🛠️ Common Tasks

### Add New Admin Endpoint
```javascript
// backend/routes/adminRoutes.js
router.get('/new-endpoint', 
  authenticateJWT,  // Protect with auth
  requireAdmin,     // Admin only
  async (req, res) => {
    // req.user contains { userId, email, role }
    // Now call your handler
  }
)
```

### Create Admin Service Function
```typescript
// frontend/src/api/adminService.ts
export async function getNewData(): Promise<Data> {
  const response = await apiFetch('/admin/new-endpoint')
  // Token automatically included! ✅
  
  if (!response.ok) {
    throw new Error('Failed to fetch')
  }
  
  return response.json()
}
```

### Use in Component
```typescript
// frontend/src/components/MyComponent.tsx
import { useAuth } from '../contexts/AuthContext'
import { getNewData } from '../api/adminService'

export function MyComponent() {
  const { user, isAuthenticated } = useAuth()
  
  // Check auth first
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <AccessDenied />
  }
  
  // Now safe to use
  const [data, setData] = useState(null)
  
  useEffect(() => {
    getNewData().then(setData)
  }, [])
  
  return <div>{/* render data */}</div>
}
```

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "stats": {
    "totalFIRs": 42,
    "activeUsers": 15
  }
}
```

### Error Response (401)
```json
{
  "success": false,
  "error": "No token provided. Authorization required."
}
```

### Error Response (403)
```json
{
  "success": false,
  "error": "Admin access required"
}
```

### Login Response
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

---

## ⚙️ Configuration

### Backend .env
```env
ADMIN_EMAIL=admin123@police.gov.in
ADMIN_PASSWORD=admin@gov
JWT_SECRET=your-secure-random-key-here
MONGODB_URI=mongodb+srv://...
FRONTEND_ORIGIN=http://localhost:5173
JWT_EXPIRES_IN=1d
```

### Frontend .env
```env
VITE_API_BASE=http://localhost:5000/api
```

---

## 🔄 Token Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERACTION                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend: User enters credentials in Login component    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ POST /api/auth/login (email, password)                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: Verify credentials, create JWT                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Response: { token: "...", user: {...} }                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend: Store token in localStorage + AuthContext     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend: Navigate to /admin                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ AdminPanel checks: isAuthenticated && role === 'ADMIN' │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Call apiFetch('/admin/stats')                           │
│ apiFetch reads token from localStorage                  │
│ apiFetch adds Authorization header                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ GET /api/admin/stats                                    │
│ Authorization: Bearer <token>                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: authenticateJWT middleware                     │
│   - Extract token from Authorization header             │
│   - Verify JWT signature                                │
│   - Decode payload                                      │
│   - Attach req.user                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: requireAdmin middleware                        │
│   - Check req.user.role === 'ADMIN'                     │
│   - Call next() if authorized                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Handler executes, queries database                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Response: { success: true, stats: {...} }               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Frontend: Display stats in AdminPanel                   │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Best Practices

### DO ✅
- [x] Always import `apiFetch` from apiClient
- [x] Check `isAuthenticated && role` before admin UI
- [x] Include all hooks BEFORE auth checks
- [x] Use Authorization: Bearer <token> format
- [x] Return clear error messages
- [x] Log errors to console for debugging
- [x] Store token in localStorage
- [x] Use requireAdmin middleware for admin routes

### DON'T ❌
- [x] Use fetch() directly (use apiFetch)
- [x] Manually set Authorization header
- [x] Call admin APIs without auth check
- [x] Put hooks after early returns
- [x] Hardcode tokens in code
- [x] Disable authentication middleware
- [x] Bypass role checks
- [x] Store token in unsecured places

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check localStorage has token |
| 403 Admin access | Check user.role === 'ADMIN' |
| Token not sent | Use apiFetch(), not fetch() |
| Admin panel blank | Check Network tab for API errors |
| Login redirect fails | Check ROLE_PATHS config |
| Token not persisting | Check localStorage permissions |
| API returns null | Check response format |

---

## 📞 Support Resources

- **JWT Debugging:** https://jwt.io
- **API Testing:** Postman or curl
- **DevTools:** Chrome/Firefox Developer Tools
- **Documentation:** See AUTH_FLOW_COMPLETE.md

---

**Version:** 1.0  
**Status:** Production Ready ✅  
**Last Updated:** January 28, 2026
