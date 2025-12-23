const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://127.0.0.1:5000/api";

/**
 * Create a new draft FIR with LawGPT IPC predictions
 * @param data - FIR data including caseDescription
 */
export async function createFIR(data: any) {
  const r = await fetch(`${API_BASE}/fir/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || "Create FIR failed");
  }
  return r.json();
}

/**
 * Create draft FIR - calls FastAPI /fir/draft endpoint
 */
export async function createDraft(data: any) {
  // Use backend legacy/create-draft route which returns { success: true, fir }
  const r = await fetch(`${API_BASE}/fir/create-draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.detail || error.error || "Create draft failed");
  }
  return r.json();
}

/**
 * Get all draft FIRs (with optional search)
 */
export async function getDrafts(search?: string) {
  const url = search 
    ? `${API_BASE}/fir/drafts?search=${encodeURIComponent(search)}`
    : `${API_BASE}/fir/drafts`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to fetch drafts");
  const data = await r.json();
  if (Array.isArray(data)) return data;
  if (data?.drafts) return data.drafts;
  return data;
}

export async function deleteDraft(id: string) {
  const r = await fetch(`${API_BASE}/fir/draft/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error((await r.json()).error || 'Delete failed');
  return r.json();
}

/**
 * Get pending approval FIRs
 */
export async function getPendingFIRs() {
  const r = await fetch(`${API_BASE}/fir/pending`);
  if (!r.ok) throw new Error("Failed to fetch pending FIRs");
  const data = await r.json();
  if (Array.isArray(data)) return data;
  if (data?.firs) return data.firs;
  return data;
}

/**
 * Get final/approved FIRs
 */
export async function getFinalFIRs(search?: string) {
  const url = search
    ? `${API_BASE}/fir/final?search=${encodeURIComponent(search)}`
    : `${API_BASE}/fir/final`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to fetch final FIRs");
  const data = await r.json();
  if (Array.isArray(data)) return data;
  if (data?.firs) return data.firs;
  return data;
}

/**
 * Submit FIR for approval (legacy route)
 */
export async function submitFIR(id: string) {
  const r = await fetch(`${API_BASE}/fir/submit/${id}`, { method: "PUT" });
  if (!r.ok) throw new Error((await r.json()).error || "Submit failed");
  return r.json();
}

/**
 * Send FIR for approval - calls FastAPI endpoint to change status from draft to pending_approval
 */
export async function sendForApproval(id: string) {
  const r = await fetch(`${API_BASE}/fir/send-for-approval/${id}`, { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.detail || error.error || "Send for approval failed");
  }
  return r.json();
}

/**
 * Approve FIR (new route)
 */
export async function approveFIRNew(id: string, approvedBy?: string) {
  const r = await fetch(`${API_BASE}/fir/approve/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approvedBy }),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Approve failed");
  return r.json();
}

export async function getFIRs(status: "draft" | "pending" | "approved" | "rejected") {
  const r = await fetch(`${API_BASE}/firs/${status}`);
  if (!r.ok) throw new Error("List failed");
  const data = await r.json();
  if (Array.isArray(data)) return data;
  if (data?.firs) return data.firs;
  if (data?.drafts) return data.drafts;
  return data;
}

export async function updateDraftFIR(id: string, data: any) {
  const r = await fetch(`${API_BASE}/fir/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Update failed");
  return r.json();
}

/**
 * Approve FIR - calls FastAPI /fir/approve endpoint
 */
export async function approveFIR(id: string, approvedBy?: string) {
  const r = await fetch(`${API_BASE}/fir/approve/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approvedBy }),
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.detail || error.error || "Approve failed");
  }
  return r.json();
}

export async function rejectToDraft(id: string) {
  const r = await fetch(`${API_BASE}/fir/${id}/reject`, { method: "PUT" });
  if (!r.ok) throw new Error((await r.json()).error || "Reject failed");
  return r.json();
}

export async function getCounts() {
  const r = await fetch(`${API_BASE}/firs/counts`);
  if (!r.ok) throw new Error("Counts failed");
  return r.json();
}

export function pdfUrl(id: string) {
  return `${API_BASE}/fir/pdf/${id}`;
}


