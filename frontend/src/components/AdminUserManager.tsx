import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createUser, getAllUsers, type PoliceRole } from '../api/authService';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: PoliceRole;
}

interface AdminPanelProps {
  onClose?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { user, token } = useAuth();
  const [role, setRole] = useState<PoliceRole>('INSPECTOR');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'users'>('create');
  const [roleHierarchy, setRoleHierarchy] = useState<Record<string, number>>({});

  const roles: PoliceRole[] = [
    'CONSTABLE', 'HEAD_CONSTABLE', 'ASI', 'SI', 'INSPECTOR',
    'DSP', 'SP', 'DIG', 'IG', 'ADGP', 'DGP', 'ADMIN'
  ];

  const loadUsers = useCallback(async () => {
    if (!token) return;
    try {
      const result = await getAllUsers(token);
      setUsers(result.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }, [token]);

  // Use a static police role hierarchy instead of calling server-side hierarchy endpoint
  const loadHierarchy = useCallback(() => {
    const staticHierarchy: Record<string, number> = {
      CONSTABLE: 1,
      HEAD_CONSTABLE: 2,
      ASI: 3,
      SI: 4,
      INSPECTOR: 5,
      DSP: 6,
      ASP: 7,
      SP: 8,
      DIG: 9,
      IG: 10,
      ADGP: 11,
      DGP: 12,
      ADMIN: 13
    };
    setRoleHierarchy(staticHierarchy);
  }, []);

  useEffect(() => {
    loadUsers();
    loadHierarchy();
  }, [loadUsers, loadHierarchy]);

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>Access Denied: Admin privileges required</span>
        </div>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setMessage({ type: 'error', text: 'No authentication token found' });
      return;
    }

    if (!loginId.trim() || !password.trim() || !name.trim()) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    setLoading(true);
    try {
      await createUser(token, {
        role,
        email: loginId.toLowerCase(),
        password,
        name
      });

      setMessage({ type: 'success', text: `User created: ${name} (${role})` });
      setLoginId('');
      setPassword('');
      setName('');
      setRole('INSPECTOR');
      
      // Reload users list
      setTimeout(() => loadUsers(), 500);
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Failed to create user';
      setMessage({ type: 'error', text: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <UserPlus className="w-8 h-8 text-blue-600" />
          <span>Admin Panel</span>
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Close
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'create'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Create User
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          View Users ({users.length})
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Create User Tab */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Police Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as PoliceRole)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r} (Level {roleHierarchy[r] || '?'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Login ID
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="user@police.gov.in"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      )}

      {/* View Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Role</th>
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="text-center text-slate-600 dark:text-slate-400 py-8">No users found</p>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Police Hierarchy:</strong> CONSTABLE (1) → HEAD_CONSTABLE (2) → ASI (3) → SI (4) → INSPECTOR (5) → DSP (6) → ASP (7) → SP (8) → DIG (9) → IG (10) → ADGP (11) → DGP (12) → ADMIN (13)
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
