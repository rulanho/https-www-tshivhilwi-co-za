import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MessageSquare, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { REQUEST_TYPES } from '@/lib/data';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function Requests() {
  const { households, members, requests, addRequest, updateRequestStatus, refresh } = useData();
  const { roles } = useAuth();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const isAdmin = roles.includes('admin') || roles.includes('secretary');

  const [form, setForm] = useState({
    household_id: '', member_id: '', request_type: 'general', subject: '', description: '',
  });

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const handleAdd = () => {
    if (!form.household_id || !form.subject) return;
    addRequest({
      household_id: form.household_id,
      member_id: form.member_id || undefined,
      request_type: form.request_type,
      subject: form.subject,
      description: form.description || undefined,
    } as any);
    setForm({ household_id: '', member_id: '', request_type: 'general', subject: '', description: '' });
    setOpen(false);
  };

  const handleResolve = async (id: string, status: 'approved' | 'rejected') => {
    await updateRequestStatus(id, status, adminNotes);
    setAdminNotes('');
    setSelectedRequest(null);
  };

  const statusIcon = (s: string) => {
    if (s === 'approved') return <CheckCircle className="h-4 w-4 text-primary" />;
    if (s === 'rejected') return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const statusVariant = (s: string) => {
    if (s === 'approved') return 'default' as const;
    if (s === 'rejected') return 'destructive' as const;
    return 'secondary' as const;
  };

  const requestTypeLabel = (type: string) =>
    REQUEST_TYPES.find(r => r.value === type)?.label || type;

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Requests</h1>
          <p className="page-subtitle">Proof of address, stand approvals, and community issues</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Request</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">Submit Request</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Household</Label>
                <Select onValueChange={v => setForm(f => ({ ...f, household_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select household" /></SelectTrigger>
                  <SelectContent>
                    {households.filter(h => h.status === 'active').map(h => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Request Type</Label>
                <Select value={form.request_type} onValueChange={v => setForm(f => ({ ...f, request_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Member (optional)</Label>
                <Select onValueChange={v => setForm(f => ({ ...f, member_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>
                    {form.household_id
                      ? members.filter(m => m.household_id === form.household_id).map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                        ))
                      : <SelectItem value="none" disabled>Select household first</SelectItem>
                    }
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of your request" /></div>
              <div><Label>Details</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Provide additional details..." /></div>
              <Button onClick={handleAdd} className="w-full">Submit Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className="capitalize">
            {s}
          </Button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map(r => {
          const req = r as any;
          const hh = households.find(h => h.id === req.household_id);
          const mem = req.member_id ? members.find(m => m.id === req.member_id) : null;
          return (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {req.request_type === 'proof_of_address' ? <FileText className="h-5 w-5 text-primary" /> : <MessageSquare className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium">{req.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {hh?.name || 'Unknown'} {mem ? `· ${mem.full_name}` : ''} · {requestTypeLabel(req.request_type)}
                      </p>
                      {req.description && <p className="text-sm text-muted-foreground mt-1">{req.description}</p>}
                      {req.admin_notes && (
                        <p className="text-sm mt-2 bg-muted rounded p-2">
                          <span className="font-medium">Response:</span> {req.admin_notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(req.status)}>{req.status}</Badge>
                    {isAdmin && req.status === 'pending' && (
                      <Dialog open={selectedRequest === req.id} onOpenChange={(o) => { if (!o) setSelectedRequest(null); else setSelectedRequest(req.id); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Respond</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Respond to Request</DialogTitle></DialogHeader>
                          <div className="space-y-3">
                            <div className="bg-muted rounded-lg p-3 text-sm">
                              <p className="font-medium">{req.subject}</p>
                              <p className="text-muted-foreground">{req.description}</p>
                            </div>
                            <div>
                              <Label>Admin Notes</Label>
                              <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} placeholder="Add response notes..." />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => handleResolve(req.id, 'approved')} className="flex-1">Approve</Button>
                              <Button variant="destructive" onClick={() => handleResolve(req.id, 'rejected')} className="flex-1">Reject</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No requests found.</p>}
      </div>
    </div>
  );
}
