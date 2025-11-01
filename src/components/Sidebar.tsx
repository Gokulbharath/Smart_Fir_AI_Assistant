import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MessageSquare, 
  FileText, 
  FilePlus,
  Archive, 
  Search, 
  Home,
  Bot,
  ChevronRight,
  CheckCircle,
  Eye,
  Bell,
  User,
  Settings,
  Shield,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user, hasPermission, hasRole } = useAuth();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', permission: null },
    { icon: Bot, label: 'AI Chatbot', path: '/dashboard/chatbot', permission: 'create_fir' },
    { icon: FilePlus, label: 'New FIR', path: '/dashboard/new-fir', permission: 'create_fir' },
    { icon: FileText, label: 'FIR Drafts', path: '/dashboard/fir-drafts', permission: 'view_fir' },
    { icon: Eye, label: 'Inspector Review', path: '/dashboard/inspector-review', permission: 'approve_fir' },
    { icon: CheckCircle, label: 'Approved FIRs', path: '/dashboard/approved-firs', permission: 'view_fir' },
    { icon: Archive, label: 'Evidence Locker', path: '/dashboard/evidence', permission: 'upload_evidence' },
    { icon: Search, label: 'Case Retrieval', path: '/dashboard/cases', permission: 'search_cases' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics', permission: 'view_analytics' },
    { icon: Bell, label: 'Notifications', path: '/dashboard/notifications', permission: null },
    { icon: User, label: 'Profile', path: '/dashboard/profile', permission: null },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings', permission: null },
    { icon: Shield, label: 'Admin Panel', path: '/dashboard/admin', permission: 'manage_users' },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 shadow-lg overflow-y-auto">
      <div className="p-4">
        {/* User Role Badge */}
        <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt="User"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name?.split(' ')[0]}
              </p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                user?.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                user?.role === 'inspector' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
              }`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;