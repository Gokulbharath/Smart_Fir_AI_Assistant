import React, { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';

interface Case {
  id: string;
  firNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'investigating' | 'closed' | 'chargesheet';
  officerInCharge: string;
  date: string;
  location: string;
  ipcSections: string[];
  similarity: number;
}

const CaseRetrieval: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const cases: Case[] = [
    {
      id: '1',
      firNumber: 'FIR/2024/008921',
      title: 'Theft at Sector 14 Market',
      description: 'Mobile phone and wallet theft from pedestrian near metro station during evening hours',
      status: 'closed',
      officerInCharge: 'Inspector Rajesh Kumar',
      date: '2024-11-15',
      location: 'Sector 14 Market, Delhi',
      ipcSections: ['IPC 379', 'IPC 356'],
      similarity: 95
    },
    {
      id: '2',
      firNumber: 'FIR/2024/007654',
      title: 'Chain Snatching Incident',
      description: 'Gold chain snatching from elderly woman near bus stop in broad daylight',
      status: 'investigating',
      officerInCharge: 'Sub-Inspector Priya Sharma',
      date: '2024-10-22',
      location: 'Sector 12 Bus Stand, Delhi',
      ipcSections: ['IPC 379', 'IPC 323'],
      similarity: 78
    },
    {
      id: '3',
      firNumber: 'FIR/2024/006543',
      title: 'ATM Theft Case',
      description: 'Theft of cash and cards from victim using ATM during late hours',
      status: 'chargesheet',
      officerInCharge: 'Inspector Anil Verma',
      date: '2024-09-18',
      location: 'Sector 15 ATM Center, Delhi',
      ipcSections: ['IPC 379', 'IPC 420'],
      similarity: 82
    },
    {
      id: '4',
      firNumber: 'FIR/2024/005432',
      title: 'Shoplifting at Mall',
      description: 'Multiple items stolen from electronics store by organized group',
      status: 'pending',
      officerInCharge: 'Sub-Inspector Mehta',
      date: '2024-08-30',
      location: 'City Mall, Sector 18',
      ipcSections: ['IPC 379', 'IPC 34'],
      similarity: 65
    }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', icon: Clock },
      investigating: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', icon: Search },
      closed: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', icon: CheckCircle },
      chargesheet: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', icon: FileText }
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

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600';
    if (similarity >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.ipcSections.some(section => section.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-600 rounded-lg p-3">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Case Retrieval System</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Find similar past cases to assist with current investigations
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
              placeholder="Search cases by description, IPC sections, or keywords..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="closed">Closed</option>
              <option value="chargesheet">Chargesheet Filed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,247</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cases</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">892</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-2">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">234</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Investigating</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">121</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Similar Cases Found ({filteredCases.length})
        </h2>
        
        {filteredCases.map((caseItem) => (
          <div key={caseItem.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {caseItem.title}
                  </h3>
                  {getStatusBadge(caseItem.status)}
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`w-4 h-4 ${getSimilarityColor(caseItem.similarity)}`} />
                    <span className={`text-sm font-medium ${getSimilarityColor(caseItem.similarity)}`}>
                      {caseItem.similarity}% Match
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {caseItem.description}
                </p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4" />
                <span>{caseItem.firNumber}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{caseItem.date}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <span>{caseItem.officerInCharge}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{caseItem.location}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">IPC Sections:</span>
              <div className="flex flex-wrap gap-2">
                {caseItem.ipcSections.map((section, index) => (
                  <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs font-medium">
                    {section}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredCases.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Cases Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search terms or filters to find relevant cases.
          </p>
        </div>
      )}
    </div>
  );
};

export default CaseRetrieval;