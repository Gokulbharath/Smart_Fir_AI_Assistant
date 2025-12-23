import React, { useState } from 'react';
import { FileText, Calendar, User, Eye, CreditCard as Edit3, Trash2, Download, Send, Filter, Search, Plus, Clock } from 'lucide-react';

interface FIRDraft {
  id: string;
  firNumber: string;
  title: string;
  victim: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  createdDate: string;
  lastModified: string;
  officer: string;
  ipcSections: string[];
}

const FIRDrafts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const drafts: FIRDraft[] = [
    {
      id: '1',
      firNumber: 'FIR/2025/001234',
      title: 'Theft at Sector 14 Market',
      victim: 'Rahul Sharma',
      status: 'draft',
      createdDate: '2025-01-12',
      lastModified: '2025-01-12',
      officer: 'Inspector Rajesh Kumar',
      ipcSections: ['IPC 379', 'IPC 356']
    },
    {
      id: '2',
      firNumber: 'FIR/2025/001235',
      title: 'Domestic Violence Case',
      victim: 'Priya Kumari',
      status: 'review',
      createdDate: '2025-01-11',
      lastModified: '2025-01-11',
      officer: 'Sub-Inspector Priya Sharma',
      ipcSections: ['IPC 498A', 'IPC 323']
    },
    {
      id: '3',
      firNumber: 'FIR/2025/001236',
      title: 'Vehicle Theft Report',
      victim: 'Amit Singh',
      status: 'approved',
      createdDate: '2025-01-10',
      lastModified: '2025-01-10',
      officer: 'Inspector Rajesh Kumar',
      ipcSections: ['IPC 379']
    },
    {
      id: '4',
      firNumber: 'FIR/2025/001237',
      title: 'Fraud Case Investigation',
      victim: 'Sunita Devi',
      status: 'rejected',
      createdDate: '2025-01-09',
      lastModified: '2025-01-09',
      officer: 'Sub-Inspector Mehta',
      ipcSections: ['IPC 420', 'IPC 468']
    }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300', icon: Edit3 },
      review: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: Clock },
      approved: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: Send },
      rejected: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', icon: Trash2 }
    };
    
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         draft.victim.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         draft.firNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || draft.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-600 rounded-lg p-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FIR Drafts</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage and review your FIR drafts
              </p>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span>New FIR</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drafts by FIR number, title, or victim name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 dark:bg-gray-900/30 rounded-lg p-2">
              <Edit3 className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Under Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">15</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Drafts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            FIR Drafts ({filteredDrafts.length})
          </h2>
        </div>
        
        {filteredDrafts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No drafts found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search terms or create a new FIR draft.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    FIR Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDrafts.map((draft) => (
                  <tr key={draft.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {draft.firNumber}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {draft.title}
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <User className="w-3 h-3 mr-1" />
                          {draft.victim}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {draft.ipcSections.map((section, index) => (
                            <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs">
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(draft.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {draft.officer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <div>
                          <div>Created: {draft.createdDate}</div>
                          <div>Modified: {draft.lastModified}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        {draft.status === 'draft' && (
                          <button className="text-green-600 hover:text-green-800 p-1">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {draft.status === 'approved' && (
                          <button className="text-purple-600 hover:text-purple-800 p-1">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-red-600 hover:text-red-800 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FIRDrafts;