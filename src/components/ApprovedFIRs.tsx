import React, { useState } from 'react';
import { 
  CheckCircle, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  User,
  MapPin,
  Scale,
  FileText,
  Award
} from 'lucide-react';

interface ApprovedFIR {
  id: string;
  firNumber: string;
  title: string;
  victim: string;
  accused: string;
  location: string;
  submittedBy: string;
  approvedBy: string;
  submittedDate: string;
  approvedDate: string;
  ipcSections: string[];
  status: 'investigation' | 'chargesheet' | 'closed';
}

const ApprovedFIRs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const approvedFIRs: ApprovedFIR[] = [
    {
      id: '1',
      firNumber: 'FIR/2025/001230',
      title: 'Armed Robbery at Bank',
      victim: 'State Bank of India',
      accused: 'Ravi Kumar, Suresh Singh',
      location: 'Main Branch, Sector 18',
      submittedBy: 'Inspector Rajesh Kumar',
      approvedBy: 'SP Anil Verma',
      submittedDate: '2025-01-10',
      approvedDate: '2025-01-10',
      ipcSections: ['IPC 392', 'IPC 397', 'IPC 34'],
      status: 'investigation'
    },
    {
      id: '2',
      firNumber: 'FIR/2025/001229',
      title: 'Murder Case Investigation',
      victim: 'Mohan Lal',
      accused: 'Ramesh Gupta',
      location: 'House No. 234, Sector 22',
      submittedBy: 'Inspector Priya Sharma',
      approvedBy: 'SP Anil Verma',
      submittedDate: '2025-01-09',
      approvedDate: '2025-01-09',
      ipcSections: ['IPC 302', 'IPC 201'],
      status: 'chargesheet'
    },
    {
      id: '3',
      firNumber: 'FIR/2025/001228',
      title: 'Cyber Fraud Case',
      victim: 'Sunita Devi',
      accused: 'Unknown',
      location: 'Online Transaction',
      submittedBy: 'Constable Amit Verma',
      approvedBy: 'Inspector Priya Sharma',
      submittedDate: '2025-01-08',
      approvedDate: '2025-01-08',
      ipcSections: ['IPC 420', 'IT Act 66C'],
      status: 'investigation'
    },
    {
      id: '4',
      firNumber: 'FIR/2025/001227',
      title: 'Domestic Violence',
      victim: 'Kavita Sharma',
      accused: 'Rajesh Sharma (Husband)',
      location: 'Flat 301, Sector 15',
      submittedBy: 'Constable Priya Singh',
      approvedBy: 'Inspector Priya Sharma',
      submittedDate: '2025-01-07',
      approvedDate: '2025-01-07',
      ipcSections: ['IPC 498A', 'IPC 323', 'IPC 506'],
      status: 'closed'
    }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      investigation: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', label: 'Under Investigation' },
      chargesheet: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', label: 'Chargesheet Filed' },
      closed: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', label: 'Case Closed' }
    };
    
    const badge = badges[status as keyof typeof badges];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const filteredFIRs = approvedFIRs.filter(fir => {
    const matchesSearch = fir.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fir.firNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fir.victim.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fir.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 dark:from-green-500 dark:to-emerald-600 rounded-xl p-3 shadow-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Approved FIRs
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              View and manage all approved First Information Reports
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by FIR number, title, or victim name..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Status</option>
              <option value="investigation">Under Investigation</option>
              <option value="chargesheet">Chargesheet Filed</option>
              <option value="closed">Case Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">156</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-3">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">89</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Under Investigation</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-3">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">34</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Chargesheet Filed</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-xl p-3">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">33</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Cases Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Approved FIRs List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Approved FIRs ({filteredFIRs.length})
        </h2>
        
        {filteredFIRs.map((fir) => (
          <div key={fir.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {fir.title}
                  </h3>
                  {getStatusBadge(fir.status)}
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-bold">{fir.firNumber}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 font-semibold">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 font-semibold">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <User className="w-4 h-4" />
                <span className="font-medium">Victim: {fir.victim}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{fir.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Approved: {fir.approvedDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-slate-500" />
                  <div className="flex flex-wrap gap-2">
                    {fir.ipcSections.map((section, index) => (
                      <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs font-bold">
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium">Approved by: {fir.approvedBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredFIRs.length === 0 && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Approved FIRs Found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Try adjusting your search terms or filters to find relevant FIRs.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApprovedFIRs;