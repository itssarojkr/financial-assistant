import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Mail, Calendar, Edit, Save, X, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileProps {
  onClose?: () => void;
}

interface UserProfileData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
      } else {
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await updateProfile({
        first_name: firstName,
        last_name: lastName,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Profile updated successfully');
        setEditing(false);
        await loadProfile(); // Reload profile data
      }
    } catch (err: unknown) {
      const message = (typeof err === 'object' && err && 'message' in err) ? (err as { message?: string }).message : undefined;
      setError(message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      const message = (typeof err === 'object' && err && 'message' in err) ? (err as { message?: string }).message : undefined;
      setError(message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    setAvatarUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;
      // Update profile
      const { error: updateError } = await updateProfile({ avatar_url: avatarUrl });
      if (updateError) throw updateError;
      setSuccess('Avatar updated successfully');
      await loadProfile();
    } catch (err: unknown) {
      const message = (typeof err === 'object' && err && 'message' in err) ? (err as { message?: string }).message : undefined;
      setError(message || 'Failed to update avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    if (first || last) return first + last;
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account information and preferences</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={user?.email || 'User avatar'} loading="lazy" />
              <AvatarFallback className="text-lg">
                {(getInitials(firstName ?? undefined, lastName ?? undefined) || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : 'User'}
              </h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-label="Upload avatar"
                  disabled={avatarUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  aria-label="Change avatar"
                  className="min-w-[44px] min-h-[44px] mt-2"
                >
                  {avatarUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><Upload className="h-4 w-4 mr-1" />Change Avatar</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!editing || saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!editing || saving}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            {editing ? (
              <>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  size="sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFirstName(profile?.first_name || '');
                    setLastName(profile?.last_name || '');
                  }}
                  disabled={saving}
                  size="sm"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Account Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Account Information</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Member since</p>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Change Password */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Change Password</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={saving}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={saving}
                placeholder="Confirm new password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={saving || !newPassword || !confirmPassword}
              size="sm"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 