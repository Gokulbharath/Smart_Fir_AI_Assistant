import React, { useEffect, useState } from 'react';
import { getPendingFIRs, approveFIRNew, rejectToDraft, getCounts } from '../api/firService';
import { useNotifications } from '../contexts/NotificationContext';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

const InspectorDashboard: React.FC = () => {
  const { addNotification } = useNotifications();
  const [firs, setFirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<{pending:number, approved:number, draft:number, rejected:number}>({pending:0, approved:0, draft:0, rejected:0});
  const [modal, setModal] = useState<any|null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getPendingFIRs();
      setFirs(result.firs || result);
    } catch (error: any) {
      addNotification({
        title: "Error",
        message: error.message || "Failed to load pending FIRs",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
    refreshCounts(); 
  }, []);

  const refreshCounts = async () => {
    try {
      const countsData = await getCounts();
      setCounts(countsData);
    } catch (error) {
      console.error("Failed to load counts:", error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveFIRNew(id, "inspector");
      addNotification({
        title: "Success",
        message: "FIR approved and finalized",
        type: "success",
      });
      await load();
      await refreshCounts();
      setModal(null);
    } catch (error: any) {
      addNotification({
        title: "Error",
        message: error.message || "Failed to approve FIR",
        type: "error",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectToDraft(id);
      addNotification({
        title: "Success",
        message: "FIR sent back to draft",
        type: "success",
      });
      await load();
      await refreshCounts();
      setModal(null);
    } catch (error: any) {
      addNotification({
        title: "Error",
        message: error.message || "Failed to reject FIR",
        type: "error",
      });
    }
  };

  const openModal = (r: any) => setModal(r);
  const closeModal = () => setModal(null);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-600" />
            Approval Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Review and approve pending FIRs
          </p>
        </div>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-4 gap-4">
        <div className="px-4 py-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
          <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Pending</div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{counts.pending || counts.pending_approval || 0}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Approved</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{counts.approved || 0}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
          <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Drafts</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{counts.draft || 0}</div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400 font-medium">Rejected</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{counts.rejected || 0}</div>
        </div>
      </div>

      {loading && <div className="text-center py-4">Loading…</div>}

      <div className="space-y-4">
        {firs.map((f) => (
          <div key={f._id} className="p-5 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{f.firNumber}</h3>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded text-xs font-medium">
                    Pending Approval
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {f.caseDescription || f.description || f.incident || "No description"}
                </p>
                
                {f.ipcPredictions && f.ipcPredictions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-500 mb-2">IPC Sections:</p>
                    <div className="flex flex-wrap gap-2">
                      {f.ipcPredictions.slice(0, 3).map((pred: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium"
                        >
                          {pred.section}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Submitted: {new Date(f.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button 
                  onClick={() => openModal(f)} 
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button 
                  onClick={() => handleApprove(f._id)} 
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button 
                  onClick={() => handleReject(f._id)} 
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && firs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg">No pending FIRs for approval</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">FIR Review – {modal.firNumber}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-semibold">Case Description:</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1">
                  {modal.caseDescription || modal.description || modal.incident || "N/A"}
                </p>
              </div>

              {["victim", "accused", "date", "time", "location"].map((k) => (
                modal[k] && (
                  <div key={k}>
                    <span className="font-semibold capitalize">{k}:</span>{" "}
                    <span className="text-slate-600 dark:text-slate-300">{modal[k]}</span>
                  </div>
                )
              ))}

              {modal.ipcPredictions && modal.ipcPredictions.length > 0 && (
                <div>
                  <span className="font-semibold">IPC Predictions:</span>
                  <div className="mt-2 space-y-3">
                    {modal.ipcPredictions.map((pred: any, idx: number) => (
                      <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="font-bold text-blue-700 dark:text-blue-300">{pred.section}</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">{pred.offense}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Punishment: {pred.punishment}
                        </div>
                        {pred.confidence && (
                          <div className="text-xs text-slate-400 mt-1">
                            Confidence: {(pred.confidence * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-slate-700">
              <button 
                onClick={() => handleReject(modal._id)} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Send to Draft
              </button>
              <button 
                onClick={() => handleApprove(modal._id)} 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Finalize
              </button>
              <button 
                onClick={closeModal} 
                className="px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectorDashboard;