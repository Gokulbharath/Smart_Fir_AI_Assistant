/**
 * Analytics Service
 * 
 * API client for Analytics endpoints
 */

import { apiFetch } from './apiClient';

// Get API base URL from environment or use default
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

/**
 * Analytics Stats interface
 */
export interface AnalyticsStats {
  firs: {
    total: number;
    pending: number;
    approved: number;
    draft: number;
  };
  evidence: {
    total: number;
  };
  cases: {
    total: number;
  };
  metrics: {
    approvalRate: string;
    avgProcessingTime: string;
    activeOfficers: number;
  };
  crimeTypes: Array<{
    type: string;
    count: number;
    percentage: string;
  }>;
  monthlyData: Array<{
    month: string;
    firs: number;
    approved: number;
  }>;
  hotspots: Array<{
    area: string;
    incidents: number;
    risk: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Get analytics statistics
 */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const data = await apiFetch('/analytics/stats');
  return data.stats;
}


