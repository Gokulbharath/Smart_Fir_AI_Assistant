import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Analytics: React.FC = () => {
  const { user, hasPermission } = useAuth();

  const stats = [
    {
      title: 'Total FIRs',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'bg-blue-600'
    },
    {
      title: 'Pending Review',
      value: '23',
      change: '-8%',
      trend: 'down',
      icon: Clock,
      color: 'bg-yellow-600'
    },
    {
      title: 'Approved',
      value: '1,156',
      change: '+15%',
      trend: 'up',
      icon: CheckCircle,
      color: 'bg-green-600'
    },
    {
      title: 'High Priority',
      value: '45',
      change: '+5%',
      trend: 'up',
      icon: AlertTriangle,
      color: 'bg-red-600'
    }
  ];

  const crimeTypes = [
    { type: 'Theft', count: 342, percentage: 27.4 },
    { type: 'Assault', count: 198, percentage: 15.9 },
    { type: 'Fraud', count: 156, percentage: 12.5 },
    { type: 'Domestic Violence', count: 134, percentage: 10.7 },
    { type: 'Burglary', count: 89, percentage: 7.1 },
    { type: 'Others', count: 328, percentage: 26.4 }
  ];

  const monthlyData = [
    { month: 'Jan', firs: 98, approved: 89 },
    { month: 'Feb', firs: 112, approved: 105 },
    { month: 'Mar', firs: 87, approved: 82 },
    { month: 'Apr', firs: 134, approved: 128 },
    { month: 'May', firs: 156, approved: 145 },
    { month: 'Jun', firs: 142, approved: 138 }
  ];

  const hotspots = [
    { area: 'Sector 14 Market', incidents: 45, risk: 'high' },
    { area: 'Sector 18 Mall', incidents: 32, risk: 'medium' },
    { area: 'Railway Station', incidents: 28, risk: 'high' },
    { area: 'Bus Terminal', incidents: 23, risk: 'medium' },
    { area: 'City Center', incidents: 19, risk: 'low' }
  ];

  if (!hasPermission('view_analytics')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Access Denied</h3>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to view analytics.
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
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-500 dark:to-indigo-600 rounded-xl p-3 shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Crime statistics and performance insights
            </p>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} rounded-xl p-3 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 text-sm font-bold ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Types Distribution */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Crime Types Distribution</h2>
          <div className="space-y-4">
            {crimeTypes.map((crime, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  <span className="text-slate-900 dark:text-white font-medium">{crime.type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${crime.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-12 text-right">
                    {crime.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Monthly Trends</h2>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-900 dark:text-white">{data.month}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">FIRs</p>
                    <p className="font-bold text-slate-900 dark:text-white">{data.firs}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
                    <p className="font-bold text-green-600">{data.approved}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crime Hotspots */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Crime Hotspots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotspots.map((hotspot, index) => (
            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-900 dark:text-white">{hotspot.area}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  hotspot.risk === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                  hotspot.risk === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                }`}>
                  {hotspot.risk.toUpperCase()}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{hotspot.incidents}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">incidents this month</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 text-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-600 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">2.3 hrs</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Average Processing Time</p>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 text-center">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">94.2%</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Approval Rate</p>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 text-center">
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-600 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">24</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Active Officers</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;