import jwt from 'jsonwebtoken';
import { ROLE_PERMISSIONS } from '../config/permissions.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smart-fir-secret-key-change-in-production';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn('[Auth] No token provided in header:', authHeader);
    return res.status(401).json({ error: 'Authentication required: No token provided' });
  }

  console.log('[Auth] Verifying token');

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('[Auth] Token verification failed:', err.message);
      return res.status(403).json({ error: 'Authentication failed: Invalid or expired token' });
    }

    // Attach sanitized user object
    req.user = {
      id: decoded.userId || decoded.id,
      role: decoded.role
    };

    console.log(`[Auth] Protected route accessed by ${req.user.id} (${req.user.role})`);
    next();
  });
};

/**
 * Middleware generator for roles
 * Example: roleGuard(['ADMIN']) or roleGuard(['INSPECTOR', 'SP'])
 */
export const roleGuard = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      return res.status(500).json({ error: 'Server misconfiguration: allowedRoles required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`[Auth] Role mismatch for user ${req.user.id}: required ${allowedRoles.join(', ')}, got ${req.user.role}`);
      return res.status(403).json({ error: 'Access denied: Insufficient role' });
    }

    console.log(`[Auth] Role guard passed for ${req.user.id} (${req.user.role})`);
    next();
  };
};

/**
 * Middleware to check if user has a specific permission
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const userRole = req.user.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    if (!permissions.includes(permission)) {
      console.warn(`[Auth] Access denied for ${req.user.id} (${userRole}). Missing permission: ${permission}`);
      return res.status(403).json({ error: 'Access denied: Insufficient permissions', required: permission });
    }

    next();
  };
};

/**
 * Middleware to strictly require ADMIN role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied: Admin privileges required' });
  next();
};

/**
 * Middleware to require POLICE role (Any role that is NOT Admin)
 */
export const requirePolice = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role === 'ADMIN') return res.status(403).json({ error: 'Access denied: This feature is for Police operations only' });
  next();
};

export const authenticate = authenticateJWT; // Alias
