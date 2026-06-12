import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../context/useAuth';
import {
  createUserProfile,
  fetchUserByKeycloakId,
  updateUserProfile,
} from '../../api/userQueries';
import type { User } from '../../types/user';

type ProfileView = 'loading' | 'no-profile' | 'view' | 'edit' | 'error';

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
      {initials || '?'}
    </div>
  );
}

export default function UserProfile() {
  const { user } = useAuth();
  const keycloakId = user?.id;
  const [profile, setProfile] = useState<User | null>(null);
  const [view, setView] = useState<ProfileView>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const syncForm = (u: User) => {
    setFullName(u.fullName ?? '');
    setEmail(u.email ?? '');
    setPhone(u.phone ?? '');
    setDefaultAddress(u.defaultAddress ?? '');
  };

  useEffect(() => {
    if (!keycloakId) return;
    fetchUserByKeycloakId(keycloakId)
      .then((data) => {
        if (data) {
          setProfile(data);
          syncForm(data);
          setView('view');
        } else {
          setView('no-profile');
        }
      })
      .catch(() => {
        setErrorMsg('Failed to load profile.');
        setView('error');
      });
  }, [keycloakId, reloadKey]);

  const retry = () => {
    setErrorMsg('');
    setView('loading');
    setReloadKey((k) => k + 1);
  };

  if (view === 'loading') {
    return <LoadingState title="Loading profile" message="Fetching your account details." />;
  }

  if (view === 'error') {
    return (
      <ErrorState
        message={errorMsg}
        action={<Button variant="secondary" onClick={retry}>Try again</Button>}
      />
    );
  }

  const handleCreate = async () => {
    if (!user) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const created = await createUserProfile({
        keycloakId: user.id,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
      });
      setProfile(created);
      syncForm(created);
      setView('view');
    } catch {
      const existing = await fetchUserByKeycloakId(user.id).catch(() => null);
      if (existing) {
        setProfile(existing);
        syncForm(existing);
        setView('view');
      } else {
        setErrorMsg('Failed to save profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);
    updateUserProfile(profile.id, { fullName, email, phone, defaultAddress })
      .then((updated) => {
        setProfile(updated);
        syncForm(updated);
        setSaveSuccess(true);
        setView('view');
      })
      .catch(() => setErrorMsg('Failed to update profile.'))
      .finally(() => setSaving(false));
  };

  if (view === 'no-profile') {
    const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
    return (
      <div>
        <PageHeader title="Complete Your Profile" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="flex flex-col items-center py-8 text-center">
            <UserAvatar name={displayName} />
            <p className="mt-3 text-lg font-semibold text-slate-900">{displayName}</p>
            <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
          </Card>
          <Card>
            <h2 className="text-base font-semibold text-slate-900">Account details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Confirm your details to finish setting up your account.
            </p>

            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              <div className="grid grid-cols-[120px_1fr] gap-2 py-2.5">
                <dt className="text-slate-400">Name</dt>
                <dd className="text-slate-900">{displayName || '\u2014'}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2 py-2.5">
                <dt className="text-slate-400">Email</dt>
                <dd className="text-slate-900">{user?.email ?? '\u2014'}</dd>
              </div>
            </dl>

            {errorMsg && (
              <p className="mt-4 text-sm font-medium text-red-700" role="alert">{errorMsg}</p>
            )}

            <div className="mt-6">
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? 'Saving\u2026' : 'Confirm & continue'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const isEditing = view === 'edit';
  const displayName = profile?.fullName ?? 'Account';
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div>
      <PageHeader title="My Account" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left: identity card */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center py-8 text-center">
            <UserAvatar name={displayName} />
            <p className="mt-3 text-lg font-semibold text-slate-900">{displayName}</p>
            <p className="mt-1 text-sm text-slate-500">{profile?.email}</p>
            {memberSince && (
              <p className="mt-3 text-xs text-slate-400">Member since {memberSince}</p>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900">Account ID</h3>
            <p className="mt-1 break-all font-mono text-xs text-slate-400">{profile?.id}</p>
          </Card>
        </div>

        {/* Right: profile details or edit form */}
        <div className="space-y-6">
          {saveSuccess && (
            <div
              className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
              role="status"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Profile updated successfully.
            </div>
          )}

          {errorMsg && (
            <p className="text-sm font-medium text-red-700" role="alert">{errorMsg}</p>
          )}

          {!isEditing ? (
            <>
              <Card>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Personal information</h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setSaveSuccess(false); setView('edit'); }}
                  >
                    Edit
                  </Button>
                </div>
                <dl className="mt-4 divide-y divide-slate-100 text-sm">
                  <div className="grid grid-cols-[120px_1fr] gap-2 py-2.5">
                    <dt className="text-slate-400">Full name</dt>
                    <dd className="text-slate-900">{profile?.fullName ?? '\u2014'}</dd>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2 py-2.5">
                    <dt className="text-slate-400">Email</dt>
                    <dd className="text-slate-900">{profile?.email ?? '\u2014'}</dd>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2 py-2.5">
                    <dt className="text-slate-400">Phone</dt>
                    <dd className="text-slate-900">{profile?.phone || '\u2014'}</dd>
                  </div>
                </dl>
              </Card>

              <Card>
                <h2 className="text-base font-semibold text-slate-900">Delivery preferences</h2>
                <dl className="mt-4 divide-y divide-slate-100 text-sm">
                  <div className="grid grid-cols-[120px_1fr] gap-2 py-2.5">
                    <dt className="text-slate-400">Address</dt>
                    <dd className="text-slate-900">{profile?.defaultAddress || '\u2014'}</dd>
                  </div>
                </dl>
              </Card>
            </>
          ) : (
            <Card>
              <h2 className="text-base font-semibold text-slate-900">Edit profile</h2>
              <form onSubmit={handleSave} className="mt-4 grid gap-4">
                <Input label="Full name" name="profile-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <Input label="Email" name="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Phone" name="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input label="Default address" name="profile-address" value={defaultAddress} onChange={(e) => setDefaultAddress(e.target.value)} />
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving\u2026' : 'Save changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { if (profile) syncForm(profile); setErrorMsg(''); setView('view'); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
