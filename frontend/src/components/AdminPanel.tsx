import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Added
import { Shield, Users, BarChart3, Settings, Bell, Activity, CheckCircle, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import { getAdminStats, getAdminUsers, getAdminAnalytics, createUser, updateUserStatus, deleteUser, type AdminStats, type SystemUser, type AdminAnalytics } from '../api/adminService';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

// AccessDenied component removed as we redirect to login instead

const AdminPanel: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate(); // Added

  const [activeTab, setActiveTab] = useState('users');

  // Real-time data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Add User modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('CONSTABLE');
  const [newUserStation, setNewUserStation] = useState('');
  const [newUserStatus, setNewUserStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  // Redirect if not authorized
  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'ADMIN')) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch all admin data
  const fetchAdminData = useCallback(async () => {
    // Guard: Don't fetch if not admin (avoids 403s before redirect happens)
    if (!user || user.role !== 'ADMIN') return;

    try {
      if (!stats) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const [statsData, usersData, analyticsData] = await Promise.all([
        getAdminStats().catch((err) => {
          console.error('Failed to fetch stats:', err);
          return null;
        }),
        getAdminUsers().catch((err) => {
          console.error('Failed to fetch users:', err);
          return [];
        }),
        getAdminAnalytics().catch((err) => {
          console.error('Failed to fetch analytics:', err);
          return null;
        })
      ]);

      if (statsData) setStats(statsData);
      if (usersData) setSystemUsers(usersData);
      if (analyticsData) setAnalytics(analyticsData);

      // Use static role list for dropdown (do not allow creating ADMIN via UI)
      const staticRoles = ['CONSTABLE', 'HEAD_CONSTABLE', 'ASI', 'SI', 'INSPECTOR', 'DSP', 'ASP', 'SP', 'DIG', 'IG', 'ADGP', 'DGP'];
      setAvailableRoles(staticRoles);

      setLastUpdated(new Date());
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load admin data';
      console.error('Failed to load admin data:', errorMsg);
      addNotification({
        title: 'Error',
        message: errorMsg,
        type: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addNotification, stats, user]); // Added user dependency

  // Initial fetch
  useEffect(() => {
    if (user?.role === 'ADMIN') { // Double check
      fetchAdminData();
    }
  }, [fetchAdminData, user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    const interval = setInterval(() => {
      fetchAdminData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAdminData, user]);

  // Check authorization AFTER all hooks
  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return null; // Or <AccessDenied /> if we want to show something briefly before redirect
  }

  // Create user handler
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newUserEmail)) errors.email = 'Enter a valid email';
    if (newUserPassword.length < 8) errors.password = 'Password must be at least 8 characters';
    if (!newUserRole) errors.role = 'Role is required';
    if (!newUserStation || newUserStation.trim() === '') errors.station = 'Station is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await createUser({
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        station: newUserStation,
        status: newUserStatus,
        name: newUserEmail.split('@')[0]
      });

      addNotification({ title: 'Success', message: 'Police officer created successfully', type: 'success' });
      setIsAddModalOpen(false);
      // Clear form
      setNewUserEmail(''); setNewUserPassword(''); setNewUserRole('CONSTABLE'); setNewUserStation(''); setNewUserStatus('ACTIVE');
      // Refresh list
      fetchAdminData();
    } catch (err: unknown) {
      console.error('Create user error:', err);
      const e = err as unknown as { status?: number; error?: string; message?: string };
      if (e && (e.status === 401 || e.status === 403)) {
        navigate('/login', { replace: true });
        return;
      }
      const errMsg = (e && (e.error || e.message)) ? (e.error || e.message)! : 'Failed to create user';
      addNotification({ title: 'Error', message: errMsg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (u: SystemUser) => {
    const targetStatus = (String(u.status).toLowerCase() === 'active') ? 'SUSPENDED' : 'ACTIVE';

    // Prevent suspending/deactivating admin or self
    if (String(u.role).toUpperCase() === 'ADMIN') {
      addNotification({ title: 'Error', message: 'Cannot change status of ADMIN', type: 'error' });
      return;
    }
    if (u.id === user?.id) {
      addNotification({ title: 'Error', message: 'You cannot change your own status', type: 'error' });
      return;
    }

    try {
      await updateUserStatus(u.id, targetStatus as 'ACTIVE' | 'SUSPENDED');
      addNotification({ title: 'Success', message: 'User status updated', type: 'success' });
      fetchAdminData();
    } catch (err: unknown) {
      const e = err as unknown as { status?: number; error?: string; message?: string };
      if (e && (e.status === 401 || e.status === 403)) {
        navigate('/login', { replace: true });
        return;
      }
      addNotification({ title: 'Error', message: e?.error || e?.message || 'Failed to update status', type: 'error' });
    }
  };

  const handleDeleteUser = async (u: SystemUser) => {
    // Prevent deleting admin or self
    if (u.role === 'ADMIN') {
      addNotification({ title: 'Error', message: 'Cannot delete ADMIN user', type: 'error' });
      return;
    }
    if (u.id === user?.id) {
      addNotification({ title: 'Error', message: 'You cannot delete yourself', type: 'error' });
      return;
    }

    const ok = window.confirm(`Delete ${u.email}? This action cannot be undone.`);
    if (!ok) return;

    try {
      await deleteUser(u.id);
      addNotification({ title: 'Success', message: 'User deleted', type: 'success' });
      fetchAdminData();
    } catch (err: unknown) {
      const e = err as unknown as { status?: number; error?: string; message?: string };
      if (e && (e.status === 401 || e.status === 403)) {
        navigate('/login', { replace: true });
        return;
      }
      addNotification({ title: 'Error', message: e?.error || e?.message || 'Failed to delete user', type: 'error' });
    }
  };

  // System stats from real data
  const systemStats = stats ? [
    { title: 'Total Users', value: stats.totalUsers.toString(), change: '+0', icon: Users, color: 'bg-blue-600' },
    { title: 'Active Sessions', value: stats.activeSessions.toString(), change: '+0', icon: Activity, color: 'bg-green-600' },
    { title: 'System Uptime', value: stats.systemUptime, change: '+0%', icon: CheckCircle, color: 'bg-emerald-600' },
    { title: 'AI Accuracy', value: stats.aiAccuracy, change: '+0%', icon: TrendingUp, color: 'bg-purple-600' }
  ] : [
    { title: 'Total Users', value: '...', change: '+0', icon: Users, color: 'bg-blue-600' },
    { title: 'Active Sessions', value: '...', change: '+0', icon: Activity, color: 'bg-green-600' },
    { title: 'System Uptime', value: '...', change: '+0%', icon: CheckCircle, color: 'bg-emerald-600' },
    { title: 'AI Accuracy', value: '...', change: '+0%', icon: TrendingUp, color: 'bg-purple-600' }
  ];

  const getRoleBadge = (role: string) => {
    const normalized = role ? role.toUpperCase() : '';
    const badges: Record<string,string> = {
      ADMIN: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      INSPECTOR: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      CONSTABLE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
    };
    return badges[normalized] || 'bg-slate-100 dark:bg-slate-700/30 text-slate-800 dark:text-slate-300';
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

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
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Statistics</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
              title="Add police user"
            >
              <Users className="w-4 h-4" />
              <span>Add User</span>
            </button>

            <button
              onClick={fetchAdminData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-colors"
              title="Refresh data"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Refresh</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat, index) => (
            <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
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
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === tab.id
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

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Add Police User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-slate-700">Close</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
                {formErrors.email && <div className="text-red-600 text-sm mt-1">{formErrors.email}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
                {formErrors.password && <div className="text-red-600 text-sm mt-1">{formErrors.password}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                    {availableRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {formErrors.role && <div className="text-red-600 text-sm mt-1">{formErrors.role}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Station</label>
                  <input type="text" value={newUserStation} onChange={(e) => setNewUserStation(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
                  {formErrors.station && <div className="text-red-600 text-sm mt-1">{formErrors.station}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select value={newUserStatus} onChange={(e) => setNewUserStatus(e.target.value as 'ACTIVE' | 'SUSPENDED')} className="w-full px-3 py-2 border rounded-lg">
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-green-600 text-white">{submitting ? 'Saving...' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
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
                {systemUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {u.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {u.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getRoleBadge(u.role)}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {u.station}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${getStatusBadge(u.status)}`}>
                        {(u.status || '').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => toggleUserStatus(u)} className="px-2 py-1 bg-yellow-100 rounded-lg text-sm font-medium">
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={u.role === 'ADMIN' || u.id === user?.id}
                          className={`px-2 py-1 rounded-lg text-sm font-medium ${u.role === 'ADMIN' || u.id === user?.id ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-700'}`}
                        >
                          Delete
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Analytics</h2>
            {loading && (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            )}
          </div>
          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">AI Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Accuracy Rate</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{analytics.aiPerformance.accuracyRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Processing Time</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{analytics.aiPerformance.processingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Success Rate</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{analytics.aiPerformance.successRate}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">System Health</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Server Uptime</span>
                    <span className="text-sm font-bold text-green-600">{analytics.systemHealth.serverUptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Database Status</span>
                    <span className="text-sm font-bold text-green-600">{analytics.systemHealth.databaseStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">API Response</span>
                    <span className="text-sm font-bold text-green-600">{analytics.systemHealth.apiResponse}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
            </div>
          )}
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