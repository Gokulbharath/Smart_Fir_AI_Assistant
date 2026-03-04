# 🎯 QUICK REFERENCE CARD - Police Role-Based Authentication

## 📌 Police Hierarchy (Copy-Paste Reference)

```
RANK    LEVEL   ROLE              CAN CREATE  CAN APPROVE  CAN SEARCH  CAN UPLOAD
────────────────────────────────────────────────────────────────────────────────
      1       CONSTABLE         ❌          ❌          ❌          ❌
      2       HEAD_CONSTABLE    ❌          ❌          ❌          ❌
      3       ASI               ❌          ❌          ❌          ❌
      4       SI                ✅          ❌          ✅          ✅
      5       INSPECTOR         ✅          ❌          ✅          ✅
      6       DSP               ✅          ✅          ✅          ✅  ← Can approve
      7       ASP               ✅          ✅          ✅          ✅
      8       SP                ✅          ✅          ✅          ✅
      9       DIG               ✅          ✅          ✅          ✅  ← Full access
     10       IG                ✅          ✅          ✅          ✅
     11       ADGP              ✅          ✅          ✅          ✅
     12       DGP               ✅          ✅          ✅          ✅
     13       ADMIN             ❌          ❌          ❌          ❌  ← User mgmt only
```

---

## 🔑 Default Credentials

```
Admin Account (Hardcoded):
  Login ID:  admin123@police.gov.in
  Password:  admin@gov
  Rank:      13 (ADMIN)
  Role:      User management only
```

---

## 🚀 Setup in 3 Steps

### 1. Configure Backend
```bash
# Edit backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_fir
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 2. Start Backend
```bash
cd backend
npm run dev
```

### 3. Login
```
URL: http://localhost:5173
Login ID: admin123@police.gov.in
Password: admin@gov
```

---

## 📡 API Endpoints

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "loginId": "admin123@police.gov.in",
  "password": "admin@gov"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "loginId": "admin123@police.gov.in",
    "name": "System Admin",
    "role": "ADMIN",
    "rankLevel": 13
  }
}
```

### Create User
```bash
POST /api/auth/admin/create-user
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "INSPECTOR",
  "loginId": "inspector001@police.gov.in",
  "password": "demo123",
  "name": "Raj Kumar"
}
```

### Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer {token}
```

### Get All Users (Admin Only)
```bash
GET /api/auth/all-users
Authorization: Bearer {token}
```

### Get Role Hierarchy
```bash
GET /api/auth/hierarchy
```

---

## 🛡️ Protecting Routes

### Basic Protection (Authenticate Only)
```javascript
app.get('/api/resource',
  authenticateToken,
  (req, res) => { ... }
);
```

### SI+ Only (Rank 4+)
```javascript
app.get('/api/resource',
  authenticateToken,
  requireMinRank(4),
  (req, res) => { ... }
);
```

### DSP+ Only (Rank 6+)
```javascript
app.post('/api/resource',
  authenticateToken,
  requireMinRank(6),
  (req, res) => { ... }
);
```

### Admin Only (Rank 13)
```javascript
app.delete('/api/resource',
  authenticateToken,
  requireAdmin,
  (req, res) => { ... }
);
```

### Specific Roles
```javascript
app.put('/api/resource',
  authenticateToken,
  requireRole('INSPECTOR', 'DSP', 'ADMIN'),
  (req, res) => { ... }
);
```

---

## 🎨 Frontend Usage

### Get Auth Context
```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, token, canApprove, canSearch, hasMinRankLevel } = useAuth();
  
  return <div>Logged in as: {user?.name}</div>;
};
```

### Check Permissions
```typescript
if (canApprove()) {
  // Show approve button
}

if (canSearch()) {
  // Show search box
}

if (hasMinRankLevel(8)) {  // SP+
  // Show SP-only features
}
```

### Make API Calls
```typescript
const response = await fetch('/api/resource', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📁 Important Files

### Backend Core
```
backend/
├── models/Constable.js through Admin.js    (13 models)
├── services/authService.js                  (auth logic)
├── middleware/authMiddleware.js             (JWT checks)
├── routes/authRoutes.js                     (endpoints)
└── .env.example                             (config)
```

### Frontend Core
```
frontend/src/
├── contexts/AuthContext.tsx                 (state)
├── api/authService.ts                       (API calls)
└── components/
    ├── Login.tsx                            (login UI)
    └── AdminUserManager.tsx                 (user creation)
```

---

## 🧪 Test Commands (Postman/cURL)

### Test 1: Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "admin123@police.gov.in",
    "password": "admin@gov"
  }'
```

### Test 2: Create Inspector
```bash
curl -X POST http://localhost:5000/api/auth/admin/create-user \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "INSPECTOR",
    "loginId": "inspector001@police.gov.in",
    "password": "demo123",
    "name": "Test Inspector"
  }'
```

### Test 3: Login as Inspector
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "inspector001@police.gov.in",
    "password": "demo123"
  }'
```

### Test 4: Check Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer {TOKEN}"
```

---

## ⚙️ Middleware Chaining Order

**Important**: Order matters!

```javascript
// ✅ Correct Order
app.post('/api/resource',
  authenticateToken,           // 1. Verify token exists
  requireMinRank(6),           // 2. Check rank level
  async (req, res) => { ... }  // 3. Business logic
);

// ❌ Wrong Order (will fail)
app.post('/api/resource',
  requireMinRank(6),           // Error: req.user undefined!
  authenticateToken,
  async (req, res) => { ... }
);
```

---

## 🔐 Environment Variables

```env
# Minimum required
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_fir
JWT_SECRET=your-secret-key-here
FRONTEND_ORIGIN=http://localhost:5173

# Optional but recommended
JWT_EXPIRES_IN=7d
ADMIN_LOGIN=admin123@police.gov.in
ADMIN_PASSWORD=admin@gov
```

---

## 📊 JWT Token Contents

```json
{
  "loginId": "inspector001@police.gov.in",
  "name": "Rajesh Kumar",
  "role": "INSPECTOR",
  "rankLevel": 5,
  "iat": 1738099200,
  "exp": 1738704000
}
```

---

## ❌ Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid credentials" | Wrong loginId/password | Check spelling, user exists |
| "No token provided" | Missing Authorization header | Add `Authorization: Bearer {token}` |
| "Insufficient privileges" | Rank too low | Use higher rank (DSP+ for approval) |
| "Admin access required" | Not ADMIN role | Login with admin account |
| Token expired | Older than 7 days | Login again to get new token |
| "User not found" | Searched all collections | User hasn't been created |

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] Admin login works
- [ ] Can create users through API
- [ ] Can login as created user
- [ ] JWT contains rankLevel
- [ ] requireMinRank() rejects low ranks
- [ ] Frontend displays user info
- [ ] Protected routes require token

---

## 🎓 Key Concepts

**Rank Level**: Numeric hierarchy 1-13  
**Authentication**: Verifying user identity (login)  
**Authorization**: Checking permissions (rank level)  
**JWT**: Token containing rankLevel + role  
**Middleware**: Function between request and handler  

---

## 📚 Where to Learn More

- **IMPLEMENTATION_SUMMARY.md** - Full overview
- **PROTECTING_ROUTES_EXAMPLE.md** - Code samples
- **AUTH_QUICKSTART.md** - Step-by-step guide
- **MIGRATION_GUIDE.md** - Upgrading from old auth

---

## 🚀 Next Steps

1. Start backend: `npm run dev`
2. Login with admin credentials
3. Create test users through admin panel
4. Test protecting existing routes
5. Deploy to production

---

**Quick Reference Card v1.0**  
**Generated**: 2026-01-28  
**Status**: ✅ Ready to use
