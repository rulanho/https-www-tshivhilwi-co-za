import { useState } from 'react';
import { useVillage } from '@/contexts/VillageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, MapPin, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Villages() {
  const { villages, setCurrentVillageId, isSuperAdmin } = useVillage();
  const { hasRole } = useAuth();
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
          <h1 className="page-title">Manage Villages</h1>
          <p className="page-subtitle">All villages on the VillageConnect platform</p>
        </div>
      </div>

      <Input placeholder="Search villages..." value={search} onChange={e => setSearch(e.target.value)} className="mb-6 max-w-sm" />

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
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground"><MapPin className="h-3 w-3 inline mr-1" />{v.municipality}, {v.district}</p>
                <p className="text-muted-foreground"><Users className="h-3 w-3 inline mr-1" />{v.sections.length} sections</p>
                <Badge variant={v.status === 'active' ? 'default' : 'secondary'}>{v.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}