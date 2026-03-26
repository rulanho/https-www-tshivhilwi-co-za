import { useState, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, ChevronRight, MapPin, Upload, Camera } from 'lucide-react';
import { getAge, SECTIONS } from '@/lib/data';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Households() {
  const { households, members, addHousehold, addMember, refresh } = useData();
  const [hhOpen, setHhOpen] = useState(false);
  const [memOpen, setMemOpen] = useState(false);
  const [selectedHh, setSelectedHh] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMemberId, setUploadingMemberId] = useState<string | null>(null);

  const [hhForm, setHhForm] = useState({
    name: '', contact_person: '', phone: '', address: '',
    section: '', stand_number: '',
  });
  const [memForm, setMemForm] = useState({
    full_name: '', id_number: '', date_of_birth: '', relationship: '', household_id: '',
    phone_1: '', phone_2: '', email: '',
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  const filtered = households.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.contact_person.toLowerCase().includes(search.toLowerCase()) ||
    (h.section || '').toLowerCase().includes(search.toLowerCase()) ||
    (h.stand_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingLocation(false);
        toast.success('Location captured');
      },
      () => {
        setGettingLocation(false);
        toast.error('Could not get location');
      }
    );
  };

  const handleAddHousehold = () => {
    if (!hhForm.name || !hhForm.contact_person) return;
    addHousehold({
      ...hhForm,
      status: 'active',
      ...(gpsCoords ? { gps_lat: gpsCoords.lat, gps_lng: gpsCoords.lng } : {}),
    } as any);
    setHhForm({ name: '', contact_person: '', phone: '', address: '', section: '', stand_number: '' });
    setGpsCoords(null);
    setHhOpen(false);
  };

  const handleAddMember = () => {
    if (!memForm.full_name || !memForm.household_id) return;
    addMember({
      full_name: memForm.full_name,
      household_id: memForm.household_id,
      id_number: memForm.id_number || undefined,
      date_of_birth: memForm.date_of_birth || undefined,
      relationship: memForm.relationship || undefined,
      status: 'active',
      ...(memForm.phone_1 ? { phone_1: memForm.phone_1 } : {}),
      ...(memForm.phone_2 ? { phone_2: memForm.phone_2 } : {}),
      ...(memForm.email ? { email: memForm.email } : {}),
    } as any);
    setMemForm({ full_name: '', id_number: '', date_of_birth: '', relationship: '', household_id: '', phone_1: '', phone_2: '', email: '' });
    setMemOpen(false);
  };

  const handleProfilePicUpload = async (memberId: string, file: File) => {
    setUploadingMemberId(memberId);
    const ext = file.name.split('.').pop();
    const path = `${memberId}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('profile-pictures').upload(path, file, { upsert: true });
    if (uploadError) { toast.error(uploadError.message); setUploadingMemberId(null); return; }
    const { data: urlData } = supabase.storage.from('profile-pictures').getPublicUrl(path);
    await supabase.from('members').update({ profile_picture_url: urlData.publicUrl } as any).eq('id', memberId);
    toast.success('Profile picture updated');
    setUploadingMemberId(null);
    refresh();
  };

  const viewHousehold = selectedHh ? households.find(h => h.id === selectedHh) : null;
  const viewMembers = selectedHh ? members.filter(m => m.household_id === selectedHh) : [];

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Households</h1>
          <p className="page-subtitle">Tshivhilwi Village — Manage registered households and members</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={memOpen} onOpenChange={setMemOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Add Member</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display">Add Member</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Household</Label>
                  <Select onValueChange={v => setMemForm(f => ({ ...f, household_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select household" /></SelectTrigger>
                    <SelectContent>
                      {households.filter(h => h.status === 'active').map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Full Name</Label><Input value={memForm.full_name} onChange={e => setMemForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                <div><Label>ID Number</Label><Input value={memForm.id_number} onChange={e => setMemForm(f => ({ ...f, id_number: e.target.value }))} /></div>
                <div><Label>Date of Birth</Label><Input type="date" value={memForm.date_of_birth} onChange={e => setMemForm(f => ({ ...f, date_of_birth: e.target.value }))} /></div>
                <div>
                  <Label>Relationship</Label>
                  <Select onValueChange={v => setMemForm(f => ({ ...f, relationship: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['Head', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'].map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Phone 1 (optional)</Label><Input value={memForm.phone_1} onChange={e => setMemForm(f => ({ ...f, phone_1: e.target.value }))} placeholder="e.g. 071 234 5678" /></div>
                <div><Label>Phone 2 (optional)</Label><Input value={memForm.phone_2} onChange={e => setMemForm(f => ({ ...f, phone_2: e.target.value }))} placeholder="e.g. 082 345 6789" /></div>
                <div><Label>Email (optional)</Label><Input type="email" value={memForm.email} onChange={e => setMemForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. name@mail.com" /></div>
                <Button onClick={handleAddMember} className="w-full">Add Member</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={hhOpen} onOpenChange={setHhOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Household</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display">Register Household</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Household Name</Label><Input value={hhForm.name} onChange={e => setHhForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mokoena Family" /></div>
                <div><Label>Contact Person</Label><Input value={hhForm.contact_person} onChange={e => setHhForm(f => ({ ...f, contact_person: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={hhForm.phone} onChange={e => setHhForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div>
                  <Label>Section</Label>
                  <Select onValueChange={v => setHhForm(f => ({ ...f, section: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                    <SelectContent>
                      {SECTIONS.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Stand Number</Label><Input value={hhForm.stand_number} onChange={e => setHhForm(f => ({ ...f, stand_number: e.target.value }))} placeholder="e.g. Stand 45" /></div>
                <div><Label>Address</Label><Input value={hhForm.address} onChange={e => setHhForm(f => ({ ...f, address: e.target.value }))} /></div>
                <div>
                  <Label>GPS Location</Label>
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleGetLocation} disabled={gettingLocation}>
                    <MapPin className="h-4 w-4 mr-1" />
                    {gettingLocation ? 'Getting location...' : gpsCoords ? `${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lng.toFixed(5)}` : 'Pin Location'}
                  </Button>
                </div>
                <Button onClick={handleAddHousehold} className="w-full">Register</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Input placeholder="Search by name, section, or stand..." value={search} onChange={e => setSearch(e.target.value)} className="mb-6 max-w-sm" />

      {selectedHh && viewHousehold ? (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedHh(null)} className="mb-4">← Back to list</Button>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display">{viewHousehold.name}</CardTitle>
                <Badge variant={viewHousehold.status === 'active' ? 'default' : 'secondary'}>{viewHousehold.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Contact:</span> {viewHousehold.contact_person}</div>
                <div><span className="text-muted-foreground">Phone:</span> {viewHousehold.phone}</div>
                <div><span className="text-muted-foreground">Section:</span> {(viewHousehold as any).section || '—'}</div>
                <div><span className="text-muted-foreground">Stand No:</span> {(viewHousehold as any).stand_number || '—'}</div>
                <div><span className="text-muted-foreground">Address:</span> {viewHousehold.address}</div>
                <div><span className="text-muted-foreground">Joined:</span> {viewHousehold.join_date}</div>
                {(viewHousehold as any).gps_lat && (
                  <div className="col-span-2"><span className="text-muted-foreground">GPS:</span> {(viewHousehold as any).gps_lat?.toFixed(5)}, {(viewHousehold as any).gps_lng?.toFixed(5)}</div>
                )}
              </div>
            </CardContent>
          </Card>
          <h3 className="text-lg font-semibold mb-3 font-display">Members ({viewMembers.length})</h3>
          <div className="grid gap-3">
            {viewMembers.map(m => {
              const mem = m as any;
              return (
                <Card key={m.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={mem.profile_picture_url || undefined} />
                          <AvatarFallback>{m.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <button
                          className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-80"
                          onClick={() => {
                            setUploadingMemberId(m.id);
                            fileInputRef.current?.click();
                          }}
                        >
                          <Camera className="h-3 w-3" />
                        </button>
                      </div>
                      <div>
                        <p className="font-medium">{m.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.relationship} · {m.date_of_birth ? `Age ${getAge(m.date_of_birth)}` : ''} · ID: {m.id_number}
                        </p>
                        {(mem.phone_1 || mem.phone_2 || mem.email) && (
                          <p className="text-xs text-muted-foreground">
                            {[mem.phone_1, mem.phone_2].filter(Boolean).join(' · ')}
                            {mem.email ? ` · ${mem.email}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>{m.status}</Badge>
                  </CardContent>
                </Card>
              );
            })}
            {viewMembers.length === 0 && <p className="text-muted-foreground text-sm">No members registered yet.</p>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && uploadingMemberId) handleProfilePicUpload(uploadingMemberId, file);
              e.target.value = '';
            }}
          />
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(h => {
            const hh = h as any;
            const memberCount = members.filter(m => m.household_id === h.id).length;
            return (
              <Card key={h.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedHh(h.id)}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{h.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.contact_person} · {memberCount} members · {hh.section || 'No section'} · Stand: {hh.stand_number || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={h.status === 'active' ? 'default' : 'secondary'}>{h.status}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
