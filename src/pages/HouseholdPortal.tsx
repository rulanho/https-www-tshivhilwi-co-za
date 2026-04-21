import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Users, CreditCard, FileText, LogOut, MessageSquare, Download, AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { REQUEST_TYPES } from '@/lib/data';
import { generateProofOfAddress, isProofExpired, getExpiryDate } from '@/lib/proof-of-address';
import { toast } from 'sonner';

interface HouseholdData {
  id: string; name: string; contact_person: string; phone: string | null;
  section: string | null; stand_number: string | null; address: string | null;
  join_date: string; status: string; gps_lat: number | null; gps_lng: number | null;
}

function GPSButton({ household, onUpdate }: { household: HouseholdData; onUpdate: () => void }) {
  const [capturing, setCapturing] = useState(false);

  const captureGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setCapturing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { error } = await supabase.from('households').update({
          gps_lat: pos.coords.latitude,
          gps_lng: pos.coords.longitude,
        }).eq('id', household.id);
        setCapturing(false);
        if (error) { toast.error('Failed to save location'); return; }
        toast.success('Location updated successfully');
        onUpdate();
      },
      () => {
        setCapturing(false);
        toast.error('Could not get your location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <Button variant="outline" size="sm" onClick={captureGPS} disabled={capturing}>
      {capturing ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Getting...</> : <><MapPin className="h-3.5 w-3.5 mr-1" />{household.gps_lat ? 'Update Location' : 'Pin Location'}</>}
    </Button>
  );
}

export default function HouseholdPortal() {
  const { user, signOut, profile } = useAuth();
  const [household, setHousehold] = useState<HouseholdData | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [sectionLeaders, setSectionLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ request_type: 'general', subject: '', description: '' });

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    // Find household linked to this user
    const { data: hh } = await supabase
      .from('households')
      .select('*')
      .eq('head_user_id', user!.id)
      .single();

    if (hh) {
      setHousehold(hh);
      const [memRes, payRes, reqRes, leadRes] = await Promise.all([
        supabase.from('members').select('*').eq('household_id', hh.id).order('created_at'),
        supabase.from('payments').select('*').eq('household_id', hh.id).order('created_at', { ascending: false }),
        supabase.from('requests').select('*').eq('household_id', hh.id).order('created_at', { ascending: false }),
        supabase.from('section_leaders').select('section, full_name, phone'),
      ]);
      if (memRes.data) setMembers(memRes.data);
      if (payRes.data) setPayments(payRes.data);
      if (reqRes.data) setRequests(reqRes.data);
      if (leadRes.data) setSectionLeaders(leadRes.data);
    }
    setLoading(false);
  };

  const handleSubmitRequest = async () => {
    if (!household || !requestForm.subject) return;
    const { error } = await supabase.from('requests').insert({
      household_id: household.id,
      request_type: requestForm.request_type,
      subject: requestForm.subject,
      description: requestForm.description || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Request submitted');
    setRequestForm({ request_type: 'general', subject: '', description: '' });
    setRequestOpen(false);
    fetchData();
  };

  const handleDownloadProof = (req: any) => {
    if (!household) return;
    const approvedAt = req.approved_at || req.resolved_at;
    const leader = sectionLeaders.find((l: any) => l.section === household.section);
    generateProofOfAddress({
      householdName: household.name,
      contactPerson: household.contact_person,
      standNumber: household.stand_number || '',
      section: household.section || '',
      address: household.address || '',
      gpsLat: household.gps_lat ?? undefined,
      gpsLng: household.gps_lng ?? undefined,
      approvedAt,
      expiresAt: getExpiryDate(approvedAt),
      requestId: req.id,
      leaderName: leader?.full_name,
      leaderPhone: leader?.phone ?? undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!household) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Household Linked</h2>
            <p className="text-sm text-muted-foreground mb-4">Your account is not linked to any household. Please contact the community admin.</p>
            <Button variant="outline" onClick={signOut}><LogOut className="h-4 w-4 mr-2" />Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const missedPayments = payments.filter(p => p.status === 'missed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground font-display">VillageConnect</h1>
          <p className="text-xs text-sidebar-foreground/60">Household Portal</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-sidebar-foreground">{profile?.full_name || household.contact_person}</span>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-sidebar-foreground/70">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Household Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              {household.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Contact Person:</span> {household.contact_person}</div>
              <div><span className="text-muted-foreground">Phone:</span> {household.phone || '—'}</div>
              <div><span className="text-muted-foreground">Section:</span> {household.section || '—'}</div>
              <div><span className="text-muted-foreground">Stand No:</span> {household.stand_number || '—'}</div>
              <div><span className="text-muted-foreground">Address:</span> {household.address || '—'}</div>
              <div><span className="text-muted-foreground">Joined:</span> {household.join_date}</div>
              <div><span className="text-muted-foreground">Status:</span> <Badge variant={household.status === 'active' ? 'default' : 'secondary'}>{household.status}</Badge></div>
            </div>

            {/* GPS Location Section */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" />Home Location</span>
                <GPSButton household={household} onUpdate={fetchData} />
              </div>
              {household.gps_lat && household.gps_lng ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Coordinates: {household.gps_lat.toFixed(6)}, {household.gps_lng.toFixed(6)}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${household.gps_lat},${household.gps_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={`https://maps.googleapis.com/maps/api/staticmap?center=${household.gps_lat},${household.gps_lng}&zoom=16&size=600x200&markers=color:red%7C${household.gps_lat},${household.gps_lng}&key=&style=feature:all`}
                      alt="Map location"
                      className="w-full h-[150px] object-cover bg-muted"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="bg-muted/50 px-3 py-2 text-xs text-primary flex items-center gap-1">
                      <MapPin className="h-3 w-3" />View on Google Maps
                    </div>
                  </a>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No location pinned yet. Tap the button above to capture your home GPS coordinates.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Members</p>
            <p className="text-2xl font-bold font-display">{members.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-bold font-display">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Payments</p>
            <p className="text-2xl font-bold font-display">{payments.filter(p => p.status === 'paid').length}</p>
          </div>
          <div className={`stat-card ${missedPayments > 0 ? 'border-destructive/30 bg-destructive/5' : ''}`}>
            <p className="text-xs text-muted-foreground">Missed</p>
            <p className="text-2xl font-bold font-display">{missedPayments}</p>
          </div>
        </div>

        <Tabs defaultValue="members">
          <TabsList className="mb-4">
            <TabsTrigger value="members"><Users className="h-4 w-4 mr-1" />Members</TabsTrigger>
            <TabsTrigger value="payments"><CreditCard className="h-4 w-4 mr-1" />Payments</TabsTrigger>
            <TabsTrigger value="requests"><MessageSquare className="h-4 w-4 mr-1" />Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <div className="grid gap-3">
              {members.map(m => (
                <Card key={m.id}>
                  <CardContent className="flex items-center gap-3 py-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={m.profile_picture_url || undefined} />
                      <AvatarFallback>{m.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.relationship || '—'} · {m.date_of_birth ? `DOB: ${m.date_of_birth}` : ''}
                        {m.id_number ? ` · ID: ${m.id_number}` : ''}
                      </p>
                      {(m.phone_1 || m.phone_2 || m.email) && (
                        <p className="text-xs text-muted-foreground">
                          {[m.phone_1, m.phone_2].filter(Boolean).join(' · ')}
                          {m.email ? ` · ${m.email}` : ''}
                        </p>
                      )}
                    </div>
                    <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>{m.status}</Badge>
                  </CardContent>
                </Card>
              ))}
              {members.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No members registered.</p>}
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-muted-foreground">Month</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className="border-b border-border last:border-0">
                          <td className="p-4">{p.payment_month}</td>
                          <td className="p-4">{p.status === 'missed' ? '—' : formatCurrency(Number(p.amount))}</td>
                          <td className="p-4">{p.payment_date || '—'}</td>
                          <td className="p-4 uppercase">{p.payment_method}</td>
                          <td className="p-4">
                            <Badge variant={p.status === 'paid' ? 'default' : p.status === 'missed' ? 'destructive' : 'secondary'}>
                              {p.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            {payments.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No payments recorded.</p>}
          </TabsContent>

          <TabsContent value="requests">
            <div className="flex justify-end mb-4">
              <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><FileText className="h-4 w-4 mr-1" />New Request</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="font-display">Submit Request</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Type</Label>
                      <Select value={requestForm.request_type} onValueChange={v => setRequestForm(f => ({ ...f, request_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {REQUEST_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Subject</Label><Input value={requestForm.subject} onChange={e => setRequestForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description" /></div>
                    <div><Label>Details</Label><Textarea value={requestForm.description} onChange={e => setRequestForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
                    <Button onClick={handleSubmitRequest} className="w-full">Submit</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-3">
              {requests.map((r: any) => {
                const isProof = r.request_type === 'proof_of_address';
                const approvedAt = r.approved_at || r.resolved_at;
                const expired = isProof && r.status === 'approved' && approvedAt ? isProofExpired(approvedAt) : false;
                const canDownload = isProof && r.status === 'approved' && !expired;
                return (
                  <Card key={r.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{r.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {REQUEST_TYPES.find(t => t.value === r.request_type)?.label || r.request_type} · {new Date(r.created_at).toLocaleDateString()}
                          </p>
                          {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
                          {r.admin_notes && (
                            <p className="text-sm mt-2 bg-muted rounded p-2"><span className="font-medium">Response:</span> {r.admin_notes}</p>
                          )}
                          {isProof && r.status === 'approved' && approvedAt && (
                            <p className={`text-xs mt-1 ${expired ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {expired ? `Expired — request a new one` : `Valid until ${new Date(getExpiryDate(approvedAt)).toLocaleDateString('en-ZA')}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {expired && <Badge variant="destructive">Expired</Badge>}
                          <Badge variant={r.status === 'approved' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'}>{r.status}</Badge>
                          {canDownload && (
                            <Button variant="outline" size="sm" onClick={() => handleDownloadProof(r)}>
                              <Download className="h-4 w-4 mr-1" />Proof
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {requests.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No requests yet.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
