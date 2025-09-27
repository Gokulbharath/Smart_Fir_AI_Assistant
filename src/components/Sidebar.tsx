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
  ChevronRight
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Overview', path: '/dashboard' },
    { icon: Bot, label: 'AI Chatbot', path: '/dashboard/chatbot' },
    { icon: FilePlus, label: 'New FIR', path: '/dashboard/new-fir' },
    { icon: FileText, label: 'FIR Drafts', path: '/dashboard/fir-drafts' },
    { icon: Archive, label: 'Evidence Locker', path: '/dashboard/evidence' },
    { icon: Search, label: 'Case Retrieval', path: '/dashboard/cases' },
  ];

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 shadow-lg">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
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
    </aside>
  );
};

export default Sidebar;