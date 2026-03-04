import { apiFetch } from './apiClient';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

/**
 * Create a new draft FIR with LawGPT IPC predictions
 * @param data - FIR data including caseDescription
 */
export async function createFIR(data: any) {
  return await apiFetch('/fir/create', {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Create draft FIR - calls FastAPI /fir/draft endpoint
 */
export async function createDraft(data: any) {
  return await apiFetch('/fir/create-draft', {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get all draft FIRs (with optional search)
 */
export async function getDrafts(search?: string) {
  const url = search 
    ? `/fir/drafts?search=${encodeURIComponent(search)}`
    : '/fir/drafts';
  const data = await apiFetch(url);
  if (Array.isArray(data)) return data;
  if (data?.drafts) return data.drafts;
  return data;
}

export async function deleteDraft(id: string) {
  return await apiFetch(`/fir/draft/${id}`, { method: 'DELETE' });
}

/**
 * Get pending approval FIRs
 */
export async function getPendingFIRs() {
  const data = await apiFetch('/fir/pending');
  if (Array.isArray(data)) return data;
  if (data?.firs) return data.firs;
  return data;
}

/**
 * Get final/approved FIRs
 */
export async function getFinalFIRs(search?: string) {
  const url = search
    ? `/fir/final?search=${encodeURIComponent(search)}`
    : '/fir/final';
  const data = await apiFetch(url);
  if (Array.isArray(data)) return data;
  if (data?.firs) return data.firs;
  return data;
}

/**
 * Submit FIR for approval (legacy route)
 */
export async function submitFIR(id: string) {
  return await apiFetch(`/fir/submit/${id}`, { method: "PUT" });
}

/**
 * Send FIR for approval - calls FastAPI endpoint to change status from draft to pending_approval
 */
export async function sendForApproval(id: string) {
  return await apiFetch(`/fir/send-for-approval/${id}`, { 
    method: "POST",
  });
}

/**
 * Approve FIR (new route)
 */
export async function approveFIRNew(id: string, approvedBy?: string) {
  return await apiFetch(`/fir/approve/${id}`, {
    method: "POST",
    body: JSON.stringify({ approvedBy }),
  });
}

export async function getFIRs(status: "draft" | "pending" | "approved" | "rejected") {
  const data = await apiFetch(`/firs/${status}`);
  if (Array.isArray(data)) return data;
  if (data?.firs) return data.firs;
  if (data?.drafts) return data.drafts;
  return data;
}

export async function updateDraftFIR(id: string, data: any) {
  return await apiFetch(`/fir/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Approve FIR - calls FastAPI /fir/approve endpoint
 */
export async function approveFIR(id: string, approvedBy?: string) {
  return await apiFetch(`/fir/approve/${id}`, {
    method: "POST",
    body: JSON.stringify({ approvedBy }),
  });
}

export async function rejectToDraft(id: string) {
  return await apiFetch(`/fir/${id}/reject`, { method: "PUT" });
}

export async function getCounts() {
  return await apiFetch('/firs/counts');
}

/**
 * URL helper for legacy use; token is not attached.
 */
export function pdfUrl(id: string) {
  return `${API_BASE}/fir/pdf/${id}`;
}

/**
 * Download FIR PDF using fetch with Authorization header.
 */
export async function downloadFIRPdf(id: string) {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE}/fir/pdf/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error || 'Failed to download PDF');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FIR_${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

