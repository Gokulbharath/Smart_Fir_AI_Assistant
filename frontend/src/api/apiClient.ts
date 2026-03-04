/**
 * API Client Utility
 * 
 * Provides a centralized fetch wrapper that automatically includes JWT tokens
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

/**
 * Get stored JWT token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Fetch wrapper that automatically includes JWT token in Authorization header
 * and returns parsed JSON. Throws on any non-2xx response.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    // if body is empty or not JSON, just propagate response
    data = null;
  }

  if (!response.ok) {
    const msg = data && data.error ? data.error : response.statusText;
    const err = new Error(msg || 'API request failed');
    // attach response/status for callers who need it
    (err as any).status = response.status;
    (err as any).response = data;
    throw err;
  }

  return data;
}

