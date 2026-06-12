import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
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

const graphqlBadge = (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
    <svg className="h-3.5 w-3.5" viewBox="0 0 400 400" fill="currentColor" aria-hidden="true">
      <path d="M57.47 302.66l-14.38-8.3 118.34-204.94 14.38 8.3zM39.8 272.2h239.4v16.6H39.8zm317.87-18.32l-118.34-204.94 14.38-8.3 118.34 204.94zM120.63 24.47l239.4 138.2-8.3 14.38-239.4-138.2zm-8.3 329.06l-14.38-8.3 239.4-138.2 8.3 14.38zm8.3-14.38l8.3-14.38 239.4 138.2-8.3 14.38z" />
    </svg>
    GraphQL
  </span>
);

interface ProfileFieldProps {
  label: string;
  value: string;
}

function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-2.5 text-sm">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="text-slate-900">{value}</dd>
    </div>
  );
}

export default function UserProfile() {
  const { user } = useAuth();
  const keycloakId = user?.id;
  const [profile, setProfile] = useState<User | null>(null);
  const [view, setView] = useState<ProfileView>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!keycloakId) return;
    fetchUserByKeycloakId(keycloakId)
      .then((data) => {
        if (data) {
          setProfile(data);
          setPhone(data.phone ?? '');
          setDefaultAddress(data.defaultAddress ?? '');
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
    return (
      <div className="mx-auto max-w-2xl">
        <LoadingState title="Loading profile" message="Fetching your profile data." />
      </div>
    );
  }

  if (view === 'error') {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState
          message={errorMsg}
          action={
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const handleCreate = () => {
    if (!user) return;
    setSaving(true);
    setErrorMsg('');
    createUserProfile({
      keycloakId: user.id,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    })
      .then((created) => {
        setProfile(created);
        setPhone(created.phone ?? '');
        setDefaultAddress(created.defaultAddress ?? '');
        setView('view');
      })
      .catch(() => {
        setErrorMsg('Failed to create profile.');
      })
      .finally(() => setSaving(false));
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);
    updateUserProfile(profile.id, { phone, defaultAddress })
      .then((updated) => {
        setProfile(updated);
        setSaveSuccess(true);
        setView('view');
      })
      .catch(() => setErrorMsg('Failed to update profile.'))
      .finally(() => setSaving(false));
  };

  if (view === 'no-profile') {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Create Your Profile">{graphqlBadge}</PageHeader>

        <Card className="mt-6">
          <CardHeader>
            <p className="text-sm text-slate-500">
              No profile exists yet. Create one from your account details.
            </p>
          </CardHeader>

          <dl className="divide-y divide-slate-100">
            <ProfileField
              label="Full name"
              value={user ? `${user.firstName} ${user.lastName}`.trim() : '\u2014'}
            />
            <ProfileField label="Email" value={user?.email ?? '\u2014'} />
          </dl>

          {errorMsg && (
            <p className="mt-4 text-sm font-medium text-red-700" role="alert">{errorMsg}</p>
          )}

          <div className="mt-6">
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create profile'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isEditing = view === 'edit';

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={profile?.fullName ?? 'My Profile'}>{graphqlBadge}</PageHeader>

      <Card className="mt-6">
        <CardHeader>
          <p className="text-sm text-slate-500">
            Profile managed via GraphQL &middot; user-service
          </p>
        </CardHeader>

        {saveSuccess && (
          <div
            className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
            role="status"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Profile updated successfully.
          </div>
        )}

        {errorMsg && (
          <p className="mb-4 text-sm font-medium text-red-700" role="alert">{errorMsg}</p>
        )}

        {!isEditing ? (
          <>
            <dl className="divide-y divide-slate-100">
              <ProfileField label="Email" value={profile?.email ?? '\u2014'} />
              <ProfileField label="Phone" value={profile?.phone ?? '\u2014'} />
              <ProfileField label="Default address" value={profile?.defaultAddress ?? '\u2014'} />
            </dl>
            <div className="mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setSaveSuccess(false);
                  setView('edit');
                }}
              >
                Edit profile
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="grid gap-4">
            <Input
              label="Phone"
              name="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Default address"
              name="profile-address"
              type="text"
              value={defaultAddress}
              onChange={(e) => setDefaultAddress(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setPhone(profile?.phone ?? '');
                  setDefaultAddress(profile?.defaultAddress ?? '');
                  setErrorMsg('');
                  setView('view');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
