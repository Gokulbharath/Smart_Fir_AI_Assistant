/**
 * Admin Service
 * 
 * API client for Admin Panel endpoints
 * Uses apiFetch to automatically include JWT token
 */

import { apiFetch } from './apiClient';

/**
 * Admin Stats interface
 */
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  activeSessions: number;
  systemUptime: string;
  aiAccuracy: string;
  totalFIRs: number;
  totalEvidence: number;
  approvalRate: string;
}

/**
 * System User interface
 */
export interface SystemUser {
  id: string;
  name: string;
  email: string;
  // Roles are canonical uppercase strings from the backend (e.g. 'CONSTABLE', 'INSPECTOR')
  role: string;
  station: string | null;
  rank: string;
  badgeNumber: string;
  // status returned as lowercase 'active'|'suspended' for UI convenience
  status: 'active' | 'suspended' | string;
  lastLogin: string | null;
}

/**
 * Admin Analytics interface
 */
export interface AdminAnalytics {
  aiPerformance: {
    accuracyRate: string;
    processingTime: string;
    successRate: string;
  };
  systemHealth: {
    serverUptime: string;
    databaseStatus: string;
    apiResponse: string;
  };
}

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  const data = await apiFetch('/admin/stats');
  return data.stats;
}

/**
 * Get all users
 */
export async function getAdminUsers(): Promise<SystemUser[]> {
  const data = await apiFetch('/admin/users');
  return data.users;
}

/**
 * Create a new police user (ADMIN ONLY)
 */
export interface CreatePoliceUserPayload {
  email: string;
  password: string;
  role: string; // Should be one of allowed police roles (not ADMIN)
  station: string | null;
  status?: 'ACTIVE' | 'SUSPENDED';
  name?: string;
}

export async function createUser(data: CreatePoliceUserPayload) {
  const result = await apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return result.user;
}

/**
 * Update user status (activate / suspend)
 */
export async function updateUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
  const result = await apiFetch(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  return result.user;
}

/**
 * Delete user (ADMIN ONLY)
 */
export async function deleteUser(id: string) {
  return await apiFetch(`/admin/users/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Get admin analytics
 */
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const data = await apiFetch('/admin/analytics');
  return data.analytics;
}


