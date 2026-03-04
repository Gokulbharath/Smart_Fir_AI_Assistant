import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ROLES } from '../config/permissions.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smart-fir-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/**
 * Create user (used by Admin)
 * Returns: { success, user, message }
 */
export async function createUserInRole(role, userData, createdBy = null) {
  try {
    // Basic validation
    if (!ROLES[role]) {
      return { success: false, error: `Invalid role: ${role}` };
    }

    const normalizedEmail = userData.email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    // Create new user (password will be hashed by pre-save)
    const newUser = await User.create({
      email: normalizedEmail,
      password: userData.password,
      name: userData.name,
      role: role,
      station: userData.station || null,
      createdBy: createdBy,
      status: 'ACTIVE',
      permissions: userData.permissions || []
    });

    return {
      success: true,
      user: newUser.toJSON(),
      message: `User created successfully as ${role}`
    };
  } catch (error) {
    console.error('[AuthService] User creation error:', error);
    return { success: false, error: error.message || 'Failed to create user' };
  }
}

/**
 * Get all users
 */
export async function getAllUsers() {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return users.map(u => u.toJSON());
  } catch (error) {
    console.error('[AuthService] Get users error:', error);
    return [];
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role) {
  try {
    const users = await User.find({ role }).sort({ name: 1 });
    return users.map(u => u.toJSON());
  } catch (error) {
    return [];
  }
}

/**
 * Delete user
 * Prevent deletion of ADMIN users
 */
export async function deleteUser(role, userId) { // role param kept for signature capability but unused
  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, error: 'User not found' };
    if (user.role === 'ADMIN') return { success: false, error: 'Admin user cannot be deleted' };

    await User.findByIdAndDelete(userId);
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to delete user' };
  }
}

/**
 * Get role hierarchy (Helper for UI/Logic)
 */
export function getRoleHierarchy() {
  return {
    CONSTABLE: { level: 1, description: 'Constable' },
    SI: { level: 3, description: 'Sub Inspector' },
    INSPECTOR: { level: 4, description: 'Inspector' },
    DSP: { level: 5, description: 'Deputy SP' },
    ASP: { level: 6, description: 'Assistant SP' },
    SP: { level: 7, description: 'Superintendent of Police' },
    DIG: { level: 8, description: 'Deputy Inspector General' },
    IG: { level: 9, description: 'Inspector General' },
    DGP: { level: 10, description: 'Director General of Police' },
    ADMIN: { level: 11, description: 'System Admin' }
  };
}
