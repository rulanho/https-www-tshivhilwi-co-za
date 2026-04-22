import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVillage } from '@/contexts/VillageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface JoinRequest {
  id: string;
  user_id: string;
  village_id: string;
  message: string | null;
  status: string;
  created_at: string;
  profile?: { full_name: string | null };
}

export default function JoinRequests() {
  const { currentVillage } = useVillage();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!currentVillage) return;
    setLoading(true);
    const { data } = await supabase
      .from('village_join_requests')
      .select('*')
      .eq('village_id', currentVillage.id)
      .order('created_at', { ascending: false });

    if (data) {
      // Fetch profile names
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const enriched = data.map(r => ({
        ...r,
        profile: profiles?.find(p => p.user_id === r.user_id),
      }));
      setRequests(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [currentVillage]);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('village_join_requests')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Request ${status}`);
    fetchRequests();
  };

  const pending = requests.filter(r => r.status === 'pending');
  const resolved = requests.filter(r => r.status !== 'pending');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Join Requests</h1>
        <p className="page-subtitle">People requesting to join {currentVillage?.name || 'your village'}</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : pending.length === 0 && resolved.length === 0 ? (
        <div className="text-center py-16">
          <UserPlus className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No join requests</h3>
          <p className="text-muted-foreground text-sm">When community members request to join, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pending ({pending.length})</h2>
              <div className="grid gap-3">
                {pending.map(r => (
                  <Card key={r.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{r.profile?.full_name || 'Unknown User'}</p>
                        {r.message && <p className="text-sm text-muted-foreground mt-0.5">{r.message}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAction(r.id, 'approved')}>
                          <Check className="h-4 w-4 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(r.id, 'rejected')}>
                          <X className="h-4 w-4 mr-1" />Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {resolved.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resolved</h2>
              <div className="grid gap-2">
                {resolved.map(r => (
                  <Card key={r.id} className="opacity-70">
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm">{r.profile?.full_name || 'Unknown User'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={r.status === 'approved' ? 'default' : 'destructive'}>{r.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}