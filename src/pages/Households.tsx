import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, ChevronRight } from 'lucide-react';
import { getAge } from '@/lib/data';

export default function Households() {
  const { households, members, addHousehold, addMember } = useData();
  const [hhOpen, setHhOpen] = useState(false);
  const [memOpen, setMemOpen] = useState(false);
  const [selectedHh, setSelectedHh] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [hhForm, setHhForm] = useState({ name: '', contact_person: '', phone: '', address: '' });
  const [memForm, setMemForm] = useState({ full_name: '', id_number: '', date_of_birth: '', relationship: '', household_id: '' });

  const filtered = households.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.contact_person.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddHousehold = () => {
    if (!hhForm.name || !hhForm.contact_person) return;
    addHousehold({ ...hhForm, status: 'active' });
    setHhForm({ name: '', contact_person: '', phone: '', address: '' });
    setHhOpen(false);
  };

  const handleAddMember = () => {
    if (!memForm.full_name || !memForm.household_id) return;
    addMember({ ...memForm, status: 'active' });
    setMemForm({ full_name: '', id_number: '', date_of_birth: '', relationship: '', household_id: '' });
    setMemOpen(false);
  };

  const viewHousehold = selectedHh ? households.find(h => h.id === selectedHh) : null;
  const viewMembers = selectedHh ? members.filter(m => m.household_id === selectedHh) : [];

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Households</h1>
          <p className="page-subtitle">Manage registered households and members</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={memOpen} onOpenChange={setMemOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Add Member</Button>
            </DialogTrigger>
            <DialogContent>
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
                <Button onClick={handleAddMember} className="w-full">Add Member</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={hhOpen} onOpenChange={setHhOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Household</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Register Household</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Household Name</Label><Input value={hhForm.name} onChange={e => setHhForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mokoena Family" /></div>
                <div><Label>Contact Person</Label><Input value={hhForm.contact_person} onChange={e => setHhForm(f => ({ ...f, contact_person: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={hhForm.phone} onChange={e => setHhForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div><Label>Address</Label><Input value={hhForm.address} onChange={e => setHhForm(f => ({ ...f, address: e.target.value }))} /></div>
                <Button onClick={handleAddHousehold} className="w-full">Register</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Input placeholder="Search households..." value={search} onChange={e => setSearch(e.target.value)} className="mb-6 max-w-sm" />

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
                <div><span className="text-muted-foreground">Address:</span> {viewHousehold.address}</div>
                <div><span className="text-muted-foreground">Joined:</span> {viewHousehold.join_date}</div>
              </div>
            </CardContent>
          </Card>
          <h3 className="text-lg font-semibold mb-3 font-display">Members ({viewMembers.length})</h3>
          <div className="grid gap-3">
            {viewMembers.map(m => (
              <Card key={m.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{m.full_name}</p>
                    <p className="text-xs text-muted-foreground">{m.relationship} · {m.date_of_birth ? `Age ${getAge(m.date_of_birth)}` : ''} · ID: {m.id_number}</p>
                  </div>
                  <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>{m.status}</Badge>
                </CardContent>
              </Card>
            ))}
            {viewMembers.length === 0 && <p className="text-muted-foreground text-sm">No members registered yet.</p>}
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(h => {
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
                      <p className="text-xs text-muted-foreground">{h.contact_person} · {memberCount} members · Joined {h.join_date}</p>
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
