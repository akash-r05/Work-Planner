import React, { useState } from 'react';
import {
  User,
  Lock,
  Moon,
  Sun,
  Bell,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

interface SettingsViewProps {
  onRefreshAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshAllData }) => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(
    user?.preferences?.emailNotifications ?? true
  );
  const [compactView, setCompactView] = useState(user?.preferences?.compactView ?? false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [confirmReseedOpen, setConfirmReseedOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingProfile(true);
    try {
      const res = await api.updateProfile({
        name: name.trim(),
        preferences: {
          theme,
          emailNotifications,
          compactView,
        },
      });
      if (res.success && res.user) {
        updateUser(res.user);
        showToast('Profile updated successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please provide both current and new passwords', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await api.updateProfile({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        showToast('Password updated securely', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleReseed = async () => {
    try {
      await api.reseedData(true);
      showToast('Demo workspace reset to initial state with fresh projects & tasks', 'success');
      onRefreshAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reset demo data', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      showToast('Account deleted permanently', 'info');
      logout();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Account & Workspace Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure profile details, interface preferences, authentication, and demo sandbox data.
        </p>
      </div>

      {/* Profile Details */}
      <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 pb-3 border-b border-slate-800/80 mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-violet-400" />
          <span>Profile Information</span>
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Interface Preferences */}
      <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 pb-3 border-b border-slate-800/80 mb-5 flex items-center gap-2">
          <Moon className="w-4 h-4 text-cyan-400" />
          <span>Workspace Appearance & Preferences</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">Theme Mode</p>
              <p className="text-[11px] text-slate-400">Select Dark Midnight or Daylight theme</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
                  theme === 'dark' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
                  theme === 'light' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
            <div>
              <p className="text-xs font-medium text-slate-200">Email Reminders</p>
              <p className="text-[11px] text-slate-400">Receive in-app alerts when tasks are nearing due dates</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={e => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-900 border-slate-700"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-medium text-slate-200">Compact Density</p>
              <p className="text-[11px] text-slate-400">Display tighter list rows with higher information density</p>
            </div>
            <input
              type="checkbox"
              checked={compactView}
              onChange={e => setCompactView(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-900 border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Security & Password */}
      <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 pb-3 border-b border-slate-800/80 mb-5 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Security & Password</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword || !currentPassword || !newPassword}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-xl transition-colors"
            >
              {savingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Sandbox & Data Reset */}
      <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 pb-3 border-b border-slate-800/80 mb-5 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>Developer & Demo Controls</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-200">Reseed Demo Database</p>
            <p className="text-[11px] text-slate-400">
              Reset all tasks, projects, and activities back to rich initial sample data.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfirmReseedOpen(true)}
            className="px-4 py-2 bg-amber-600/20 border border-amber-500/40 hover:bg-amber-600/30 text-amber-300 text-xs font-medium rounded-xl transition-colors self-start sm:self-auto"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-rose-950/60 bg-rose-950/20 p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-rose-300 pb-3 border-b border-rose-900/40 mb-4 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Danger Zone</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-rose-200">Delete Account & Workspace</p>
            <p className="text-[11px] text-rose-400/80">
              Permanently purge your account, all associated projects, tasks, and historical records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Reseed confirmation modal */}
      <ConfirmDialog
        isOpen={confirmReseedOpen}
        onClose={() => setConfirmReseedOpen(false)}
        onConfirm={handleReseed}
        title="Reset Demo Workspace?"
        message="This will overwrite current projects and tasks with fresh demo records for Alex Vance. Are you sure you want to proceed?"
        confirmLabel="Reset Data"
      />

      {/* Delete confirmation modal */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account?"
        message="This operation cannot be reversed. All your tasks, projects, checklists, and activities will be deleted immediately."
        confirmLabel="Delete Account Permanently"
        isDestructive
      />
    </div>
  );
};
