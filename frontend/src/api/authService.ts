/**
 * Authentication Service
 * 
 * API client for authentication endpoints (login, logout, profile)
 */

import { apiFetch, getAuthToken } from './apiClient';

export type PoliceRole = 
  | 'CONSTABLE' | 'HEAD_CONSTABLE' | 'ASI' | 'SI' | 'INSPECTOR'
  | 'DSP' | 'SP' | 'DIG' | 'IG' | 'ADGP' | 'DGP' | 'ADMIN';

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: PoliceRole;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id?: string;
    email: string;
    name: string;
    role: PoliceRole;
  };
}

/**
 * Login user with email and password
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  // login endpoint isn't wrapped by apiFetch since token isn't available yet
  const response = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000/api"}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Login failed');
  }

  return result;
}

/**
 * Logout (clear token on frontend)
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (err) {
    console.warn('Logout API failed, continuing local logout');
  }
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<{ success: boolean; user: any }> {
  // apiFetch throws on error and returns parsed body
  const result = await apiFetch('/auth/me', { method: 'GET' });
  return result;
}

/**
 * Create a new police user (ADMIN ONLY)
 */
export async function createUser(token: string, data: CreateUserData): Promise<{ success: boolean; user: any; message: string }> {
  const response = await apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create user');
  }

  return result;
}

/**
 * Get all users (ADMIN ONLY)
 */
export async function getAllUsers(token: string): Promise<{ success: boolean; users: any[] }> {
  const response = await apiFetch('/admin/users', {
    method: 'GET',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get users');
  }

  return result;
}

/**
 * Get role hierarchy
 */
export async function getRoleHierarchy(): Promise<{ success: boolean; hierarchy: Record<string, number> }> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000/api"}/auth/hierarchy`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to get hierarchy');
  }

  return result;
}

