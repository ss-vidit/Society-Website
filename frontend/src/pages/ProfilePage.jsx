import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, KeyRound, Phone, Upload, User } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BottomDock from '../components/BottomDock';

const SOCIETY_ROLE_OPTIONS = [
  { value: 'western_dancer', label: 'Western Dancer' },
  { value: 'classical_dancer', label: 'Classical Dancer' },
  { value: 'both_dancer', label: 'Both (Western & Classical)' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'content_team', label: 'Content Team' },
  { value: 'graphics_designer', label: 'Graphics Designer' }
];

export default function ProfilePage({ setup = false }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [instagram, setInstagram] = useState(user?.instagram || '');
  const [year, setYear] = useState(user?.year || 1);
  const [societyRole, setSocietyRole] = useState(user?.societyRole || []);
  const [photo, setPhoto] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleRole = (role) => {
    setSocietyRole((current) =>
      current.includes(role) ? current.filter((value) => value !== role) : [...current, role]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    if (newPassword && newPassword !== confirmPassword) {
      setStatus('New password and confirmation do not match.');
      return;
    }
    if (newPassword && newPassword === currentPassword) {
      setStatus('New password must be different from the current password.');
      return;
    }
    if (setup && (!currentPassword || !newPassword)) {
      setStatus('Enter your demo password and choose a new password to continue.');
      return;
    }
    if (!setup && Boolean(currentPassword) !== Boolean(newPassword)) {
      setStatus('Enter both current and new passwords to change your password.');
      return;
    }

    setSaving(true);
    try {
      const profile = new FormData();
      profile.append('name', name.trim());
      profile.append('phone', phone.trim());
      profile.append('instagram', instagram.trim());
      profile.append('year', String(year));
      profile.append('societyRole', JSON.stringify(societyRole));
      if (photo) profile.append('photo', photo);

      await api.patch('/users/profile', profile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (currentPassword && newPassword) {
        await api.patch('/auth/change-password', { currentPassword, newPassword });
      }

      await refreshUser();
      setStatus(setup ? 'Profile complete. Welcome to Binary Boppers!' : 'Profile updated.');
      if (setup) {
        navigate(user?.isBoardMember ? '/board' : '/member', { replace: true });
      }
    } catch (error) {
      setStatus(error.response?.data?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell workspace-ui min-h-screen pb-28 pt-[72px] text-white">
      <Navbar />
      {!setup && <BottomDock />}
      <main className="app-container max-w-3xl py-10 sm:px-6">
        <div className="mb-7">
          <p className="app-kicker">
            {setup ? 'One-time account setup' : 'Account settings'}
          </p>
          <h1 className="app-page-title mt-3">
            {setup ? 'Make your profile' : 'My profile'}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {setup
              ? 'Add your society details and replace the demo password to activate your account.'
              : 'Update your member details or change your password.'}
          </p>
        </div>

        {status && (
          <div className="mb-5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="app-panel grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
            <h2 className="font-display flex items-center gap-2 text-lg font-bold text-amber-300 sm:col-span-2">
              <User className="h-5 w-5" /> Profile details
            </h2>
            <label className="text-xs text-zinc-400">
              Full name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </label>
            <label className="text-xs text-zinc-400">
              Year of study
              <select
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              >
                {[1, 2, 3, 4].map((value) => <option key={value} value={value}>Year {value}</option>)}
              </select>
            </label>
            <label className="text-xs text-zinc-400">
              <Phone className="mr-1 inline h-3.5 w-3.5" /> Contact number
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91..."
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </label>
            <label className="text-xs text-zinc-400">
              <Instagram className="mr-1 inline h-3.5 w-3.5" /> Instagram
              <input
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
                placeholder="@your_handle"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </label>
            <label className="text-xs text-zinc-400 sm:col-span-2">
              <Upload className="mr-1 inline h-3.5 w-3.5" /> Profile photo
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setPhoto(event.target.files?.[0] || null)}
                className="mt-1.5 block w-full text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500/20 file:px-3 file:py-2 file:font-semibold file:text-amber-300"
              />
            </label>
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs text-zinc-400">Society domain / role</p>
              <div className="flex flex-wrap gap-2">
                {SOCIETY_ROLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleRole(option.value)}
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      societyRole.includes(option.value)
                        ? 'bg-amber-500 font-semibold text-black'
                        : 'border border-zinc-700 bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="app-panel grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
            <h2 className="font-display flex items-center gap-2 text-lg font-bold text-amber-300 sm:col-span-2">
              <KeyRound className="h-5 w-5" /> {setup ? 'Set your password' : 'Change password'}
            </h2>
            <label className="text-xs text-zinc-400">
              {setup ? 'Demo password' : 'Current password'}
              <input
                type="password"
                required={setup}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </label>
            <label className="text-xs text-zinc-400">
              New password
              <input
                type="password"
                required={setup}
                minLength={6}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </label>
            <label className="text-xs text-zinc-400 sm:col-span-2">
              Confirm new password
              <input
                type="password"
                required={setup}
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500"
              />
            </label>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="app-button-primary w-full py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : setup ? 'Save profile and continue' : 'Save changes'}
          </button>
        </form>
      </main>
    </div>
  );
}
