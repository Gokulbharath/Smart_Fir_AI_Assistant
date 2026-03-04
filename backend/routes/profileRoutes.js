/**
 * Profile Routes
 * 
 * Handles user profile and settings management
 */

import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { User } from "../models/User.js";

const router = express.Router();

/**
 * GET /api/profile
 * Get user profile by email
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const email = req.query.email;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    console.log('[Profile] GET /api/profile - Email:', email);
    
    // Find user by email
    let user = await User.findOne({ email: email.toLowerCase() });
    
    // If user doesn't exist, create a default one (for demo purposes)
    if (!user) {
      // Determine role and default data based on email (use canonical uppercase roles)
      let role = 'CONSTABLE';
      let rank = 'Police Constable';
      let station = 'Sector 14 Police Station';
      let permissions = ['FIR_CREATE', 'FIR_VIEW', 'EVIDENCE_UPLOAD', 'CASE_SEARCH'];

      if (email.includes('inspector')) {
        role = 'INSPECTOR';
        rank = 'Police Inspector';
        permissions = ['FIR_CREATE', 'FIR_VIEW', 'FIR_APPROVE', 'FIR_SUBMIT', 'EVIDENCE_UPLOAD', 'CASE_SEARCH', 'VIEW_ANALYTICS'];
      } else if (email.includes('admin')) {
        role = 'ADMIN';
        rank = 'Superintendent of Police';
        station = 'District Headquarters';
        permissions = ['USER_MANAGE', 'SYSTEM_MANAGE'];
      }

      user = new User({
        email: email.toLowerCase(),
        name: email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        role: role,
        rank: rank,
        station: station,
        badgeNumber: `PB-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        department: 'Criminal Investigation Department',
        joinDate: new Date().toISOString().split('T')[0],
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        permissions: permissions,
        settings: {
          theme: 'light',
          autoSave: true,
          dataRetention: '1year',
          notifications: {
            email: true,
            push: true,
            sms: false,
            firApproval: true,
            systemUpdates: true
          }
        }
      });
      
      await user.save();
      console.log('[Profile] Created new user:', email);
    }
    
    // Update last login
    user.lastLoginAt = new Date();
    await user.save();
    
    // Transform to frontend format
    const profile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      rank: user.rank,
      station: user.station,
      badgeNumber: user.badgeNumber,
      department: user.department,
      joinDate: user.joinDate,
      avatar: user.avatar,
      permissions: user.permissions || [],
      settings: user.settings
    };
    
    res.json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('[Profile] GET error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch profile'
    });
  }
});

/**
 * PUT /api/profile
 * Update user profile
 */
router.put("/", authenticate, async (req, res) => {
  try {
    const { email, name, phone, badgeNumber, department, joinDate, avatar } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    console.log('[Profile] PUT /api/profile - Email:', email);
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (badgeNumber !== undefined) user.badgeNumber = badgeNumber;
    if (department !== undefined) user.department = department;
    if (joinDate !== undefined) user.joinDate = joinDate;
    if (avatar !== undefined) user.avatar = avatar;
    
    await user.save();
    
    console.log('[Profile] Updated profile for:', email);
    
    // Transform to frontend format
    const profile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      rank: user.rank,
      station: user.station,
      badgeNumber: user.badgeNumber,
      department: user.department,
      joinDate: user.joinDate,
      avatar: user.avatar,
      permissions: user.permissions || [],
      settings: user.settings
    };
    
    res.json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('[Profile] PUT error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile'
    });
  }
});

/**
 * PUT /api/profile/settings
 * Update user settings
 */
router.put("/settings", authenticate, async (req, res) => {
  try {
    const { email, settings } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    console.log('[Profile] PUT /api/profile/settings - Email:', email);
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update settings
    if (settings) {
      if (settings.theme) user.settings.theme = settings.theme;
      if (settings.autoSave !== undefined) user.settings.autoSave = settings.autoSave;
      if (settings.dataRetention) user.settings.dataRetention = settings.dataRetention;
      if (settings.notifications) {
        user.settings.notifications = {
          ...user.settings.notifications,
          ...settings.notifications
        };
      }
    }
    
    await user.save();
    
    console.log('[Profile] Updated settings for:', email);
    
    res.json({
      success: true,
      settings: user.settings
    });
  } catch (error) {
    console.error('[Profile] PUT /settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update settings'
    });
  }
});

export default router;


