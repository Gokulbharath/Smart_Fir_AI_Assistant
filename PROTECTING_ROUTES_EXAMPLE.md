# 🔒 PROTECTING EXISTING ROUTES - COMPLETE EXAMPLE

This document shows how to add role-based authentication to your existing FIR, Evidence, and Case Retrieval routes.

## Index

1. [FIR Routes Protection](#fir-routes)
2. [Evidence Routes Protection](#evidence-routes)
3. [Case Retrieval Protection](#case-retrieval)
4. [Admin Routes Protection](#admin-routes)
5. [Analytics Routes Protection](#analytics-routes)

---

## FIR Routes

### Current: Unprotected Route

```javascript
// OLD - Anyone can access!
app.get('/api/fir/drafts', async (req, res) => {
  const drafts = await DraftFIR.find({ status: 'draft' });
  res.json({ success: true, drafts });
});
```

### New: Protected Route

```javascript
// NEW - Only SI+ (rank 4+) can search
import { authenticateToken, requireMinRank } from './middleware/authMiddleware.js';

app.get('/api/fir/drafts', 
  authenticateToken,        // Verify JWT token
  requireMinRank(4),        // SI+ (rank 4 and above)
  async (req, res) => {
    const userId = req.user.loginId;
    const userRank = req.user.rankLevel;
    
    try {
      const drafts = await DraftFIR.find({ status: 'draft' });
      res.json({ 
        success: true, 
        drafts,
        metadata: {
          user: userId,
          rank: userRank,
          count: drafts.length
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

### Complete FIR Routes Example

```javascript
import { authenticateToken, requireMinRank, requireRole, requireAdmin } from './middleware/authMiddleware.js';
import { DraftFIR, FinalFIR } from './models/FIR.js';

// ============================================
// CONSTABLE - ASI: Read-only (rank 1-3)
// ============================================

// Any authenticated user can VIEW approved FIRs
app.get('/api/fir/approved', 
  authenticateToken,
  async (req, res) => {
    try {
      const firs = await FinalFIR.find({ status: 'approved' });
      res.json({ success: true, firs });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============================================
// SI - INSPECTOR: Can create & search (rank 4-5)
// ============================================

// SI+ can CREATE FIRs
app.post('/api/fir/create-draft',
  authenticateToken,
  requireMinRank(4),           // SI (rank 4) and above
  async (req, res) => {
    const { caseDescription, victim, accused, incident } = req.body;
    
    try {
      const fir = new DraftFIR({
        caseDescription,
        victim,
        accused,
        incident,
        createdBy: req.user.loginId,
        status: 'draft'
      });
      
      await fir.save();
      
      res.status(201).json({ 
        success: true, 
        fir,
        message: `FIR created by ${req.user.name} (${req.user.role})`
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// SI+ can SEARCH cases
app.get('/api/fir/search',
  authenticateToken,
  requireMinRank(4),           // SI (rank 4) and above
  async (req, res) => {
    const { query } = req.query;
    
    try {
      // Search in both draft and final FIRs
      const results = await Promise.all([
        DraftFIR.find({ $text: { $search: query as string } }),
        FinalFIR.find({ $text: { $search: query as string } })
      ]);
      
      res.json({
        success: true,
        draft: results[0],
        final: results[1],
        searchBy: req.user.loginId
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============================================
// DSP - SP: Can approve & manage (rank 6-8)
// ============================================

// DSP+ can APPROVE FIRs
app.post('/api/fir/approve',
  authenticateToken,
  requireMinRank(6),           // DSP (rank 6) and above
  async (req, res) => {
    const { firId, decision } = req.body;
    
    try {
      const draftFir = await DraftFIR.findById(firId);
      
      if (!draftFir) {
        return res.status(404).json({ 
          success: false, 
          error: 'FIR not found' 
        });
      }
      
      if (decision === 'approve') {
        // Move to final FIRs collection
        const finalFir = new FinalFIR({
          ...draftFir.toObject(),
          status: 'approved',
          approvedBy: req.user.loginId,
          approvedAt: new Date()
        });
        
        await finalFir.save();
        await DraftFIR.deleteOne({ _id: firId });
        
        res.json({
          success: true,
          message: `FIR approved by ${req.user.name} (${req.user.role})`,
          fir: finalFir
        });
      } else if (decision === 'reject') {
        // Send back for revision
        draftFir.status = 'draft';
        draftFir.rejectionReason = req.body.reason;
        await draftFir.save();
        
        res.json({
          success: true,
          message: `FIR rejected by ${req.user.name}`,
          fir: draftFir
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============================================
// DIG - DGP: Full access (rank 9-12)
// ============================================

// DIG+ can VIEW all FIRs (including personal drafts)
app.get('/api/fir/all',
  authenticateToken,
  requireMinRank(9),           // DIG (rank 9) and above
  async (req, res) => {
    try {
      const [drafts, finals] = await Promise.all([
        DraftFIR.find({}),
        FinalFIR.find({})
      ]);
      
      res.json({
        success: true,
        drafts,
        finals,
        total: drafts.length + finals.length,
        viewedBy: req.user.name
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============================================
// ADMIN: System management (rank 13)
// ============================================

// ADMIN only can DELETE FIRs
app.delete('/api/fir/:id',
  authenticateToken,
  requireAdmin,                // ADMIN only (rank 13)
  async (req, res) => {
    const { id } = req.params;
    
    try {
      // Try to delete from both collections
      const draftResult = await DraftFIR.deleteOne({ _id: id });
      const finalResult = await FinalFIR.deleteOne({ _id: id });
      
      if (!draftResult.deletedCount && !finalResult.deletedCount) {
        return res.status(404).json({ 
          success: false, 
          error: 'FIR not found' 
        });
      }
      
      res.json({
        success: true,
        message: `FIR deleted by ${req.user.name} (ADMIN)`,
        deletedCount: draftResult.deletedCount + finalResult.deletedCount
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ADMIN can RESET database
app.post('/api/admin/reset-firs',
  authenticateToken,
  requireAdmin,                // ADMIN only
  async (req, res) => {
    try {
      const draftCount = await DraftFIR.deleteMany({});
      const finalCount = await FinalFIR.deleteMany({});
      
      res.json({
        success: true,
        message: `Database reset by ${req.user.name}`,
        deletedDrafts: draftCount.deletedCount,
        deletedFinals: finalCount.deletedCount
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

---

## Evidence Routes

```javascript
import { authenticateToken, requireMinRank, requireAdmin } from './middleware/authMiddleware.js';
import { Evidence } from './models/Evidence.js';

// ============================================
// SI - INSPECTOR: Can upload/download (rank 4-5)
// ============================================

// SI+ can UPLOAD evidence
app.post('/api/evidence/upload',
  authenticateToken,
  requireMinRank(4),           // SI (rank 4) and above
  async (req, res) => {
    const { fileName, fileUrl, evidenceType } = req.body;
    const { loginId, name, role } = req.user;
    
    try {
      const evidence = new Evidence({
        fileName,
        fileUrl,
        evidenceType,
        uploadedBy: loginId,
        uploadedByName: name,
        uploadedByRole: role,
        uploadDate: new Date()
      });
      
      await evidence.save();
      
      res.status(201).json({
        success: true,
        evidence,
        message: `Evidence uploaded by ${name} (${role})`
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// SI+ can DOWNLOAD evidence
app.get('/api/evidence/:id',
  authenticateToken,
  requireMinRank(4),           // SI (rank 4) and above
  async (req, res) => {
    try {
      const evidence = await Evidence.findById(req.params.id);
      
      if (!evidence) {
        return res.status(404).json({ 
          success: false, 
          error: 'Evidence not found' 
        });
      }
      
      res.json({
        success: true,
        evidence,
        downloadedBy: req.user.loginId,
        downloadedAt: new Date()
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DSP+ can VIEW all evidence
app.get('/api/evidence/all',
  authenticateToken,
  requireMinRank(6),           // DSP (rank 6) and above
  async (req, res) => {
    try {
      const evidence = await Evidence.find({});
      
      res.json({
        success: true,
        evidence,
        viewedBy: req.user.name
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ADMIN can DELETE evidence
app.delete('/api/evidence/:id',
  authenticateToken,
  requireAdmin,                // ADMIN only
  async (req, res) => {
    try {
      const result = await Evidence.deleteOne({ _id: req.params.id });
      
      if (!result.deletedCount) {
        return res.status(404).json({ 
          success: false, 
          error: 'Evidence not found' 
        });
      }
      
      res.json({
        success: true,
        message: `Evidence deleted by ${req.user.name} (ADMIN)`
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

---

## Case Retrieval

```javascript
import { authenticateToken, requireMinRank, requireAdmin } from './middleware/authMiddleware.js';
import { Case } from './models/Case.js';

// SI+ can SEARCH cases
app.get('/api/cases/search',
  authenticateToken,
  requireMinRank(4),           // SI (rank 4) and above
  async (req, res) => {
    const { query } = req.query;
    
    try {
      const cases = await Case.find({ 
        $text: { $search: query as string } 
      });
      
      res.json({
        success: true,
        cases,
        searchedBy: req.user.loginId,
        count: cases.length
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DIG+ can VIEW all cases
app.get('/api/cases/all',
  authenticateToken,
  requireMinRank(9),           // DIG (rank 9) and above
  async (req, res) => {
    try {
      const cases = await Case.find({});
      
      res.json({
        success: true,
        cases,
        viewedBy: req.user.name
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ADMIN can DELETE cases
app.delete('/api/cases/:id',
  authenticateToken,
  requireAdmin,                // ADMIN only
  async (req, res) => {
    try {
      const result = await Case.deleteOne({ _id: req.params.id });
      
      if (!result.deletedCount) {
        return res.status(404).json({ 
          success: false, 
          error: 'Case not found' 
        });
      }
      
      res.json({
        success: true,
        message: `Case deleted by ${req.user.name} (ADMIN)`
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

---

## Admin Routes

```javascript
import { authenticateToken, requireAdmin } from './middleware/authMiddleware.js';

// ADMIN only - Get system stats
app.get('/api/admin/stats',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const stats = {
        totalUsers: 42,
        activeSessions: 8,
        systemUptime: '99.9%',
        aiAccuracy: '94.2%'
      };
      
      res.json({
        success: true,
        stats,
        viewedBy: req.user.loginId
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ADMIN only - Get all users
app.get('/api/admin/users',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      // This calls authService.getAllUsers()
      const result = await getAllUsers();
      
      res.json({
        success: true,
        users: result.users,
        queriedBy: req.user.loginId
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

---

## Analytics Routes

```javascript
import { authenticateToken, requireMinRank } from './middleware/authMiddleware.js';

// DSP+ can VIEW analytics
app.get('/api/analytics/dashboard',
  authenticateToken,
  requireMinRank(6),           // DSP (rank 6) and above
  async (req, res) => {
    try {
      const analytics = {
        totalFIRs: 1250,
        approvingRate: 0.85,
        pendingCases: 340,
        resolvedCases: 910
      };
      
      res.json({
        success: true,
        analytics,
        viewedBy: req.user.name
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

---

## Permission Summary

| Endpoint | Rank Needed | Roles |
|----------|------------|-------|
| `/api/fir/approved` | 1+ | All |
| `/api/fir/drafts` | 4+ | SI, INSPECTOR, DSP, ASP, SP, DIG, IG, ADGP, DGP |
| `/api/fir/create-draft` | 4+ | SI, INSPECTOR, DSP, ASP, SP, DIG, IG, ADGP, DGP |
| `/api/fir/approve` | 6+ | DSP, ASP, SP, DIG, IG, ADGP, DGP |
| `/api/fir/delete` | 13 | ADMIN |
| `/api/evidence/upload` | 4+ | SI, INSPECTOR, DSP, ASP, SP, DIG, IG, ADGP, DGP |
| `/api/evidence/download` | 4+ | SI, INSPECTOR, DSP, ASP, SP, DIG, IG, ADGP, DGP |
| `/api/cases/search` | 4+ | SI, INSPECTOR, DSP, ASP, SP, DIG, IG, ADGP, DGP |
| `/api/admin/stats` | 13 | ADMIN |
| `/api/analytics` | 6+ | DSP, ASP, SP, DIG, IG, ADGP, DGP |

---

**Version**: 1.0  
**Status**: ✅ Ready to implement
