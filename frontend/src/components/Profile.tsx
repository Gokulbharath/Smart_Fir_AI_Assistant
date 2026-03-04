import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, MapPin, Phone, Calendar, CreditCard as Edit3, Save, X, Camera, Award, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BackButton from './BackButton';
import { useNotifications } from '../contexts/NotificationContext';
import { getProfile, updateProfile, type Profile as ProfileType } from '../api/profileService';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    station: '',
    rank: '',
    joinDate: '',
    badgeNumber: '',
    department: '',
    avatar: ''
  });

  // Load profile on mount
  useEffect(() => {
    if (user?.email) {
      loadProfile();
    }
  }, [user?.email]);

  const loadProfile = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      const profileData = await getProfile(user.email);
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        station: profileData.station || '',
        rank: profileData.rank || '',
        joinDate: profileData.joinDate || '',
        badgeNumber: profileData.badgeNumber || '',
        department: profileData.department || '',
        avatar: profileData.avatar || ''
      });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to load profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.email) return;
    
    try {
      setSaving(true);
      const updatedProfile = await updateProfile(user.email, formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      addNotification({
        title: 'Success',
        message: 'Profile updated successfully',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        station: profile.station || '',
        rank: profile.rank || '',
        joinDate: profile.joinDate || '',
        badgeNumber: profile.badgeNumber || '',
        department: profile.department || '',
        avatar: profile.avatar || ''
      });
    }
    setIsEditing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'inspector': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <BackButton />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const displayProfile = profile || user;

  return (
    <div className="space-y-6">
      <BackButton />
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 dark:from-green-500 dark:to-emerald-600 rounded-xl p-3 shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Manage your personal information and settings
              </p>
            </div>
          </div>
          <button
            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 font-semibold"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={formData.avatar || displayProfile?.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {formData.name || displayProfile?.name}
              </h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getRoleColor(displayProfile?.role || '')}`}>
                {displayProfile?.role?.toUpperCase()}
              </span>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Award className="w-4 h-4" />
                  <span className="font-medium">{formData.rank || displayProfile?.rank}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{formData.station || displayProfile?.station}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 dark:text-white font-medium">{formData.name || displayProfile?.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-900 dark:text-white font-medium">{formData.email || displayProfile?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 dark:text-white font-medium">{formData.phone || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Badge Number
                </label>
                <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-900 dark:text-white font-medium">{formData.badgeNumber || displayProfile?.badgeNumber || 'Not set'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Award className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 dark:text-white font-medium">{formData.department || displayProfile?.department || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Join Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900 dark:text-white font-medium">{formData.joinDate || displayProfile?.joinDate || 'Not set'}</span>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
