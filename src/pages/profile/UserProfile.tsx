import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../context/useAuth';
import {
  createUserProfile,
  fetchUserByKeycloakId,
  updateUserProfile,
} from '../../api/userQueries';
import type { User } from '../../types/user';

export default function UserProfile() {
  const { user } = useAuth();
  const keycloakId = user?.id;
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!keycloakId) return;
    fetchUserByKeycloakId(keycloakId)
      .then((data) => {
        setProfile(data);
        setPhone(data?.phone ?? '');
        setDefaultAddress(data?.defaultAddress ?? '');
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [keycloakId]);

  if (loading) return <p className="mx-auto max-w-2xl px-4 py-8 text-gray-600">Loading profile...</p>;

  const createProfile = () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    createUserProfile({
      keycloakId: user.id,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    })
      .then((created) => {
        setProfile(created);
        setPhone(created.phone ?? '');
        setDefaultAddress(created.defaultAddress ?? '');
      })
      .catch(() => setError('Failed to create profile.'))
      .finally(() => setSaving(false));
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    updateUserProfile(profile.id, { phone, defaultAddress })
      .then((updated) => {
        setProfile(updated);
        setSaved(true);
      })
      .catch(() => setError('Failed to update profile.'))
      .finally(() => setSaving(false));
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
          GraphQL
        </span>
      </div>
      {error && <p className="mt-4 text-red-700">{error}</p>}
      {!profile ? (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-gray-600">No profile exists yet. Create one from your account details:</p>
          <dl className="mt-4 grid gap-2 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Full name</dt>
              <dd>{user && `${user.firstName} ${user.lastName}`.trim()}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Email</dt>
              <dd>{user?.email}</dd>
            </div>
          </dl>
          <button
            onClick={createProfile}
            disabled={saving}
            className="mt-6 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create profile'}
          </button>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Full name</dt>
              <dd>{profile.fullName}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Phone</dt>
              <dd>{profile.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Default address</dt>
              <dd>{profile.defaultAddress ?? '—'}</dd>
            </div>
          </dl>
          <form onSubmit={saveProfile} className="mt-6 grid gap-4 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold">Edit profile</h2>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-gray-700">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-gray-700">Default address</span>
              <input
                type="text"
                value={defaultAddress}
                onChange={(event) => setDefaultAddress(event.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
              />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              {saved && <span className="text-sm text-green-700">Profile updated.</span>}
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
