import React, { useEffect, useState } from "react";
import { getDrafts, updateDraftFIR, sendForApproval, deleteDraft } from "../api/firService";
import { useNotifications } from "../contexts/NotificationContext";
import { Search, Edit, Send, Save, X } from "lucide-react";

export default function FIRDrafts() {
  const { addNotification } = useNotifications();
  const [rows, setRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getDrafts(search || undefined);
      setRows(result.drafts || result);
    } catch (error: any) {
      addNotification({
        title: "Error",
        message: error.message || "Failed to load drafts",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) load();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openEdit = (r: any) => {
    setEdit(r);
    setForm({
      ...r,
      caseDescription: r.caseDescription || r.description || "",
      description: r.description || r.caseDescription || "",
    });
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateDraftFIR(edit._id, form);
      addNotification({
        title: "Success",
        message: "Draft saved successfully",
        type: "success",
      });
      setEdit(null);
      await load();
    } catch (error: any) {
      addNotification({
        title: "Error",
        message: error.message || "Failed to save draft",
        type: "error",
      });
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      await sendForApproval(edit._id);
      addNotification({
        title: "Success",
        message: "FIR submitted for approval",
        type: "success",
      });
      setEdit(null);
      await load();
    } catch (error: any) {
      addNotification({
        title: "Error",
        message: error.message || "Failed to submit for approval",
        type: "error",
      });
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    if (status === "pending_approval") return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    return "bg-slate-100 text-slate-800";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Draft FIRs</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description, FIR number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800"
          />
        </div>
      </div>

      {loading && <div className="text-center py-4">Loading...</div>}

      {!edit ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div
              key={r._id}
              className="border rounded-xl p-4 bg-white dark:bg-slate-800 dark:border-slate-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{r.firNumber}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(r.status)}`}>
                  {r.status === "pending_approval" ? "Pending" : "Draft"}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                {r.caseDescription || r.description || r.incident || "No description"}
              </p>
              
              {r.ipcPredictions && r.ipcPredictions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">IPC Sections:</p>
                  <div className="flex flex-wrap gap-1">
                    {r.ipcPredictions.slice(0, 3).map((pred: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
                      >
                        {pred.section}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEdit(r)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                {(r.status === 'draft' || r.status === 'pending_approval') && (
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this draft FIR? This action cannot be undone.')) return;
                      try {
                        await deleteDraft(r._id);
                        addNotification({ title: 'Deleted', message: `${r.firNumber} removed from drafts`, type: 'success' });
                        await load();
                      } catch (e: any) {
                        addNotification({ title: 'Error', message: e?.message || 'Delete failed', type: 'error' });
                      }
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          {!loading && rows.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500">
              No draft FIRs found
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Edit Draft FIR - {edit.firNumber}</h2>
            <button
              onClick={() => setEdit(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Case Description *</label>
              <textarea
                name="caseDescription"
                value={form.caseDescription || ""}
                onChange={handleChange}
                rows={4}
                className="w-full border rounded-lg p-3 dark:bg-slate-700 dark:border-slate-600"
                placeholder="Enter case description..."
              />
            </div>

            {["victim", "accused", "incident", "date", "time", "location", "description"].map((f) => (
              <div key={f}>
                <label className="block text-sm font-medium mb-2 capitalize">{f}</label>
                {f === "description" ? (
                  <textarea
                    name={f}
                    value={form[f] || ""}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border rounded-lg p-3 dark:bg-slate-700 dark:border-slate-600"
                  />
                ) : (
                  <input
                    name={f}
                    value={form[f] || ""}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3 dark:bg-slate-700 dark:border-slate-600"
                  />
                )}
              </div>
            ))}

            {edit.ipcPredictions && edit.ipcPredictions.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">IPC Predictions</label>
                <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  {edit.ipcPredictions.map((pred: any, idx: number) => (
                    <div key={idx} className="border-b dark:border-slate-700 pb-2 last:border-0">
                      <div className="font-semibold text-blue-700 dark:text-blue-300">
                        {pred.section}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {pred.offense}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        Punishment: {pred.punishment}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Draft
            </button>
            {edit.status === "draft" && (
              <button
                onClick={handleSubmitForApproval}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send for Approval
              </button>
            )}
            {(edit?.status === 'draft' || edit?.status === 'pending_approval') && (
              <button
                onClick={async () => {
                  if (!confirm('Delete this draft FIR?')) return;
                  try {
                    await deleteDraft(edit._id);
                    addNotification({ title: 'Deleted', message: `${edit.firNumber} removed from drafts`, type: 'success' });
                    setEdit(null);
                    await load();
                  } catch (e: any) {
                    addNotification({ title: 'Error', message: e?.message || 'Delete failed', type: 'error' });
                  }
                }}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Delete Draft
              </button>
            )}
            <button
              onClick={() => setEdit(null)}
              className="px-4 py-3 bg-slate-400 hover:bg-slate-500 text-white rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}