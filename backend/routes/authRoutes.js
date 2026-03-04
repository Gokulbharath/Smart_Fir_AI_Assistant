/**
 * Authentication Routes
 * 
 * POST /api/auth/login - Login with email and password
 * POST /api/auth/logout - Logout (frontend-handled)
 * GET  /api/auth/me - Get current user profile
 * GET  /api/auth/debug - Debug environment configuration
 */

import express from 'express';
import { login, logout, getProfile } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login with email and password
 * Returns JWT token
 * 
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * Logout (handled on frontend - just return success)
 */
router.post('/logout', authenticateJWT, logout);

/**
 * GET /api/auth/debug
 * Debug endpoint - shows environment configuration (REMOVE IN PRODUCTION)
 */
router.get('/debug', (req, res) => {
  res.json({
    message: 'Debug Info - Remove in production',
    config: {
      adminEmail: process.env.ADMIN_EMAIL || 'NOT SET',
      adminPassword: process.env.ADMIN_PASSWORD ? '***SET***' : 'NOT SET',
      jwtSecret: process.env.JWT_SECRET ? '***SET***' : 'NOT SET',
      mongoUri: process.env.MONGODB_URI ? '***SET***' : 'NOT SET',
      frontend: process.env.FRONTEND_ORIGIN || 'NOT SET'
    }
  });
});

/**
 * GET /api/auth/me
 * Get current user profile from JWT
 */
router.get('/me', authenticateJWT, getProfile);

export default router;

