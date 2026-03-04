import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Bot,
  Shield,
  Search,
  TrendingUp,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCounts } from '../api/firService';
import { getEvidence } from '../api/evidenceService';
import { getCaseStats } from '../api/caseService';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    firsProcessed: 0,
    casesClosed: 0,
    pendingReviews: 0,
    evidenceItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Redirect Admin to Admin Panel immediately
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/dashboard/admin', { replace: true });
    }
  }, [user, navigate]);

  // Fetch real-time stats
  const fetchStats = async () => {
    // Do nothing if user is not yet loaded or if Admin
    if (!user || user.role === 'ADMIN') return;

    try {
      setLoading(true);
      const [firCounts, evidenceList, caseStats] = await Promise.all([
        getCounts().catch(() => ({ draft: 0, pending: 0, approved: 0, rejected: 0 })),
        getEvidence().catch(() => []),
        getCaseStats().catch(() => ({ total: 0, byStatus: { Closed: 0, Investigating: 0, Pending: 0 } }))
      ]);

      setStats({
        firsProcessed: (firCounts.approved || 0) + (firCounts.draft || 0) + (firCounts.pending || 0),
        casesClosed: caseStats.byStatus?.Closed || 0,
        pendingReviews: firCounts.pending || 0,
        evidenceItems: evidenceList.length || 0
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch when user is loaded and not an Admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      // Initial fetch and auto-refresh
      fetchStats();
      const interval = setInterval(fetchStats, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
    // If user becomes ADMIN, ensure we stop any activity and clear stats
    if (user && user.role === 'ADMIN') {
      setStats({ firsProcessed: 0, casesClosed: 0, pendingReviews: 0, evidenceItems: 0 });
      setLoading(false);
    }
  }, [user]);

  const statsData = [
    {
      title: 'FIRs Processed',
      value: loading ? '...' : stats.firsProcessed.toString(),
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'bg-blue-600'
    },
    {
      title: 'Cases Closed',
      value: loading ? '...' : stats.casesClosed.toString(),
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'bg-green-600'
    },
    {
      title: 'Pending Reviews',
      value: loading ? '...' : stats.pendingReviews.toString(),
      change: '-5%',
      trend: 'down',
      icon: Clock,
      color: 'bg-yellow-600'
    },
    {
      title: 'Evidence Items',
      value: loading ? '...' : stats.evidenceItems.toString(),
      change: '+23%',
      trend: 'up',
      icon: Shield,
      color: 'bg-purple-600'
    }
  ];

  const recentFIRs = [
    {
      id: 'FIR/2025/001234',
      type: 'Theft',
      status: 'Draft',
      date: '2025-01-12',
      victim: 'Rahul Sharma'
    },
    {
      id: 'FIR/2025/001233',
      type: 'Assault',
      status: 'Submitted',
      date: '2025-01-11',
      victim: 'Priya Kumari'
    },
    {
      id: 'FIR/2025/001232',
      type: 'Burglary',
      status: 'Under Review',
      date: '2025-01-10',
      victim: 'Amit Singh'
    }
  ];

  const quickActions = [
    {
      title: 'AI Chatbot',
      description: 'Use AI to draft FIR from complaint',
      icon: Bot,
      action: '/dashboard/chatbot',
      color: 'bg-blue-600'
    },
    {
      title: 'New FIR Form',
      description: 'Create FIR using structured form',
      icon: FileText,
      action: '/dashboard/new-fir',
      color: 'bg-green-600'
    },
    {
      title: 'Upload Evidence',
      description: 'Secure evidence storage',
      icon: Shield,
      action: '/dashboard/evidence',
      color: 'bg-purple-600'
    },
    {
      title: 'Search Cases',
      description: 'Find similar past cases',
      icon: Search,
      action: '/dashboard/cases',
      color: 'bg-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="flex items-center justify-between">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
                title="Refresh stats"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-blue-100 text-lg font-medium">
              Here's what's happening with your cases today.
            </p>
            <p className="text-blue-200 text-sm mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 relative z-10">
            <Award className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} rounded-xl p-3 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                <span>{stat.change}</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stat.value}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {stat.title}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.action)}
              className="p-6 border border-slate-200 dark:border-slate-600 rounded-xl hover:shadow-xl transition-all duration-300 text-left group hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800"
            >
              <div className={`${action.color} rounded-xl p-4 w-fit mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent FIRs */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Recent FIRs
          </h2>
          <div className="space-y-4">
            {recentFIRs.map((fir, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-slate-50 dark:from-slate-700 dark:to-slate-800">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {fir.id}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${fir.status === 'Draft'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      : fir.status === 'Submitted'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                      }`}>
                      {fir.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span>{fir.type}</span>
                    <span>•</span>
                    <span>{fir.victim}</span>
                  </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {fir.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            System Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3">
                  <Bot className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-slate-900 dark:text-white font-semibold">AI Assistant</span>
              </div>
              <span className="text-green-600 text-sm font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">Online</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-slate-900 dark:text-white font-semibold">Evidence Storage</span>
              </div>
              <span className="text-green-600 text-sm font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">Secure</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3">
                  <Search className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-slate-900 dark:text-white font-semibold">Case Database</span>
              </div>
              <span className="text-green-600 text-sm font-bold bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">Connected</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-3">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-slate-900 dark:text-white font-semibold">Backup System</span>
              </div>
              <span className="text-yellow-600 text-sm font-bold bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">Scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
