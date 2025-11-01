import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Database,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, hasPermission } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    firApproval: true,
    systemUpdates: true
  });
  const [autoSave, setAutoSave] = useState(true);
  const [dataRetention, setDataRetention] = useState('1year');

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleBackup = () => {
    // Simulate backup process
    console.log('Starting backup...');
  };

  const handleModelUpdate = () => {
    // Simulate AI model update
    console.log('Updating AI model...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 rounded-xl p-3 shadow-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-400 dark:to-slate-500 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Configure your application preferences and system settings
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <Sun className="w-5 h-5 mr-2" />
            Appearance
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Theme</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                {theme === 'dark' ? (
                  <Moon className="absolute left-1 w-3 h-3 text-blue-600" />
                ) : (
                  <Sun className="absolute right-1 w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Auto-save Drafts</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Automatically save FIR drafts</p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoSave ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            {Object.entries({
              email: 'Email Notifications',
              push: 'Push Notifications',
              sms: 'SMS Alerts',
              firApproval: 'FIR Approval Updates',
              systemUpdates: 'System Updates'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{label}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {key === 'firApproval' ? 'Get notified about FIR status changes' : 
                     key === 'systemUpdates' ? 'Receive system maintenance alerts' :
                     `Receive ${label.toLowerCase()}`}
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange(key, !notifications[key as keyof typeof notifications])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Data Retention</h3>
              <select
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
                <option value="2years">2 Years</option>
                <option value="5years">5 Years</option>
              </select>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 font-semibold">
              <Shield className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* System Settings (Admin Only) */}
        {hasPermission('system_settings') && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              System Management
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={handleBackup}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200 font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>Backup Data</span>
              </button>

              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200 font-semibold">
                <Upload className="w-4 h-4" />
                <span>Import Data</span>
              </button>

              <button
                onClick={handleModelUpdate}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all duration-200 font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update AI Model</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg">
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;