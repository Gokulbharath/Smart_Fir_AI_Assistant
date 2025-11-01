import React, { useState } from 'react';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  MapPin,
  Scale,
  FileText,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface FIRForReview {
  id: string;
  firNumber: string;
  title: string;
  submittedBy: string;
  submittedDate: string;
  victim: string;
  accused: string;
  location: string;
  ipcSections: string[];
  priority: 'high' | 'medium' | 'low';
  description: string;
  evidence: number;
}

const InspectorReview: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedFIR, setSelectedFIR] = useState<FIRForReview | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  const firsForReview: FIRForReview[] = [
    {
      id: '1',
      firNumber: 'FIR/2025/001234',
      title: 'Theft at Sector 14 Market',
      submittedBy: 'Constable Rajesh Kumar',
      submittedDate: '2025-01-12',
      victim: 'Rahul Sharma',
      accused: 'Unknown person',
      location: 'Sector 14 Market, Near Metro Station',
      ipcSections: ['IPC 379', 'IPC 356'],
      priority: 'high',
      description: 'Mobile phone and wallet theft from victim while walking near metro station.',
      evidence: 3
    },
    {
      id: '2',
      firNumber: 'FIR/2025/001235',
      title: 'Domestic Violence Case',
      submittedBy: 'Constable Priya Singh',
      submittedDate: '2025-01-11',
      victim: 'Sunita Devi',
      accused: 'Ramesh Kumar (Husband)',
      location: 'House No. 45, Sector 12',
      ipcSections: ['IPC 498A', 'IPC 323'],
      priority: 'high',
      description: 'Physical assault and mental harassment by husband and in-laws.',
      evidence: 5
    },
    {
      id: '3',
      firNumber: 'FIR/2025/001236',
      title: 'Vehicle Theft Report',
      submittedBy: 'Constable Amit Verma',
      submittedDate: '2025-01-10',
      victim: 'Mohan Lal',
      accused: 'Unknown',
      location: 'Parking Area, Sector 16',
      ipcSections: ['IPC 379'],
      priority: 'medium',
      description: 'Motorcycle theft from parking area during night hours.',
      evidence: 2
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default: return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    }
  };

  const handleReview = (fir: FIRForReview, action: 'approve' | 'reject') => {
    setSelectedFIR(fir);
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const submitReview = () => {
    if (!selectedFIR) return;

    const actionText = reviewAction === 'approve' ? 'approved' : 'rejected';
    
    addNotification({
      title: `FIR ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      message: `${selectedFIR.firNumber} has been ${actionText}`,
      type: reviewAction === 'approve' ? 'success' : 'warning'
    });

    setShowReviewModal(false);
    setSelectedFIR(null);
    setReviewComment('');
  };

  if (!hasPermission('approve_fir')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Access Denied</h3>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to review FIRs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-orange-600 to-red-700 dark:from-orange-500 dark:to-red-600 rounded-xl p-3 shadow-lg">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
              Inspector Review
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Review and approve FIR drafts submitted by officers
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">8</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">23</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Approved Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-xl p-3">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">2</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Rejected</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-xl p-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* FIRs for Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          FIRs Pending Review ({firsForReview.length})
        </h2>
        
        {firsForReview.map((fir) => (
          <div key={fir.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {fir.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(fir.priority)}`}>
                    {fir.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3 font-medium">
                  {fir.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{fir.firNumber}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <User className="w-4 h-4" />
                <span className="font-medium">{fir.submittedBy}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{fir.submittedDate}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{fir.location}</span>
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
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {fir.evidence} Evidence Files
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleReview(fir, 'reject')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 font-semibold"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleReview(fir, 'approve')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 font-semibold"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedFIR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              {reviewAction === 'approve' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {reviewAction === 'approve' ? 'Approve FIR' : 'Reject FIR'}
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4 font-medium">
              {reviewAction === 'approve' 
                ? `Are you sure you want to approve ${selectedFIR.firNumber}?`
                : `Please provide a reason for rejecting ${selectedFIR.firNumber}:`
              }
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {reviewAction === 'approve' ? 'Comments (Optional)' : 'Rejection Reason *'}
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                placeholder={reviewAction === 'approve' ? 'Add any comments...' : 'Explain why this FIR is being rejected...'}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={reviewAction === 'reject' && !reviewComment.trim()}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50'
                }`}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectorReview;