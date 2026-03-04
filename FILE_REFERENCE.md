# 🗂️ COMPLETE FILE REFERENCE - All Changes & New Files

## Quick Navigation

### 📋 Documentation (Read First)
1. `IMPLEMENTATION_SUMMARY.md` - Start here! High-level overview
2. `ROLE_BASED_AUTH_IMPLEMENTATION.md` - Detailed architecture
3. `AUTH_QUICKSTART.md` - 6-step quick start
4. `PROTECTING_ROUTES_EXAMPLE.md` - Code examples
5. `MIGRATION_GUIDE.md` - Migrating from old auth
6. `FILE_REFERENCE.md` - This file

---

## 📁 Backend Files

### Models (13 New Role-Specific Collections)

**Location**: `backend/models/`

| File | Role | Rank | Collection |
|------|------|------|-----------|
| `Constable.js` | CONSTABLE | 1 | `constables` |
| `HeadConstable.js` | HEAD_CONSTABLE | 2 | `head_constables` |
| `ASI.js` | ASI | 3 | `asis` |
| `SI.js` | SI | 4 | `sis` |
| `Inspector.js` | INSPECTOR | 5 | `inspectors` |
| `DSP.js` | DSP | 6 | `dsps` |
| `ASP.js` | ASP | 7 | `asps` |
| `SP.js` | SP | 8 | `sps` |
| `DIG.js` | DIG | 9 | `digs` |
| `IG.js` | IG | 10 | `igs` |
| `ADGP.js` | ADGP | 11 | `adgps` |
| `DGP.js` | DGP | 12 | `dgps` |
| `Admin.js` | ADMIN | 13 | `admins` |

**Each file contains:**
```javascript
✅ Mongoose schema with:
   - loginId (unique, immutable)
   - password (bcrypt hashed)
   - name
   - role (immutable)
   - rankLevel (immutable)
   - createdBy, createdAt, updatedAt
   - lastLogin, isActive

✅ Pre-save hook for password hashing
✅ comparePassword() method
```

### Services

**File**: `backend/services/authService.js` ✅ NEW

```javascript
Exports:
✅ authenticateUser(loginId, password)
   → Searches all 13 role collections
   → Returns { success, user, role, rankLevel }

✅ createUserInRole(role, userData)
   → Creates user in specific collection
   → Validates role exists

✅ getAllUsers()
   → Returns all users across all roles
   → Sorted by rankLevel descending

✅ getRoleHierarchy()
   → Returns mapping of role → rankLevel

✅ hasMinimumRank(userRankLevel, minimumRankLevel)
   → Boolean permission checker

✅ getRoleByRankLevel(rankLevel)
   → Reverse lookup: rankLevel → role
```

### Middleware

**File**: `backend/middleware/authMiddleware.js` ✅ UPDATED

```javascript
✅ authenticateToken(req, res, next)
   → Verifies JWT token
   → Extracts loginId, role, rankLevel, name
   → Attaches to req.user

✅ authenticate (alias for authenticateToken)
   → For backward compatibility

✅ requireMinRank(minimumRankLevel)
   → Returns middleware that checks rankLevel
   → Usage: requireMinRank(6) for DSP+

✅ requireRole(...roles)
   → Returns middleware that checks role
   → Usage: requireRole('INSPECTOR', 'SP')

✅ requireAdmin()
   → Checks for ADMIN role (13)

✅ generateToken(payload)
   → Creates JWT with 7-day expiry
   → Includes: loginId, role, rankLevel, name
```

### Routes

**File**: `backend/routes/authRoutes.js` ✅ COMPLETELY REWRITTEN

```javascript
Routes:

✅ POST /api/auth/login
   Body: { loginId, password }
   Response: { success, token, user }
   
   Special: Also checks hardcoded ADMIN credentials
   
✅ POST /api/auth/admin/create-user
   Middleware: authenticateToken, requireAdmin
   Body: { role, loginId, password, name }
   Response: { success, user, message }
   
✅ GET /api/auth/profile
   Middleware: authenticateToken
   Response: { success, user }
   
✅ GET /api/auth/all-users
   Middleware: authenticateToken, requireAdmin
   Response: { success, users[] }
   
✅ GET /api/auth/hierarchy
   No auth required
   Response: { success, hierarchy }
```

### Configuration

**File**: `backend/.env.example` ✅ NEW

```env
# Database
MONGODB_URI=mongodb://localhost:27017/smart_fir

# Server
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Admin (Hardcoded - DO NOT CHANGE)
ADMIN_LOGIN=admin123@police.gov.in
ADMIN_PASSWORD=admin@gov
```

---

## 🎨 Frontend Files

### Contexts

**File**: `frontend/src/contexts/AuthContext.tsx` ✅ UPDATED

```typescript
Changes from old:

❌ Removed:
   - UserRole: 'officer' | 'inspector' | 'admin'
   - email, rank, station, badgeNumber, permissions
   - hasPermission(), hasRole() (still exist but work differently)

✅ Added:
   - PoliceRole: 13 police ranks
   - rankLevel: number (1-13)
   - hasMinRankLevel(minLevel): boolean
   - canApprove(): DSP+ (6+)
   - canSearch(): SI+ (4+)
   - canUploadEvidence(): SI+ (4+)

✅ Changed:
   - login(email, password) → login(loginId, password)
```

### Services

**File**: `frontend/src/api/authService.ts` ✅ UPDATED

```typescript
Changes:

❌ Removed:
   - register() function
   - email-based login

✅ Added:
   - createUser(token, data) - Create police users
   - getProfile(token)
   - getAllUsers(token)
   - getRoleHierarchy()

✅ Changed:
   - login(email, password) → login(loginId, password)
   - LoginData: email → loginId
   - AuthResponse: simplified user object
```

### Components

**File 1**: `frontend/src/components/Login.tsx` ✅ UPDATED

```typescript
Changes:

❌ Removed:
   - setEmail() state
   - email input field
   - email change handler

✅ Added:
   - setLoginId() state
   - loginId input field
   - loginId change handler

✅ Updated:
   - demoAccounts with new credentials
   - Placeholder text to loginId format
   - Login call: login(loginId, password)
```

**File 2**: `frontend/src/components/AdminUserManager.tsx` ✅ NEW

```typescript
Features:

✅ Admin-only access check
✅ Two tabs:
   - Create User: Form to create new users
   - View Users: Table of all users
   
✅ Create User Form:
   - Role selector dropdown
   - Name input
   - Login ID input
   - Password input
   - Submit button

✅ Users Table:
   - Name, Role, Level, LoginID, Created date
   - Sorted by rankLevel
   
✅ Role hierarchy display
✅ Real-time user list reload
✅ Success/error messages
```

**File 3**: `frontend/src/components/AdminPanel.tsx` ✅ UPDATED

```typescript
Changes:

✅ Added import:
   import AdminUserManager from './AdminUserManager';

Note: AdminPanel structure unchanged, just adds AdminUserManager
```

---

## 📚 Documentation Files

### Main Documentation

| File | Purpose | Read When |
|------|---------|-----------|
| `IMPLEMENTATION_SUMMARY.md` | Complete overview of all changes | First! |
| `ROLE_BASED_AUTH_IMPLEMENTATION.md` | Detailed architecture & rules | Planning integration |
| `AUTH_QUICKSTART.md` | 6-step quick start guide | Ready to setup |
| `PROTECTING_ROUTES_EXAMPLE.md` | Code examples for all modules | Implementing endpoints |
| `MIGRATION_GUIDE.md` | How to migrate from old auth | If updating existing system |
| `FILE_REFERENCE.md` | This document! | Navigating the code |

---

## 🔑 Key Concepts Map

### Authentication Flow
```
User Input (loginId + password)
           ↓
           ↓ POST /api/auth/login
           ↓
Backend: Search all 13 role collections
           ↓
Found user? Verify password with bcrypt
           ↓
Generate JWT with rankLevel
           ↓
Return token + user info
           ↓
Frontend: Store in localStorage
           ↓
Include in all API calls: Authorization: Bearer {token}
```

### Authorization Flow
```
API Call with JWT token
           ↓
Middleware: authenticateToken
           ↓
Decode JWT → Extract rankLevel
           ↓
Middleware: requireMinRank(4)
           ↓
Check: user.rankLevel >= 4?
           ↓
✅ Allowed / ❌ Denied
```

### Role Hierarchy
```
CONSTABLE (1)
    ↓
HEAD_CONSTABLE (2)
    ↓
ASI (3)
    ↓
SI (4) ← First permission level
    ↓
INSPECTOR (5)
    ↓
DSP (6) ← Can approve
    ↓
ASP (7)
    ↓
SP (8)
    ↓
DIG (9) ← Full access
    ↓
IG (10)
    ↓
ADGP (11)
    ↓
DGP (12)
    ↓
ADMIN (13) ← User management
```

---

## 🔗 Integration Points

### What to Connect Next

1. **FIR Routes** (`backend/routes/...`)
   - Add: `authenticateToken, requireMinRank(4)`
   - Add to create/search
   - Add: `requireMinRank(6)` to approve
   - Add: `requireAdmin` to delete

2. **Evidence Routes** (`backend/routes/evidenceRoutes.js`)
   - Add: `authenticateToken, requireMinRank(4)`
   - Add to upload/download
   - Add: `requireAdmin` to delete

3. **Case Retrieval** (`backend/routes/...`)
   - Add: `authenticateToken, requireMinRank(4)`
   - Add to search endpoints

4. **Frontend Components**
   - Use: `canApprove()`, `canSearch()`, `hasMinRankLevel()`
   - Show/hide UI based on rank
   - Protect routes with ProtectedRoute wrapper

---

## 💾 Database Structure

### Old System (Deprecated)
```
Collection: users
├── _id: ObjectId
├── email: String (unique)
├── password: String
├── name: String
├── role: 'officer' | 'inspector' | 'admin'
├── rank: String
├── station: String
└── ... other fields
```

### New System (Current)
```
Collections (13 total):
├── constables
├── head_constables
├── asis
├── sis
├── inspectors ← Most common
├── dsps
├── asps
├── sps
├── digs
├── igs
├── adgps
├── dgps
└── admins

Each collection:
├── _id: ObjectId
├── loginId: String (unique)
├── password: String (hashed)
├── name: String
├── role: String (fixed per collection)
├── rankLevel: Number (fixed per collection)
├── createdBy: String
├── createdAt: Date
├── updatedAt: Date
├── lastLogin: Date
└── isActive: Boolean
```

---

## 🚀 Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set strong `JWT_SECRET` (not in git!)
- [ ] Use MongoDB Atlas (not local)
- [ ] Enable HTTPS only
- [ ] Set CORS origin to frontend domain
- [ ] Test login flow
- [ ] Test user creation
- [ ] Test protected routes
- [ ] Test all rank levels (SI, DSP, ADMIN)
- [ ] Monitor logs
- [ ] Keep rollback plan ready

---

## 🆘 Quick Troubleshooting

| Problem | File to Check |
|---------|---------------|
| Login doesn't work | `authRoutes.js`, `authService.js` |
| Token not in response | `generateToken()` in `authMiddleware.js` |
| Rank checks failing | `requireMinRank()` in `authMiddleware.js` |
| Wrong user type | `AuthContext.tsx` interfaces |
| Admin create not working | `requireAdmin` middleware |
| Frontend not sending token | `apiClient.ts` headers |
| Protected routes accessible | Check middleware order in routes |

---

## 📞 File Dependencies

```
Backend:
  server.js
    ├── authRoutes.js
    │   └── authService.js
    │       ├── Constable.js
    │       ├── Inspector.js
    │       ├── DSP.js
    │       └── ... (all 13 models)
    │
    └── authMiddleware.js
        └── Uses rankLevel from JWT
    
FIR routes (to be updated):
    └── authMiddleware.js
        └── authenticateToken, requireMinRank

Frontend:
  App.tsx
    └── AuthProvider (AuthContext.tsx)
        ├── Login.tsx
        │   └── authService.ts
        │       └── /api/auth/login
        │
        └── AdminPanel.tsx
            └── AdminUserManager.tsx
                ├── authService.ts
                │   ├── /api/auth/admin/create-user
                │   ├── /api/auth/all-users
                │   └── /api/auth/hierarchy
                │
                └── AuthContext.tsx
                    └── useAuth()
```

---

## 📊 Statistics

**Files Created**: 16  
**Files Updated**: 5  
**Documentation Files**: 6  
**Total Lines of Code**: ~2,500+  
**Test Cases Needed**: 15+  

---

## ✨ Final Checklist

- [ ] All 13 role models created
- [ ] Auth service implemented
- [ ] Middleware functions working
- [ ] Auth routes updated
- [ ] AuthContext updated
- [ ] Login component updated
- [ ] AdminUserManager created
- [ ] All documentation written
- [ ] .env.example created
- [ ] Backend tested with Postman
- [ ] Frontend tested with demo accounts
- [ ] Ready for integration with FIR/Evidence/Cases

---

**Reference Document Version**: 1.0  
**Last Updated**: 2026-01-28  
**Status**: ✅ Complete
