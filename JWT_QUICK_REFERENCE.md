# JWT Authentication & Authorization - Quick Reference

## Admin Credentials
```
Email: admin123@police.gov.in
Password: admin@gov
```

---

## Backend Flow

### 1. Login Endpoint
```
POST /api/auth/login
Body: { email, password }

Response:
{
  success: true,
  token: "eyJhbGc...",
  user: { id, email, name, role: "ADMIN" }
}
```

### 2. JWT Middleware Chain
```javascript
// All admin routes use this chain:
router.get('/stats', authenticateJWT, requireAdmin, handler)

// authenticateJWT
├─ Reads Authorization: Bearer <token>
├─ Verifies JWT signature
├─ Decodes: { userId, email, role }
├─ Sets req.user
└─ Returns 401/403 on failure

// requireAdmin
├─ Checks req.user.role === 'ADMIN'
└─ Returns 403 if not admin
```

### 3. Admin Routes Protected
```javascript
POST   /api/admin/create-user  (authenticateJWT + requireAdmin)
GET    /api/admin/users        (authenticateJWT + requireAdmin)
GET    /api/admin/stats        (authenticateJWT + requireAdmin)
GET    /api/admin/analytics    (authenticateJWT + requireAdmin)
```

---

## Frontend Flow

### 1. Auth Context
```typescript
const { user, token, isAuthenticated, login, logout } = useAuth()

// user: { id, email, name, role: "ADMIN" }
// token: "eyJhbGc..."
// isAuthenticated: boolean
```

### 2. Token Persistence
```typescript
// Automatically saved to localStorage on login
localStorage.getItem('token')
localStorage.getItem('user')

// Automatically loaded on app mount
```

### 3. API Client - Auto Token Injection
```typescript
// ALL services use apiFetch() - token is automatic
import { apiFetch } from './apiClient'

const response = await apiFetch('/admin/stats')
// Headers automatically include: Authorization: Bearer <token>
```

### 4. Authorization Checks
```typescript
// AdminPanel.tsx
if (!isAuthenticated || !user || user.role !== 'ADMIN') {
  return <AccessDenied />
}

// Sidebar.tsx
const filteredNavItems = navItems.filter(item => 
  user && item.allowedRoles.includes(user.role)
)
```

---

## API Call Examples

### Using Admin Service (CORRECT ✅)
```typescript
// Token automatically included
const stats = await getAdminStats()
const users = await getAdminUsers()
const analytics = await getAdminAnalytics()
```

### Using apiFetch Directly (CORRECT ✅)
```typescript
// Token automatically included
const response = await apiFetch('/admin/stats')
const data = await response.json()
```

### Manual Fetch (WRONG ❌)
```typescript
// DON'T DO THIS - token won't be included
const response = await fetch('/api/admin/stats')
```

---

## Error Scenarios

### 401 - Missing Token
```
curl http://localhost:5000/api/admin/stats
Response: { success: false, error: 'No token provided' }
HTTP 401
```

### 401 - Expired Token
```
curl -H "Authorization: Bearer <expired_token>" \
     http://localhost:5000/api/admin/stats
Response: { success: false, error: 'Invalid or expired token' }
HTTP 403
```

### 403 - Not Admin
```
curl -H "Authorization: Bearer <user_token>" \
     http://localhost:5000/api/admin/stats
Response: { success: false, error: 'Admin access required' }
HTTP 403
```

---

## Testing

### 1. Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin123@police.gov.in",
    "password": "admin@gov"
  }'

# Expected response:
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

### 2. Test Token Usage
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
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

### 3. Test Token Rejection
```bash
# No token
curl http://localhost:5000/api/admin/stats
# Response: 401 Unauthorized

# Invalid token
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer invalid"
# Response: 403 Forbidden
```

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/routes/auth.js` | Login endpoint + JWT generation |
| `backend/middleware/authMiddleware.js` | Token verification + role checks |
| `backend/routes/adminRoutes.js` | Protected admin endpoints |
| `frontend/src/contexts/AuthContext.tsx` | Token + user state management |
| `frontend/src/api/apiClient.ts` | Automatic token injection |
| `frontend/src/api/adminService.ts` | Admin API calls |
| `frontend/src/components/AdminPanel.tsx` | Admin UI + authorization |
| `backend/.env` | Admin credentials + JWT secret |

---

## Environment Variables Required

```env
# backend/.env
ADMIN_EMAIL=admin123@police.gov.in
ADMIN_PASSWORD=admin@gov
JWT_SECRET=your-super-secret-jwt-key-change-in-production
MONGODB_URI=mongodb+srv://...
FRONTEND_ORIGIN=http://localhost:5173
```

---

## Security Rules

1. ✅ Every API request must have valid JWT in Authorization header
2. ✅ Admin endpoints require role === 'ADMIN'
3. ✅ Frontend only calls admin APIs if authenticated
4. ✅ Token automatically injected - no manual header needed
5. ✅ Middleware validates token before handler executes
6. ✅ Clear 401/403 errors for debugging

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Token not sent | Use apiFetch() not fetch() |
| 403 Admin access required | User not admin | Login with admin@gov password |
| Token not persisting | localStorage not available | Check browser localStorage settings |
| Admin API returns data then crashes | Component renders before auth ready | Add auth check before render |

---

## Development Checklist

- [x] Backend: JWT middleware on all admin routes
- [x] Backend: requireAdmin checks role === 'ADMIN'
- [x] Backend: Admin credentials in .env
- [x] Frontend: apiFetch auto-injects token
- [x] Frontend: AuthContext persists token to localStorage
- [x] Frontend: AdminPanel checks auth before rendering
- [x] Frontend: No manual fetch() calls to admin APIs
- [x] Frontend: Token reloaded on app mount
- [x] Testing: 401 on missing token
- [x] Testing: 403 on wrong role
- [x] Testing: 200 on valid admin request
