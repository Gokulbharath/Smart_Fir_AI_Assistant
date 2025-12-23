import React, { useEffect, useState } from "react";
import { getFinalFIRs, pdfUrl } from "../api/firService";
import { useNotifications } from "../contexts/NotificationContext";
import { Search, FileText, Download, CheckCircle } from "lucide-react";

export default function FinalFIRView() {
  const { addNotification } = useNotifications();
  const [firs, setFirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFIR, setSelectedFIR] = useState<any | null>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getFinalFIRs(search || undefined);
      setFirs(result.firs || result);
    } catch (error: any) {
      addNotification({
        title: "Error",
        message: error.message || "Failed to load final FIRs",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Final/Approved FIRs ({firs.length})
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View approved and finalized FIRs with IPC details
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search FIRs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800"
          />
        </div>
      </div>

      {loading && <div className="text-center py-4">Loading...</div>}

      <div className="grid gap-4">
        {firs.map((fir) => (
          <div
            key={fir._id}
            className="border rounded-xl p-6 bg-white dark:bg-slate-800 dark:border-slate-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-xl text-green-600 dark:text-green-400">
                  {fir.firNumber}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Approved on {new Date(fir.approvedAt || fir.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-medium">
                Approved
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Case Description</p>
                <p className="text-slate-800 dark:text-slate-200">
                  {fir.caseDescription || fir.description || fir.incident || "No description"}
                </p>
              </div>

              {(fir.victim || fir.accused || fir.location) && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {fir.victim && (
                    <div>
                      <span className="font-semibold">Victim:</span> {fir.victim}
                    </div>
                  )}
                  {fir.accused && (
                    <div>
                      <span className="font-semibold">Accused:</span> {fir.accused}
                    </div>
                  )}
                  {fir.location && (
                    <div className="col-span-2">
                      <span className="font-semibold">Location:</span> {fir.location}
                    </div>
                  )}
                </div>
              )}
            </div>

            {fir.ipcPredictions && fir.ipcPredictions.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="font-semibold mb-2 text-blue-700 dark:text-blue-300">IPC Sections</p>
                <div className="space-y-3">
                  {fir.ipcPredictions.map((pred: any, idx: number) => (
                    <div
                      key={idx}
                      className="border-l-4 border-blue-500 pl-3 bg-white dark:bg-slate-800 rounded p-2"
                    >
                      <div className="font-bold text-blue-700 dark:text-blue-300">
                        {pred.section}
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {pred.offense}
                      </div>
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

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedFIR(fir)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View Details
              </button>
              <a
                href={pdfUrl(fir._id)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
          </div>
        ))}

        {!loading && firs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg">No approved FIRs found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFIR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">FIR Details - {selectedFIR.firNumber}</h2>
              <button
                onClick={() => setSelectedFIR(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(selectedFIR).map(([key, value]: [string, any]) => {
                if (key === "_id" || key === "__v") return null;
                if (key === "ipcPredictions") return null;
                if (!value) return null;

                return (
                  <div key={key}>
                    <span className="font-semibold capitalize">{key}:</span>{" "}
                    <span className="text-slate-600 dark:text-slate-300">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </span>
                  </div>
                );
              })}

              {selectedFIR.ipcPredictions && selectedFIR.ipcPredictions.length > 0 && (
                <div>
                  <span className="font-semibold">IPC Predictions:</span>
                  <div className="mt-2 space-y-2">
                    {selectedFIR.ipcPredictions.map((pred: any, idx: number) => (
                      <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <div className="font-bold">{pred.section}</div>
                        <div className="text-sm">{pred.offense}</div>
                        <div className="text-xs text-slate-500">{pred.punishment}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}













