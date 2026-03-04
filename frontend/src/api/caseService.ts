/**
 * Case Service - API client for Case Retrieval System
 * 
 * IMPORTANT: All case data is SYNTHETIC and generated for academic/research purposes.
 * No real FIR records or personal information are accessed.
 */

import { apiFetch } from './apiClient';

export interface Case {
  id: string;
  firId: string;
  firNumber: string;
  title: string;
  description: string;
  status: string;
  officerInCharge: string;
  date: string;
  location: string;
  ipcSections: string[];
  similarity: number;
  similarityExplanation?: string;
}

export interface CaseSearchRequest {
  query: string;
  ipcSections?: string[];
  status?: string;
  location?: string;
  limit?: number;
}

export interface CaseSearchResponse {
  success: boolean;
  cases: Case[];
  count: number;
  query: string;
  message: string;
}

export interface CaseDetailsResponse {
  success: boolean;
  case: Case & {
    isSynthetic: boolean;
    createdAt: string;
    similarityExplanation?: string;
  };
}

export interface CaseStats {
  total: number;
  byStatus: {
    Closed: number;
    Investigating: number;
    Pending: number;
  };
}

/**
 * Search for similar cases
 */
export async function searchCases(request: CaseSearchRequest): Promise<CaseSearchResponse> {
  return await apiFetch('/cases/search', {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

/**
 * Get case details by ID
 */
export async function getCaseDetails(id: string, query?: string): Promise<CaseDetailsResponse> {
  const url = query 
    ? `/cases/${id}?query=${encodeURIComponent(query)}`
    : `/cases/${id}`;
  return await apiFetch(url);
}

/**
 * Get case statistics
 */
export async function getCaseStats(): Promise<CaseStats> {
  const data = await apiFetch('/cases/stats/counts');
  // backend sends { total, active, closed }
  return {
    total: data.total || 0,
    byStatus: {
      Closed: data.closed || 0,
      Investigating: data.active || 0,
      Pending: 0
    }
  };
}

