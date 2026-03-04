/**
 * Seed Users Script
 *
 * Creates default users for the Smart FIR AI Assistant
 */

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const defaultUsers = [
  {
    name: 'Officer John Doe',
    email: 'officer@police.gov.in',
    password: 'demo123',
    role: 'CONSTABLE',
    rank: 'Sub-Inspector',
    station: 'Central Police Station',
    badgeNumber: 'SI-001',
    phone: '+91-9876543210'
  },
  {
    name: 'Inspector Jane Smith',
    email: 'inspector@police.gov.in',
    password: 'demo123',
    role: 'INSPECTOR',
    rank: 'Inspector',
    station: 'Central Police Station',
    badgeNumber: 'INS-001',
    phone: '+91-9876543211'
  },
  {
    name: 'Admin Raj Kumar',
    email: 'admin@police.gov.in',
    password: 'demo123',
    role: 'ADMIN',
    rank: 'Deputy Commissioner',
    station: 'Police Headquarters',
    badgeNumber: 'DC-001',
    phone: '+91-9876543212'
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing police users (keep other users)
    await User.deleteMany({ email: { $in: defaultUsers.map(u => u.email) } });
    console.log('Cleared existing police users');

    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        // Update existing user
        existingUser.name = userData.name;
        existingUser.password = userData.password; // This will be hashed by pre-save hook
        existingUser.role = userData.role;
        existingUser.rank = userData.rank;
        existingUser.station = userData.station;
        existingUser.badgeNumber = userData.badgeNumber;
        existingUser.phone = userData.phone;
        
        // Set permissions based on role
        let permissions = [];
        if (userData.role === 'officer') {
          permissions = ['create_fir', 'view_fir', 'upload_evidence', 'search_cases'];
        } else if (userData.role === 'inspector') {
          permissions = ['create_fir', 'view_fir', 'approve_fir', 'reject_fir', 'upload_evidence', 'search_cases', 'view_analytics'];
        } else if (userData.role === 'admin') {
          permissions = ['create_fir', 'view_fir', 'approve_fir', 'reject_fir', 'upload_evidence', 'search_cases', 'view_analytics', 'manage_users', 'system_settings'];
        }
        existingUser.permissions = permissions;
        
        await existingUser.save();
        console.log(`Updated user: ${userData.email} (${userData.role})`);
        continue;
      }

      // Set permissions based on role
      let permissions = [];
      if (userData.role === 'officer') {
        permissions = ['create_fir', 'view_fir', 'upload_evidence', 'search_cases'];
      } else if (userData.role === 'inspector') {
        permissions = ['create_fir', 'view_fir', 'approve_fir', 'reject_fir', 'upload_evidence', 'search_cases', 'view_analytics'];
      } else if (userData.role === 'admin') {
        permissions = ['create_fir', 'view_fir', 'approve_fir', 'reject_fir', 'upload_evidence', 'search_cases', 'view_analytics', 'manage_users', 'system_settings'];
      }

      // Create user
      const user = new User({
        ...userData,
        permissions
      });

      await user.save();
      console.log(`Created user: ${userData.email} (${userData.role})`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedUsers();