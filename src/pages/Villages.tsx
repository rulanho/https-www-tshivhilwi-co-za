import { useState } from 'react';
import { useVillage } from '@/contexts/VillageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, MapPin, Users, Plus, Crown, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Villages() {
  const { villages, setCurrentVillageId, refresh } = useVillage();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = villages.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.district.toLowerCase().includes(search.toLowerCase()) ||
    v.municipality.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Villages</h1>
          <p className="page-subtitle">Communities registered on VillageConnect Limpopo</p>
        </div>
        <Button onClick={() => navigate('/create-village')}>
          <Plus className="h-4 w-4 mr-2" />Register New Village
        </Button>
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
                  {(v as any).chief_name && (
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Crown className="h-3.5 w-3.5" />{(v as any).chief_title || 'Chief'} {(v as any).chief_name}
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
    </div>
  );
}