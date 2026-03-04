import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  User,
  MapPin,
  Scale,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { searchCases, getCaseStats, Case } from '../api/caseService';
import CaseDetailsModal from './CaseDetailsModal';
import BackButton from './BackButton';

const CaseRetrieval: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<{ total: number; byStatus: { Closed: number; Investigating: number; Pending: number } }>({
    total: 0,
    byStatus: { Closed: 0, Investigating: 0, Pending: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load statistics on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load stats
  const loadStats = async () => {
    try {
      const statsData = await getCaseStats();
      // statsData already in correct shape from service
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Perform search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setCases([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchCases({
        query: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 20
      });
      setCases(Array.isArray(response?.cases) ? response.cases : []);
    } catch (err: any) {
      setError(err.message || 'Failed to search cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search on Enter key or button click
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle view details
  const handleViewDetails = async (caseItem: Case) => {
    setSelectedCase(caseItem);
    setShowModal(true);
  };

  // Handle status filter change
  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    if (searchTerm.trim()) {
      // Re-search with new filter
      setTimeout(() => handleSearch(), 100);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
          UNKNOWN
        </span>
      );
    }

    const normalized = status.toLowerCase();

    if (normalized === "approved") {
      return <span className="badge badge-success">Approved</span>;
    }

    if (normalized === "pending") {
      return <span className="badge badge-warning">Pending</span>;
    }

    if (normalized === "rejected") {
      return <span className="badge badge-error">Rejected</span>;
    }

    return (
      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
        {status}
      </span>
    );
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600 dark:text-green-400';
    if (similarity >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-600 rounded-lg p-3">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Case Retrieval System</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Find similar past cases using semantic search (Synthetic dataset for academic/research purposes)
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the case or enter keywords (e.g., 'mobile phone theft', 'chain snatching')..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Investigating">Investigating</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-200">Error</h3>
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cases</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.byStatus.Closed}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.byStatus.Investigating}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Investigating</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-2">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.byStatus.Pending}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      {cases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Similar Cases Found ({cases.length})
          </h2>
          
          {(cases || []).map((caseItem) => (
            <div key={caseItem?.id || Math.random()} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {caseItem?.title || 'Untitled Case'}
                    </h3>
                    {getStatusBadge(caseItem?.status)}
                    <div className="flex items-center space-x-1">
                      <TrendingUp className={`w-4 h-4 ${getSimilarityColor(caseItem?.similarity || 0)}`} />
                      <span className={`text-sm font-medium ${getSimilarityColor(caseItem?.similarity || 0)}`}>
                        {caseItem?.similarity ?? 0}% Match
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {caseItem?.description || ''}
                  </p>
                </div>
                <button
                  onClick={() => handleViewDetails(caseItem)}
                  className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>{caseItem?.firNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{caseItem?.date || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{caseItem?.officerInCharge || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{caseItem?.location || 'Unknown Location'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">IPC Sections:</span>
                <div className="flex flex-wrap gap-2">
                  {(caseItem?.ipcSections || []).map((section, index) => (
                    <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs font-medium">
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results / Empty State */}
      {!loading && searchTerm && cases.length === 0 && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Cases Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search terms or filters to find relevant cases.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !searchTerm && cases.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Search for Similar Cases</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Enter a case description or keywords to find similar cases from the synthetic dataset.
          </p>
        </div>
      )}

      {/* Case Details Modal */}
      {showModal && selectedCase && (
        <CaseDetailsModal
          caseItem={selectedCase}
          query={searchTerm}
          onClose={() => {
            setShowModal(false);
            setSelectedCase(null);
          }}
        />
      )}
    </div>
  );
};

export default CaseRetrieval;
