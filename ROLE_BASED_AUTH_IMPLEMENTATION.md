# 🔐 POLICE ROLE-BASED AUTHENTICATION SYSTEM - IMPLEMENTATION GUIDE

## ✅ COMPLETED CHANGES

### Backend Changes
1. **13 Role-Specific Models Created**
   - `backend/models/Constable.js`
   - `backend/models/HeadConstable.js`
   - `backend/models/ASI.js`
   - `backend/models/SI.js`
   - `backend/models/Inspector.js`
   - `backend/models/DSP.js`
   - `backend/models/ASP.js`
   - `backend/models/SP.js`
   - `backend/models/DIG.js`
   - `backend/models/IG.js`
   - `backend/models/ADGP.js`
   - `backend/models/DGP.js`
   - `backend/models/Admin.js`

   **Key Features:**
   - Each role has a separate collection
   - Immutable `role` and `rankLevel` fields
   - Password hashing with bcrypt
   - `comparePassword()` method
   - `createdBy`, `createdAt`, `lastLogin` tracking

2. **Auth Service** (`backend/services/authService.js`)
   - `authenticateUser(loginId, password)` - searches all role collections
   - `createUserInRole(role, userData)` - creates user in specific role collection
   - `getAllUsers()` - retrieves users from all roles
   - `getRoleHierarchy()` - returns rank level mapping
   - `hasMinimumRank(userRankLevel, minimumRankLevel)` - permission checker

3. **Updated Auth Middleware** (`backend/middleware/authMiddleware.js`)
   - `authenticateToken(req, res, next)` - verifies JWT tokens
   - `requireMinRank(minimumRankLevel)` - middleware for rank-based access
   - `requireRole(...roles)` - middleware for role-based access
   - `requireAdmin()` - admin-only middleware
   - `generateToken(payload)` - creates JWT with rankLevel

4. **New Auth Routes** (`backend/routes/authRoutes.js`)
   - `POST /api/auth/login` - login with loginId/password
   - `POST /api/auth/admin/create-user` - create user (ADMIN ONLY)
   - `GET /api/auth/profile` - get current user
   - `GET /api/auth/all-users` - list all users (ADMIN ONLY)
   - `GET /api/auth/hierarchy` - get role hierarchy

### Frontend Changes

1. **Updated AuthContext** (`frontend/src/contexts/AuthContext.tsx`)
   - New `PoliceRole` type with 13 roles
   - `rankLevel` field in User interface
   - `hasMinRankLevel(minLevel)` - check minimum rank
   - `canApprove()` - DSP+ (6+)
   - `canSearch()` - SI+ (4+)
   - `canUploadEvidence()` - SI+ (4+)

2. **Updated Auth Service** (`frontend/src/api/authService.ts`)
   - `login(loginId, password)` - new params
   - `createUser(token, data)` - create police user
   - `getProfile(token)` - get user profile
   - `getAllUsers(token)` - list all users
   - `getRoleHierarchy()` - get role hierarchy

3. **Updated Login Component** (`frontend/src/components/Login.tsx`)
   - Changed from email to loginId
   - Updated demo accounts
   - New demo credentials with ADMIN

4. **Admin Panel Component** (`frontend/src/components/AdminUserManager.tsx`)
   - Create new users (ADMIN ONLY)
   - View all users with pagination
   - Display role hierarchy with rank levels
   - Role selector with rank levels

---

## 🚀 HOW TO USE

### 1. Setup Backend

```bash
cd backend
npm install
```

### 2. Configure .env

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/smart_fir

# Server
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Admin Credentials (Fixed)
ADMIN_LOGIN=admin123@police.gov.in
ADMIN_PASSWORD=admin@gov
```

### 3. Start Backend

```bash
npm run dev
```

### 4. Admin Login First Time

Login with:
- **Login ID**: `admin123@police.gov.in`
- **Password**: `admin@gov`

### 5. Create Police Users

```bash
POST /api/auth/admin/create-user
Authorization: Bearer {token}

{
  "role": "INSPECTOR",
  "loginId": "inspector001@police.gov.in",
  "password": "demo123",
  "name": "Raj Kumar"
}
```

### 6. Login as Other Users

Use the created login ID and password.

---

## 🔒 PERMISSION MATRIX

### By Rank Level

| Role | Level | FIR Create | FIR Approve | Evidence | Search Cases |
|------|-------|-----------|-------------|----------|--------------|
| CONSTABLE | 1 | ❌ | ❌ | ❌ | ❌ |
| HEAD_CONSTABLE | 2 | ❌ | ❌ | ❌ | ❌ |
| ASI | 3 | ❌ | ❌ | ❌ | ❌ |
| SI | 4 | ✅ | ❌ | ✅ | ✅ |
| INSPECTOR | 5 | ✅ | ❌ | ✅ | ✅ |
| DSP | 6 | ✅ | ✅ | ✅ | ✅ |
| ASP | 7 | ✅ | ✅ | ✅ | ✅ |
| SP | 8 | ✅ | ✅ | ✅ | ✅ |
| DIG | 9 | ✅ | ✅ | ✅ | ✅ |
| IG | 10 | ✅ | ✅ | ✅ | ✅ |
| ADGP | 11 | ✅ | ✅ | ✅ | ✅ |
| DGP | 12 | ✅ | ✅ | ✅ | ✅ |
| ADMIN | 13 | ❌ | ❌ | ❌ | ❌ |

---

## 🔑 KEY SECURITY RULES

✅ **IMPLEMENTED:**
- Password hashing with bcrypt
- JWT tokens with rankLevel
- Admin-only user creation
- Rank-based middleware protection
- Immutable role and rankLevel fields
- Separate collections per role
- No self-registration

⚠️ **IMPORTANT:**
- Admin account is hardcoded (not in database)
- Only ADMIN can create users
- Cannot change user roles after creation
- All passwords must be 6+ characters
- JWT expires in 7 days

---

## 🛠️ HOW TO PROTECT ROUTES

### Backend (Express)

```javascript
import { authenticateToken, requireMinRank, requireAdmin } from './middleware/authMiddleware.js';

// Require authentication only
app.get('/api/fir/drafts', authenticateToken, handler);

// Require SI+ (4+)
app.get('/api/cases/search', authenticateToken, requireMinRank(4), handler);

// Require DSP+ (6+) for approval
app.post('/api/fir/approve', authenticateToken, requireMinRank(6), handler);

// Require ADMIN only
app.post('/api/admin/create-user', authenticateToken, requireAdmin, handler);

// Require specific roles
app.get('/api/admin/stats', authenticateToken, requireRole('ADMIN', 'DGP'), handler);
```

### Frontend (React)

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { canApprove, canSearch, canUploadEvidence, hasMinRankLevel } = useAuth();

  return (
    <>
      {canApprove() && <button>Approve FIR</button>}
      {canSearch() && <button>Search Cases</button>}
      {canUploadEvidence() && <button>Upload Evidence</button>}
      {hasMinRankLevel(6) && <p>You can approve</p>}
    </>
  );
};
```

---

## 📋 NEXT STEPS

### To integrate with existing FIR/Evidence/Case modules:

1. **Update FIR Routes**
   - Add `requireMinRank(4)` to create/search endpoints
   - Add `requireMinRank(6)` to approve endpoint
   - Add `requireAdmin` to delete endpoints

2. **Update Evidence Routes**
   - Add `requireMinRank(4)` to upload/download
   - Add `requireAdmin` to delete

3. **Update Case Retrieval**
   - Add `requireMinRank(4)` to search endpoint
   - Add `requireAdmin` to delete/reset

4. **Update Admin Dashboard**
   - Integrate AdminUserManager component
   - Add user management pages
   - Add statistics by role

---

## 🗄️ DATABASE STRUCTURE

Each role collection follows this schema:

```javascript
{
  _id: ObjectId,
  loginId: String (unique, lowercase),
  password: String (hashed),
  name: String,
  role: String (immutable, e.g., "INSPECTOR"),
  rankLevel: Number (immutable, e.g., 5),
  createdBy: String,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

Collections:
- `constables`
- `head_constables`
- `asis`
- `sis`
- `inspectors`
- `dsps`
- `asps`
- `sps`
- `digs`
- `igs`
- `adgps`
- `dgps`
- `admins`

---

## ✨ BACKWARD COMPATIBILITY

Old code using `email` will fail. Update:

**Old:**
```typescript
login(email, password)
```

**New:**
```typescript
login(loginId, password)
```

---

## 🐛 TROUBLESHOOTING

**Problem**: "Invalid credentials"
- Check login ID spelling and case
- Ensure user exists in correct role collection
- Verify password is correct

**Problem**: "Insufficient privileges"
- Check your rank level vs. required rank
- Use higher rank user (e.g., INSPECTOR instead of SI)

**Problem**: "Admin access required"
- Only ADMIN (rankLevel 13) can create users
- Login with: `admin123@police.gov.in` / `admin@gov`

---

Generated: 2026-01-28
System: Smart FIR AI Assistant - Role-Based Auth v1.0
