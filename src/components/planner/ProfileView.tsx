import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Trash2, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  LogOut,
  Clock,
  Cloud,
  Flame,
  Camera
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProfileViewProps {
  user: any;
  onSignOut: () => void;
  streak: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onSignOut, streak }) => {
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setDisplayName(data.display_name || '');
          setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        } else if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          timezone: timezone,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowPasswordChange(false);
        setTimeout(() => setPasswordSuccess(null), 3000);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Delete user data first
      await supabase.from('daily_plans').delete().eq('user_id', user.id);
      await supabase.from('goals').delete().eq('user_id', user.id);
      await supabase.from('operating_code').delete().eq('user_id', user.id);
      await supabase.from('user_profiles').delete().eq('user_id', user.id);
      
      // Sign out the user (actual account deletion would require admin API)
      await onSignOut();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  // Get user's auth provider
  const authProvider = user?.app_metadata?.provider || 'email';
  const isGoogleUser = authProvider === 'google';
  const userEmail = user?.email || '';
  const userAvatar = user?.user_metadata?.avatar_url || null;
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';

  // Common timezones
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-zinc-400">Manage your profile and preferences</p>
      </div>

      {/* Global Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt="Profile" 
                className="w-20 h-20 rounded-full border-2 border-amber-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <User size={32} className="text-black" />
              </div>
            )}
            <button className="absolute bottom-0 right-0 p-1.5 bg-zinc-800 border border-zinc-700 rounded-full hover:bg-zinc-700 transition-colors">
              <Camera size={14} className="text-zinc-400" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {displayName || userEmail.split('@')[0]}
            </h2>
            <p className="text-zinc-400 text-sm">{userEmail}</p>
            <div className="flex items-center gap-2 mt-1">
              {isGoogleUser ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  </svg>
                  Google
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded-full">
                  <Mail size={10} />
                  Email
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-800/50 rounded-xl mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Flame size={18} />
              <span className="text-xl font-bold">{streak}</span>
            </div>
            <p className="text-xs text-zinc-400">Day Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <Cloud size={18} />
              <span className="text-xl font-bold">Synced</span>
            </div>
            <p className="text-xs text-zinc-400">Cloud Status</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
              <Clock size={18} />
              <span className="text-sm font-bold">{createdAt}</span>
            </div>
            <p className="text-xs text-zinc-400">Member Since</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 text-black font-bold py-3 rounded-lg transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={20} className="text-amber-500" />
          <h3 className="text-lg font-bold text-white">Security</h3>
        </div>

        {/* Password Change - Only for email users */}
        {!isGoogleUser && (
          <div className="mb-4">
            {!showPasswordChange ? (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
              >
                <Lock size={16} />
                Change Password
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4 p-4 bg-zinc-800/50 rounded-xl">
                <h4 className="font-medium text-white mb-2">Change Password</h4>
                
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    <AlertCircle size={14} />
                    {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    <CheckCircle size={14} />
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 text-black font-medium py-2 rounded-lg transition-colors"
                  >
                    {passwordLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      'Update Password'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordError(null);
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {isGoogleUser && (
          <p className="text-sm text-zinc-500 mb-4">
            You signed in with Google. Password management is handled through your Google account.
          </p>
        )}

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 size={20} className="text-red-500" />
          <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
        </div>

        {!showDeleteConfirm ? (
          <div>
            <p className="text-sm text-zinc-400 mb-4">
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-red-500/10 rounded-xl">
            <p className="text-sm text-red-400">
              This action cannot be undone. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full bg-zinc-900 border border-red-500/30 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete My Account
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
