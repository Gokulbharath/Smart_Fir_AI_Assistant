import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FileText, 
  FilePlus,
  Home,
  Bot,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Eye,
  Shield,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { hasPermission } = useAuth();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', permission: null },
    { icon: Bot, label: 'AI Chatbot', path: '/dashboard/chatbot', permission: 'create_fir' },
    { icon: FilePlus, label: 'New FIR', path: '/dashboard/new-fir', permission: 'create_fir' },
    { icon: FileText, label: 'FIR Drafts', path: '/dashboard/fir-drafts', permission: 'view_fir' },
    { icon: Eye, label: 'Inspector Review', path: '/dashboard/inspector-review', permission: 'approve_fir' },
    { icon: CheckCircle, label: 'Approved FIRs', path: '/dashboard/approved-firs', permission: 'view_fir' },
    //{ icon: Archive, label: 'Evidence Locker', path: '/dashboard/evidence', permission: 'upload_evidence' },
    //{ icon: Search, label: 'Case Retrieval', path: '/dashboard/cases', permission: 'search_cases' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics', permission: 'view_analytics' },
    //{ icon: Bell, label: 'Notifications', path: '/dashboard/notifications', permission: null },
    //{ icon: User, label: 'Profile', path: '/dashboard/profile', permission: null },
    //{ icon: Settings, label: 'Settings', path: '/dashboard/settings', permission: null },
    { icon: Shield, label: 'Admin Panel', path: '/dashboard/admin', permission: 'manage_users' },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <>
      {/* Toggle Button - Fixed when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-20 z-50 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 shadow-lg overflow-y-auto transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : '-translate-x-full w-0'
        }`}
      >
        <div className="p-4">
          {/* Header with Toggle Button */}
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={onToggle}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 hover:scale-110 group"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>
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
                  } ${!isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;