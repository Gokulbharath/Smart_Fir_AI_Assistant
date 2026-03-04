import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  FilePlus,
  Home,
  Bot,
  ChevronRight,
  CheckCircle,
  Eye,
  Shield,
  Search,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Sidebar is always open now; props removed

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  requiredPermission?: string;
  role?: string; // Optional: strictly require a role match (e.g. for Admin Panel)
}

const Sidebar: React.FC = () => {
  const { user, hasPermission } = useAuth();

  // Define logic for Dashboard link
  // If user is Admin, they shouldn't see the Police Dashboard (Overview)
  // They should see Admin Panel.
  // We'll handle this by showing 'Dashboard' only to Police.
  // Or renaming it.

  const navItems: NavItem[] = [
    // Police Features
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
      requiredPermission: 'FIR_VIEW' // Basic Police permission
    },
    {
      icon: Bot,
      label: 'AI Chatbot',
      path: '/dashboard/chatbot',
      requiredPermission: 'AI_INSIGHTS'
    },
    {
      icon: FilePlus,
      label: 'New FIR',
      path: '/dashboard/new-fir',
      requiredPermission: 'FIR_CREATE'
    },
    {
      icon: FileText,
      label: 'FIR Drafts',
      path: '/dashboard/fir-drafts',
      requiredPermission: 'FIR_VIEW'
    },
    {
      icon: Eye,
      label: 'Inspector Review',
      path: '/dashboard/inspector-review',
      requiredPermission: 'FIR_APPROVE'
    },
    {
      icon: CheckCircle,
      label: 'Approved FIRs',
      path: '/dashboard/approved-firs',
      requiredPermission: 'FIR_VIEW'
    },
    {
      icon: FolderOpen,
      label: 'Evidence',
      path: '/dashboard/evidence',
      requiredPermission: 'EVIDENCE_VIEW'
    },
    {
      icon: Search,
      label: 'Case Search',
      path: '/dashboard/cases',
      requiredPermission: 'CASE_SEARCH'
    },
    // Admin Features
    {
      icon: Shield,
      label: 'Admin Panel',
      path: '/dashboard/admin',
      role: 'ADMIN' // Strict role check preferred for Admin as permissions might be broad or shared
    },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!user) return false;

    // Strict Role Check (Precedence)
    if (item.role) {
      if (user.role !== item.role) return false;
    }

    // Permission Check
    // If strict Role check passed (or wasn't present), check permission
    // But if Role was present and matched, we keep it (unless permission also specified and fails)
    if (item.role && user.role === item.role) return true;

    // If Admin, exclude items that are strictly for police
    // Admin has specific permissions ['USER_MANAGE', 'SYSTEM_MANAGE']. 
    // Admin does NOT have 'FIR_VIEW', 'AI_INSIGHTS' etc. 
    // So 'hasPermission' check will correctly exclude them.

    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission);
    }

    return true;
  });

  return (
    <>
      {/* Toggle Button - Fixed when sidebar is closed */}


      {/* Sidebar */}
      <aside
        className="fixed left-0 top-16 h-full w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 shadow-lg overflow-y-auto transition-all duration-300 z-40 pt-4"
      >
        <div className="p-4">
          {/* Header with Toggle Button */}


          {/* Navigation */}
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                  }`
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