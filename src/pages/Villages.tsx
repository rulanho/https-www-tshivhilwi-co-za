import { useState } from 'react';
import { useVillage } from '@/contexts/VillageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Globe, MapPin, Users, Plus, Crown, Building2, UserPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Villages() {
  const { villages, setCurrentVillageId, refresh } = useVillage();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [browseOpen, setBrowseOpen] = useState(false);
  const [allVillages, setAllVillages] = useState<any[]>([]);
  const [browseSearch, setBrowseSearch] = useState('');
  const [joinDialog, setJoinDialog] = useState<{ village: any } | null>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [joining, setJoining] = useState(false);

  const filtered = villages.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.district.toLowerCase().includes(search.toLowerCase()) ||
    v.municipality.toLowerCase().includes(search.toLowerCase())
  );

  const handleBrowse = async () => {
    const { data } = await supabase.from('villages').select('*').eq('status', 'active').order('name');
    if (data) setAllVillages(data);
    setBrowseOpen(true);
  };

  const browsedFiltered = allVillages.filter(v =>
    v.name.toLowerCase().includes(browseSearch.toLowerCase()) ||
    v.district.toLowerCase().includes(browseSearch.toLowerCase()) ||
    v.municipality.toLowerCase().includes(browseSearch.toLowerCase())
  );

  const myVillageIds = new Set(villages.map(v => v.id));

  const handleJoinRequest = async () => {
    if (!joinDialog || !user) return;
    setJoining(true);
    const { error } = await supabase.from('village_join_requests').insert({
      user_id: user.id,
      village_id: joinDialog.village.id,
      message: joinMessage || null,
    });
    if (error) {
      if (error.message.includes('duplicate')) {
        toast.error('You have already requested to join this village');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Join request sent! The village admin will review it.');
    }
    setJoining(false);
    setJoinDialog(null);
    setJoinMessage('');
  };

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Villages</h1>
          <p className="page-subtitle">Communities registered on VillageConnect Limpopo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBrowse}>
            <Search className="h-4 w-4 mr-2" />Join a Village
          </Button>
          <Button onClick={() => navigate('/create-village')}>
            <Plus className="h-4 w-4 mr-2" />Register New Village
          </Button>
        </div>
      </div>

      <Input placeholder="Search by village, district, or municipality..." value={search} onChange={e => setSearch(e.target.value)} className="mb-6 max-w-md" />

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No villages yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Be the first to digitise your community</p>
          <Button onClick={() => navigate('/create-village')}>
            <Plus className="h-4 w-4 mr-2" />Register Your Village
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(v => (
            <Card key={v.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setCurrentVillageId(v.id); navigate('/'); }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {v.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 text-sm">
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />{v.municipality}, {v.district}
                  </p>
                  {v.chief_name && (
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Crown className="h-3.5 w-3.5" />{v.chief_title || 'Chief'} {v.chief_name}
                    </p>
                  )}
                  <p className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />{v.sections.length} section{v.sections.length !== 1 ? 's' : ''}
                  </p>
                  <Badge variant={v.status === 'active' ? 'default' : 'secondary'}>{v.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Browse & Join Dialog */}
      <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Browse & Join a Village</DialogTitle>
          </DialogHeader>
          <Input placeholder="Search villages..." value={browseSearch} onChange={e => setBrowseSearch(e.target.value)} className="mb-4" />
          {browsedFiltered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No villages found</p>
          ) : (
            <div className="space-y-2">
              {browsedFiltered.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-sm">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.municipality}, {v.district}</p>
                    {v.chief_name && <p className="text-xs text-muted-foreground">{v.chief_title || 'Chief'} {v.chief_name}</p>}
                  </div>
                  {myVillageIds.has(v.id) ? (
                    <Badge variant="secondary">Joined</Badge>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setBrowseOpen(false); setJoinDialog({ village: v }); }}>
                      <UserPlus className="h-3.5 w-3.5 mr-1" />Request
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Join Request Dialog */}
      <Dialog open={!!joinDialog} onOpenChange={() => setJoinDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Join {joinDialog?.village?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Your request will be reviewed by the village admin. You can add an optional message.</p>
          <Textarea
            placeholder="e.g. I am a community member from Section A..."
            value={joinMessage}
            onChange={e => setJoinMessage(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinDialog(null)}>Cancel</Button>
            <Button onClick={handleJoinRequest} disabled={joining}>
              {joining ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}