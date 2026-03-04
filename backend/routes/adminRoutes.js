import express from 'express';
import { createUserInRole, getAllUsers, getRoleHierarchy } from '../services/authService.js';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware.js';
import { DraftFIR, FinalFIR } from '../models/FIR.js';
import { Case } from '../models/Case.js';
import { User } from '../models/User.js';
import { ROLES } from '../config/permissions.js';

const router = express.Router();

// Middleware to ensure all routes in this file require Admin access
router.use(authenticateJWT, requireAdmin);

/**
 * POST /api/admin/users
 * Create a new user (admin/officer/inspector/etc)
 */
router.post('/users', async (req, res) => {
  try {
    const { email, password, role, name, station, status } = req.body;

    // Basic validation
    if (!email || !password || !role || !name) {
      return res.status(400).json({ success: false, error: 'Email, password, role, and name are required' });
    }

    const normalizedRole = String(role).toUpperCase();

    // Disallow creating ADMIN via API
    if (normalizedRole === 'ADMIN') {
      return res.status(400).json({ success: false, error: 'Cannot create ADMIN via this endpoint' });
    }

    // Strict role validation
    const validRoles = Object.keys(ROLES || {});
    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({ success: false, error: `Invalid role: ${role}` });
    }

    // station is required for all police roles
    if (!station || String(station).trim() === '') {
      return res.status(400).json({ success: false, error: 'Station is required for police users' });
    }

    // Validate password length security
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    // Validate status
    const finalStatus = (status && String(status).toUpperCase()) || 'ACTIVE';
    if (!['ACTIVE', 'SUSPENDED'].includes(finalStatus)) {
      return res.status(400).json({ success: false, error: "Status must be 'ACTIVE' or 'SUSPENDED'" });
    }

    // Check uniqueness
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    // Create user (password will be hashed by model pre-save)
    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role: normalizedRole,
      station,
      status: finalStatus,
      createdBy: req.user && req.user.id ? req.user.id : null
    });

    console.log(`[Admin] User created by ${req.user && req.user.id} with role ${normalizedRole}`);

    res.status(201).json({ success: true, user: newUser.toJSON() });
  } catch (error) {
    console.error('[AdminRoutes] Create user error:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (String(req.user.id) === String(id)) {
      return res.status(403).json({ success: false, error: 'Admin cannot delete themselves' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin user cannot be deleted' });
    }

    await User.findByIdAndDelete(id);
    console.log(`[Admin] User deleted by ${req.user.id}: ${user.email}`);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('[AdminRoutes] Delete user error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) return res.status(400).json({ error: 'Role is required' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent changing admin role of the seeded admin accidentally
    if (String(user._id) === String(req.user.id) && user.role === 'ADMIN' && role !== 'ADMIN') {
      return res.status(400).json({ error: 'Cannot change role of this admin' });
    }

    user.role = role;
    await user.save();
    console.log(`[Admin] Role updated: ${user.email} -> ${role} by ${req.user.id}`);

    res.json({ success: true, message: 'Role updated', user: user.toJSON() });
  } catch (error) {
    console.error('[AdminRoutes] Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();

    // Map to frontend expectation (SystemUser interface)
    const mappedUsers = users.map(u => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      station: u.station || null,
      rank: u.rank || u.role,
      badgeNumber: u.badgeNumber || 'N/A',
      status: (u.status || 'ACTIVE').toLowerCase(),
      lastLogin: u.lastLoginAt || u.createdAt
    }));

    res.json({ success: true, users: mappedUsers });
  } catch (error) {
    console.error('[AdminRoutes] Get users error:', error);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body; // Accept 'active'|'inactive' or 'ACTIVE'|'SUSPENDED'

    if (!status) return res.status(400).json({ error: 'Status is required' });
    status = String(status).toUpperCase();

    // Map legacy values
    if (status === 'ACTIVE') status = 'ACTIVE';
    if (status === 'INACTIVE') status = 'SUSPENDED';
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'ACTIVE' or 'SUSPENDED'" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent suspending Admin accounts
    if (user.role === 'ADMIN' && status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Admin account cannot be suspended' });
    }

    // Prevent admin from suspending themselves
    if (String(req.user.id) === String(id) && status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Admin cannot suspend themselves' });
    }

    user.status = status;
    await user.save();

    res.json({ success: true, message: `User marked as ${status.toLowerCase()}`, user: { id: user._id, email: user.email, status: user.status } });
  } catch (error) {
    console.error('[AdminRoutes] Update status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});


/**
 * GET /api/admin/stats
 * System statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const draftFIRs = await DraftFIR.countDocuments();
    const finalFIRs = await FinalFIR.countDocuments();
    const cases = await Case.countDocuments();
    const userCount = await User.countDocuments();
    const activeUserCount = await User.countDocuments({ status: 'ACTIVE' });

    res.json({
      success: true,
      stats: {
        totalFIRs: draftFIRs + finalFIRs,
        draftFIRs,
        finalFIRs,
        totalCases: cases,
        systemUptime: process.uptime(),
        totalUsers: userCount,
        activeUsers: activeUserCount,
        // Mock data for AI/Approval fields that don't have real metrics yet
        activeSessions: Math.floor(activeUserCount * 0.4),
        aiAccuracy: '94.5%', // Mock
        totalEvidence: await Case.countDocuments() * 3, // Mock approximation
        approvalRate: '87%' // Mock
      }
    });
  } catch (error) {
    console.error('[AdminRoutes] Get stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

/**
 * GET /api/admin/analytics
 * System analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentFIRs = await DraftFIR.countDocuments({ createdAt: { $gte: lastWeek } });
    const recentCases = await Case.countDocuments({ createdAt: { $gte: lastWeek } });

    res.json({
      success: true,
      analytics: {
        lastWeekFIRs: recentFIRs,
        lastWeekCases: recentCases,
        timestamp: new Date(),
        // Mock nested objects for Frontend interface compatibility
        aiPerformance: {
          accuracyRate: "92%",
          processingTime: "1.2s",
          successRate: "99.9%"
        },
        systemHealth: {
          serverUptime: "99.99%",
          databaseStatus: "Healthy",
          apiResponse: "45ms"
        }
      }
    });
  } catch (error) {
    console.error('[AdminRoutes] Get analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

export default router;