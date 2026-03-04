/**
 * Profile Service
 * 
 * API client for Profile and Settings endpoints
 */

import { apiFetch } from './apiClient';

// Get API base URL from environment or use default
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

/**
 * Profile interface
 */
export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'officer' | 'inspector' | 'admin';
  rank: string;
  station: string;
  badgeNumber: string;
  department: string;
  joinDate: string;
  avatar?: string;
  permissions: string[];
  settings?: Settings;
}

/**
 * Settings interface
 */
export interface Settings {
  theme: 'light' | 'dark';
  autoSave: boolean;
  dataRetention: '6months' | '1year' | '2years' | '5years';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    firApproval: boolean;
    systemUpdates: boolean;
  };
}

/**
 * Get user profile by email (backend requires the query param but uses auth token)
 */
export async function getProfile(email: string): Promise<Profile> {
  const data = await apiFetch(`/profile?email=${encodeURIComponent(email)}`);
  // backend returns { success:true, profile: {...} }
  return data.profile;
}

/**
 * Update user profile
 */
export async function updateProfile(email: string, profileData: Partial<Profile>): Promise<Profile> {
  const data = await apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify({
      email,
      ...profileData
    })
  });
  return data.profile;
}

/**
 * Update user settings
 */
export async function updateSettings(email: string, settings: Partial<Settings>): Promise<Settings> {
  const data = await apiFetch('/profile/settings', {
    method: 'PUT',
    body: JSON.stringify({
      email,
      settings
    })
  });
  return data.settings;
}


