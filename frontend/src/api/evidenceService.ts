/**
 * Evidence Service
 * 
 * API client for Evidence Management endpoints.
 * Handles file uploads, listing, and downloads.
 */

import { apiFetch } from './apiClient';

// Get API base URL from environment or use default
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

/**
 * Evidence interface matching backend response
 */
export interface Evidence {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video';
  size: string;
  uploadedBy: string;
  uploadDate: string;
  tags: string[];
  encrypted: boolean;
  description: string;
  url?: string; // Cloudinary URL
}

/**
 * Upload evidence file to backend
 * @param file - File to upload
 * @param uploadedBy - Name of person uploading
 * @param caseId - Optional case/FIR ID
 * @param description - Optional description
 * @param tags - Optional comma-separated tags
 * @returns Promise with uploaded evidence data
 */
export async function uploadEvidence(
  file: File,
  uploadedBy: string,
  caseId?: string,
  description?: string,
  tags?: string
): Promise<Evidence> {
  // Create FormData for multipart/form-data upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadedBy', uploadedBy);
  
  if (caseId) {
    formData.append('caseId', caseId);
  }
  
  if (description) {
    formData.append('description', description);
  }
  
  if (tags) {
    formData.append('tags', tags);
  }

  // Send POST request with file
  const response = await apiFetch('/evidence/upload', {
    method: 'POST',
    body: formData
    // Don't set Content-Type header - browser will set it with boundary
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Failed to upload evidence');
  }

  const data = await response.json();
  return data.evidence;
}

/**
 * Get all evidence files
 * @param filters - Optional filters (caseId, fileType, search)
 * @returns Promise with evidence list
 */
export async function getEvidence(filters?: {
  caseId?: string;
  fileType?: 'image' | 'video' | 'pdf';
  search?: string;
}): Promise<Evidence[]> {
  // Build query string
  const params = new URLSearchParams();
  if (filters?.caseId) {
    params.append('caseId', filters.caseId);
  }
  if (filters?.fileType) {
    params.append('fileType', filters.fileType);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const queryString = params.toString();
  const url = `/evidence${queryString ? `?${queryString}` : ''}`;

  // apiFetch already returns parsed JSON or throws
  const data = await apiFetch(url);
  // backend returns { evidence: [...] }
  return data?.evidence || [];
}

/**
 * Get download URL for evidence file
 * @param evidenceId - Evidence ID
 * @returns Download URL (redirects to Cloudinary)
 */
export function getDownloadUrl(evidenceId: string): string {
  return `${API_BASE}/evidence/download/${evidenceId}`;
}

