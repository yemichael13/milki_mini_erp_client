import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { MdLogout } from "react-icons/md";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage(''); setError('');
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match.'); return; }
    if (form.newPassword.length < 8) { setError('New password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMessage('Password changed successfully. Please sign in again.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(async () => { await logout(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password.');
    } finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-2">
      <div><h1 className="text-3xl font-bold text-slate-900">Profile</h1><p className="mt-1 text-sm text-slate-500">Manage your account details and password.</p></div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Account information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><div className="text-xs uppercase tracking-wide text-slate-500">Name</div><div className="mt-1 text-sm text-slate-900">{user?.full_name || '-'}</div></div><div><div className="text-xs uppercase tracking-wide text-slate-500">Email</div><div className="mt-1 text-sm text-slate-900">{user?.email || '-'}</div></div><div><div className="text-xs uppercase tracking-wide text-slate-500">Role</div><div className="mt-1 text-sm capitalize text-slate-900">{user?.role?.replaceAll('_', ' ') || '-'}</div></div></div>
      </section>
      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-slate-900">Account actions</h2><p className="mt-1 text-sm text-slate-500">Sign out of this Milki Mini ERP session.</p><button type="button" onClick={handleLogout} className="mt-4 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 flex gap-2"><MdLogout />Logout</button></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-slate-900">Change password</h2><p className="mt-1 text-sm text-slate-500">Changing your password signs out existing refresh sessions.</p><form onSubmit={submit} className="mt-5 max-w-xl space-y-4"><input className="w-full rounded-xl border border-slate-300 px-3 py-3" type="password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} placeholder="Current password" /><input className="w-full rounded-xl border border-slate-300 px-3 py-3" type="password" minLength="8" maxLength="128" required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="New password" /><input className="w-full rounded-xl border border-slate-300 px-3 py-3" type="password" minLength="8" maxLength="128" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirm new password" />{message && <p className="text-sm text-emerald-700">{message}</p>}{error && <p className="text-sm text-red-700">{error}</p>}<button disabled={saving} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : 'Change password'}</button></form></section>
    </div>
  );
};

export default Profile;
