# 🚀 QUICK START - POLICE ROLE-BASED AUTHENTICATION

## Step 1: Backend Configuration

### 1.1 Update `.env`

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/smart_fir

# Server
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Admin Credentials (Do NOT change)
ADMIN_LOGIN=admin123@police.gov.in
ADMIN_PASSWORD=admin@gov
```

### 1.2 Import Models in server.js

Add these imports at the top of `backend/server.js`:

```javascript
import { Constable } from './models/Constable.js';
import { HeadConstable } from './models/HeadConstable.js';
import { ASI } from './models/ASI.js';
import { SI } from './models/SI.js';
import { Inspector } from './models/Inspector.js';
import { DSP } from './models/DSP.js';
import { ASP } from './models/ASP.js';
import { SP } from './models/SP.js';
import { DIG } from './models/DIG.js';
import { IG } from './models/IG.js';
import { ADGP } from './models/ADGP.js';
import { DGP } from './models/DGP.js';
import { Admin } from './models/Admin.js';
import authService from './services/authService.js';
import { authenticateToken, requireMinRank, requireAdmin } from './middleware/authMiddleware.js';
```

## Step 2: Test Authentication

### 2.1 Start Backend
```bash
cd backend
npm run dev
```

### 2.2 Login as Admin
```bash
# In your browser or Postman
POST http://localhost:5000/api/auth/login

{
  "loginId": "admin123@police.gov.in",
  "password": "admin@gov"
}

# Response:
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

### 2.3 Create a Test User
```bash
POST http://localhost:5000/api/auth/admin/create-user
Authorization: Bearer {token_from_step_2.2}

{
  "role": "INSPECTOR",
  "loginId": "inspector001@police.gov.in",
  "password": "demo123",
  "name": "Rajesh Kumar"
}
```

### 2.4 Login as Inspector
```bash
POST http://localhost:5000/api/auth/login

{
  "loginId": "inspector001@police.gov.in",
  "password": "demo123"
}
```

## Step 3: Protect Existing Routes

Add authentication middleware to your existing routes.

### Example: Protect FIR Routes

```javascript
// Before (unprotected):
app.get('/api/fir/drafts', async (req, res) => { ... });

// After (protected - SI+ only can search):
app.get('/api/fir/drafts', 
  authenticateToken, 
  requireMinRank(4), 
  async (req, res) => { ... }
);

// After (protected - DSP+ only can approve):
app.post('/api/fir/approve', 
  authenticateToken, 
  requireMinRank(6), 
  async (req, res) => { ... }
);

// After (protected - ADMIN only can delete):
app.delete('/api/fir/:id', 
  authenticateToken, 
  requireAdmin, 
  async (req, res) => { ... }
);
```

### Example: Protect Evidence Routes

```javascript
// SI+ can upload evidence
app.post('/api/evidence/upload',
  authenticateToken,
  requireMinRank(4),
  async (req, res) => { ... }
);

// SI+ can download evidence
app.get('/api/evidence/:id',
  authenticateToken,
  requireMinRank(4),
  async (req, res) => { ... }
);
```

### Example: Protect Case Search

```javascript
// SI+ can search cases
app.get('/api/cases/search',
  authenticateToken,
  requireMinRank(4),
  async (req, res) => { ... }
);
```

## Step 4: Frontend Integration

### 4.1 Update Login Component

Already done! Just verify in `frontend/src/components/Login.tsx`

### 4.2 Use AuthContext in Components

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, canApprove, canSearch, hasMinRankLevel } = useAuth();

  return (
    <>
      <p>Logged in as: {user?.name} ({user?.role})</p>
      
      {canSearch() && <button>Search Cases</button>}
      {canApprove() && <button>Approve FIR</button>}
      {canUploadEvidence() && <button>Upload Evidence</button>}
      {hasMinRankLevel(8) && <p>SP+ features available</p>}
    </>
  );
};
```

### 4.3 Protect Frontend Routes

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; minRank?: number }> = ({ 
  children, 
  minRank = 1 
}) => {
  const { isAuthenticated, hasMinRankLevel } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!hasMinRankLevel(minRank)) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

// Usage:
<Route 
  path="/fir/approve" 
  element={<ProtectedRoute minRank={6}><FIRApproval /></ProtectedRoute>} 
/>
```

## Step 5: Create Sample Users

Use Admin Panel or API to create users:

```javascript
// Admin
loginId: admin123@police.gov.in
password: admin@gov

// Inspector
loginId: inspector001@police.gov.in
password: demo123

// SI
loginId: si001@police.gov.in
password: demo123

// DSP
loginId: dsp001@police.gov.in
password: demo123

// SP
loginId: sp001@police.gov.in
password: demo123
```

## Step 6: Rank Level Reference

| Role | Level | Permissions |
|------|-------|-------------|
| CONSTABLE | 1 | Read-only |
| HEAD_CONSTABLE | 2 | Read-only |
| ASI | 3 | Read-only |
| SI | 4 | **Can search, upload evidence** |
| INSPECTOR | 5 | **Can search, upload evidence** |
| DSP | 6 | **Can approve, manage cases** |
| ASP | 7 | **Can approve, manage cases** |
| SP | 8 | **Can approve, manage cases** |
| DIG | 9 | **Full access** |
| IG | 10 | **Full access** |
| ADGP | 11 | **Full access** |
| DGP | 12 | **Full access** |
| ADMIN | 13 | **Manage users** |

## Common Issues

### "Invalid credentials"
- Check login ID spelling
- Verify user exists in database
- Make sure password is correct

### "Insufficient privileges"
- Your rank level is too low
- Use a higher rank (e.g., INSPECTOR instead of SI)
- Check `minRank` requirement

### "Admin access required"
- Only ADMIN can create users
- Login with admin123@police.gov.in

### No token received
- Backend not responding
- Check if server is running on port 5000
- Verify FRONTEND_ORIGIN in .env

## Files Changed

**Backend:**
- ✅ `backend/models/` - 13 new role models
- ✅ `backend/services/authService.js` - Auth logic
- ✅ `backend/middleware/authMiddleware.js` - Rank checking
- ✅ `backend/routes/authRoutes.js` - New auth endpoints
- ✅ `backend/.env.example` - Configuration template

**Frontend:**
- ✅ `frontend/src/contexts/AuthContext.tsx` - Rank support
- ✅ `frontend/src/api/authService.ts` - New API calls
- ✅ `frontend/src/components/Login.tsx` - Updated UI
- ✅ `frontend/src/components/AdminUserManager.tsx` - User creation
- ✅ `frontend/src/components/AdminPanel.tsx` - Integration

## Next: Integrate with FIR System

1. Add `authenticateToken` to all FIR routes
2. Add `requireMinRank(6)` to approval endpoints
3. Add `requireMinRank(4)` to search endpoints
4. Update evidence routes similarly
5. Test with different user roles

---

**Version**: 1.0  
**Date**: 2026-01-28  
**Status**: ✅ Ready for deployment
