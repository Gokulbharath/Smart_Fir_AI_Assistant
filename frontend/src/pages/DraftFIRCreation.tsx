import React, { useState } from "react";
import { createFIR } from "../api/firService";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { FileText, Send, Loader } from "lucide-react";

export default function DraftFIRCreation() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    caseDescription: "",
    description: "",
    victim: "",
    accused: "",
    incident: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.caseDescription.trim() && !form.description.trim()) {
      addNotification({
        title: "Error",
        message: "Case description is required",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        createdBy: user?.email || "user",
      };
      
      const result = await createFIR(payload);
      
      addNotification({
        title: "Success",
        message: `FIR ${result.fir?.firNumber} created with IPC predictions`,
        type: "success",
      });

      // Reset form
      setForm({
        caseDescription: "",
        description: "",
        victim: "",
        accused: "",
        incident: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
        location: "",
      });

      // Show IPC predictions if available
      if (result.fir?.ipcPredictions?.length > 0) {
        const sections = result.fir.ipcPredictions.map((p: any) => p.section).join(", ");
        addNotification({
          title: "IPC Predictions",
          message: `Predicted sections: ${sections}`,
          type: "success",
        });
      }

    } catch (error: any) {
      addNotification({
        title: "Error",
        message: error.message || "Failed to create FIR",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header (Evidence Locker-style) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New FIR</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Enter case details. IPC sections will be automatically predicted using LawGPT.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Case Description * <span className="text-xs text-slate-500">(Used for IPC prediction)</span>
            </label>
            <textarea
              name="caseDescription"
              value={form.caseDescription}
              onChange={handleChange}
              rows={6}
              required
              className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the incident in detail. This will be used to predict relevant IPC sections..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Victim</label>
              <input
                type="text"
                name="victim"
                value={form.victim}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                placeholder="Victim name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Accused</label>
              <input
                type="text"
                name="accused"
                value={form.accused}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                placeholder="Accused name (if known)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Time</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              placeholder="Incident location"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Additional Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              placeholder="Additional details..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating FIR with IPC Predictions...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Create Draft FIR
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


