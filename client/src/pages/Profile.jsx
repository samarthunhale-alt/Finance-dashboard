import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { usersApi } from '../services/endpoints.js';
import { getErrorMessage } from '../services/api.js';
import { CURRENCIES } from '../utils/constants.js';
import { formatDate } from '../utils/format.js';
import { Alert, Field, PageHeader, Spinner } from '../components/ui.jsx';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: user.name, currency: user.currency });
  const [profileError, setProfileError] = useState('');
  const [profileBusy, setProfileBusy] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    if (profile.name.trim().length < 2) return setProfileError('Name must be at least 2 characters');
    setProfileBusy(true);
    try {
      const res = await usersApi.updateMe({ name: profile.name.trim(), currency: profile.currency });
      setUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setProfileBusy(false);
    }
    return undefined;
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(pw.newPassword)) return setPwError('New password needs 8 or more characters with a letter and a number');
    if (pw.newPassword !== pw.confirm) return setPwError('New passwords do not match');
    setPwBusy(true);
    try {
      await usersApi.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwError(getErrorMessage(err));
    } finally {
      setPwBusy(false);
    }
    return undefined;
  };

  return (
    <>
      <PageHeader title="Profile" description="Your account details and preferences." />
      <div className="grid max-w-3xl gap-6">
        <section className="card p-6">
          <dl className="mb-6 grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="text-ink-soft">Email</dt><dd className="mt-0.5 break-all font-medium">{user.email}</dd></div>
            <div><dt className="text-ink-soft">Role</dt><dd className="mt-0.5 font-medium capitalize">{user.role}</dd></div>
            <div><dt className="text-ink-soft">Member since</dt><dd className="mt-0.5 font-medium">{formatDate(user.createdAt)}</dd></div>
          </dl>
          <form onSubmit={saveProfile} className="space-y-4" noValidate>
            {profileError && <Alert>{profileError}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="p-name"><input id="p-name" className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field>
              <Field label="Currency" htmlFor="p-currency">
                <select id="p-currency" className="input" value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value })}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <button type="submit" className="btn-primary" disabled={profileBusy}>{profileBusy && <Spinner className="h-4 w-4 text-white" />} Save profile</button>
          </form>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold">Change password</h2>
          <form onSubmit={savePassword} className="space-y-4" noValidate>
            {pwError && <Alert>{pwError}</Alert>}
            <Field label="Current password" htmlFor="pw-current"><input id="pw-current" type="password" autoComplete="current-password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" htmlFor="pw-new"><input id="pw-new" type="password" autoComplete="new-password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
              <Field label="Confirm new password" htmlFor="pw-confirm"><input id="pw-confirm" type="password" autoComplete="new-password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
            </div>
            <button type="submit" className="btn-primary" disabled={pwBusy}>{pwBusy && <Spinner className="h-4 w-4 text-white" />} Update password</button>
          </form>
        </section>

        <section className="card flex items-center justify-between p-6">
          <div><h2 className="font-semibold">Log out</h2><p className="text-sm text-ink-soft">End your session on this device.</p></div>
          <button type="button" className="btn-secondary" onClick={async () => { await logout(); navigate('/login'); }}>Log out</button>
        </section>
      </div>
    </>
  );
}
