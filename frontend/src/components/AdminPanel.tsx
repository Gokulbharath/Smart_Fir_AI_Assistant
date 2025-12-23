import React, { useState } from 'react';
import { Shield, Users, UserPlus, CreditCard as Edit3, Trash2, BarChart3, Settings, Bell, Database, Activity, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'officer' | 'inspector' | 'admin';
  station: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const AdminPanel: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUser, setShowAddUser] = useState(false);

  const systemUsers: SystemUser[] = [
    {
      id: '1',
      name: 'Constable Rajesh Kumar',
      email: 'officer@police.gov.in',
      role: 'officer',
      station: 'Sector 14 Police Station',
      status: 'active',
      lastLogin: '2025-01-12 14:30'
    },
    {
      id: '2',
      name: 'Inspector Priya Sharma',
      email: 'inspector@police.gov.in',
      role: 'inspector',
      station: 'Sector 14 Police Station',
      status: 'active',
      lastLogin: '2025-01-12 16:45'
    },
    {
      id: '3',
      name: 'Constable Amit Singh',
      email: 'amit.singh@police.gov.in',
      role: 'officer',
      station: 'Sector 18 Police Station',
      status: 'inactive',
      lastLogin: '2025-01-10 09:15'
    }
  ];

  const systemStats = [
    { title: 'Total Users', value: '24', change: '+3', icon: Users, color: 'bg-blue-600' },
    { title: 'Active Sessions', value: '18', change: '+2', icon: Activity, color: 'bg-green-600' },
    { title: 'System Uptime', value: '99.9%', change: '+0.1%', icon: CheckCircle, color: 'bg-emerald-600' },
    { title: 'AI Accuracy', value: '94.2%', change: '+1.2%', icon: TrendingUp, color: 'bg-purple-600' }
  ];

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      inspector: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      officer: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
    };
    return badges[role as keyof typeof badges] || badges.officer;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  if (!hasPermission('manage_users')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Access Denied</h3>
          <p className="text-slate-600 dark:text-slate-400">
            You don't have permission to access the admin panel.
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
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              System administration and user management
            </p>
          </div>
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
          <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} rounded-xl p-3 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-sm font-bold text-green-600">
                <TrendingUp className="w-4 h-4" />
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

      {/* Tab Navigation */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-2">
        <div className="flex space-x-2">
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
            { id: 'settings', label: 'System Settings', icon: Settings },
            { id: 'notifications', label: 'Broadcast', icon: Bell }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Station
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {systemUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {user.station}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getStatusBadge(user.status)}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1">
                          <Edit3 className="w-4 h-4" />
                        </button>
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
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">System Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">AI Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Accuracy Rate</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Processing Time</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">2.3s avg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Success Rate</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">98.7%</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">System Health</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Server Uptime</span>
                  <span className="text-sm font-bold text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Database Status</span>
                  <span className="text-sm font-bold text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">API Response</span>
                  <span className="text-sm font-bold text-green-600">Fast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Broadcast Notifications</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Message Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                placeholder="Enter notification title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Message Content
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                placeholder="Enter notification message"
              />
            </div>
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
              <Bell className="w-4 h-4" />
              <span>Send Notification</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;