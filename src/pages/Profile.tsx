import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Enums } from '@/integrations/supabase/types';

export default function Profile() {
  const { profile, roles, user, hasRole } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  // Admin: assign roles
  const [assignEmail, setAssignEmail] = useState('');
  const [assignRole, setAssignRole] = useState<Enums<'app_role'>>('secretary');

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('user_id', user.id);
    if (error) toast.error(error.message);
    else toast.success('Profile updated');
    setSaving(false);
  };

  const handleAssignRole = async () => {
    if (!assignEmail) return;
    // Look up user by email in profiles
    const { data: profiles } = await supabase.from('profiles').select('user_id, full_name').ilike('full_name', `%${assignEmail}%`);
    if (!profiles || profiles.length === 0) {
      toast.error('No user found matching that name');
      return;
    }
    const targetUserId = profiles[0].user_id;
    const { error } = await supabase.from('user_roles').insert({ user_id: targetUserId, role: assignRole });
    if (error) {
      if (error.message.includes('duplicate')) toast.error('User already has this role');
      else toast.error(error.message);
    } else {
      toast.success(`Role "${assignRole}" assigned to ${profiles[0].full_name}`);
      setAssignEmail('');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your profile and account</p>
      </div>

      <div className="grid gap-6 max-w-lg">
        <Card>
          <CardHeader><CardTitle className="font-display">Your Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>Roles</Label>
              <div className="flex gap-2 mt-1">
                {roles.length === 0 ? (
                  <Badge variant="secondary">No roles assigned</Badge>
                ) : roles.map(r => (
                  <Badge key={r} variant="default" className="capitalize">{r}</Badge>
                ))}
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        {hasRole('admin') && (
          <Card>
            <CardHeader><CardTitle className="font-display">Assign Roles</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>User Name (search)</Label>
                <Input value={assignEmail} onChange={e => setAssignEmail(e.target.value)} placeholder="Search by name..." />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  value={assignRole}
                  onChange={e => setAssignRole(e.target.value as Enums<'app_role'>)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="secretary">Secretary</option>
                </select>
              </div>
              <Button onClick={handleAssignRole} variant="outline" className="w-full">Assign Role</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
