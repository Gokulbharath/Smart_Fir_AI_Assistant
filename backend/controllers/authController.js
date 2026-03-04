import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ROLE_PERMISSIONS } from '../config/permissions.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smart-fir-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user in DB (include password field explicitly)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log(`[Auth] Login failed: User not found (${email})`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is deactivated or suspended' });
    }

    // Defensive check: password field must exist before comparing
    if (!user.password) {
      // This should never happen if users are created correctly, but guard anyway
      console.error(`[Auth] Login failed: user has no password stored (${email})`);
      // treat as invalid credentials rather than leaking internal details
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    let isMatch = false;
    try {
      isMatch = await user.comparePassword(password);
    } catch (bcryptErr) {
      // bcrypt throws if the stored hash is invalid or undefined
      console.error('[Auth] bcrypt error during comparison:', bcryptErr);
      return res.status(500).json({ error: 'Internal server error during login' });
    }

    if (!isMatch) {
      console.log(`[Auth] Login failed: Bad password (${email})`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT payload - strict minimal payload required
    const payload = {
      userId: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Log admin login explicitly
    if (user.role === 'ADMIN') {
      console.log(`[Auth] Admin login success: ${user.email}`);
    } else {
      console.log(`[Auth] Login success: ${user.email} (${user.role})`);
    }

    // Return user info (excluding password)
    const userObj = user.toJSON();

    // Attach permissions to response for Frontend use
    const permissions = ROLE_PERMISSIONS[user.role] || [];

    res.json({
      success: true,
      token,
      user: {
        ...userObj,
        permissions
      }
    });

  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user.userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    res.json({ success: true, user: { ...user.toJSON(), permissions } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
