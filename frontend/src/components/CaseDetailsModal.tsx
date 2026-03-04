import React, { useState, useEffect } from 'react';
import { X, Calendar, User, MapPin, Scale, AlertCircle, CheckCircle, Clock, Brain, Loader2 } from 'lucide-react';
import { Case, getCaseDetails } from '../api/caseService';

interface CaseDetailsModalProps {
  caseItem: Case | null;
  query?: string;
  onClose: () => void;
}

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({ caseItem, query, onClose }) => {
  const [caseDetails, setCaseDetails] = useState<Case | null>(caseItem);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (caseItem && query) {
      // Fetch detailed case info with AI explanation
      setLoading(true);
      getCaseDetails(caseItem.id, query)
        .then((response) => {
          setCaseDetails(response.case);
        })
        .catch((err) => {
          console.error('Failed to fetch case details:', err);
          // Keep the original case item if fetch fails
          setCaseDetails(caseItem);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCaseDetails(caseItem);
    }
  }, [caseItem, query]);

  if (!caseDetails) return null;

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
          UNKNOWN
        </span>
      );
    }

    const normalized = status.toLowerCase();
    if (normalized === 'pending') {
      return <span className="badge badge-warning">Pending</span>;
    }
    if (normalized === 'investigating') {
      return <span className="badge badge-info">Investigating</span>;
    }
    if (normalized === 'closed') {
      return <span className="badge badge-success">Closed</span>;
    }

    return <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">{status}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{caseDetails.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{caseDetails.firNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status and Similarity */}
          <div className="flex items-center justify-between">
            {getStatusBadge(caseDetails?.status)}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Similarity:</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {caseDetails?.similarity ?? 0}%
              </span>
            </div>
          </div>

          {/* Case Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                <p className="text-gray-900 dark:text-white font-medium">{caseDetails?.date || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Officer in Charge</p>
                <p className="text-gray-900 dark:text-white font-medium">{caseDetails?.officerInCharge || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-gray-900 dark:text-white font-medium">{caseDetails?.location || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Case Description</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{caseDetails?.description || ''}</p>
          </div>

          {/* IPC Sections */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Scale className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">IPC Sections</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(caseDetails?.ipcSections || []).map((section, index) => (
                <span
                  key={index}
                  className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  {section}
                </span>
              ))}
            </div>
          </div>

          {/* AI Explanation */}
          {loading ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <span className="text-blue-800 dark:text-blue-300 text-sm">Generating AI analysis...</span>
              </div>
            </div>
          ) : caseDetails.similarityExplanation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    AI Similarity Analysis
                  </h4>
                  <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
                    {caseDetails.similarityExplanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Synthetic Data Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-300 text-xs">
              <strong>Note:</strong> This is synthetic case data generated for academic and research purposes. 
              All information is artificially created and does not represent real FIRs, crimes, or individuals.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsModal;

