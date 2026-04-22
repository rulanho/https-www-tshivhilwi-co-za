import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVillage } from '@/contexts/VillageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Globe, MapPin, Users, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface District { id: string; name: string; }
interface Municipality { id: string; name: string; district_id: string; }

export default function Villages() {
  const { villages, setCurrentVillageId, isSuperAdmin, refresh } = useVillage();
  const { hasRole, user } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', district: '', municipality: '', traditional_authority: '' });
  const [sections, setSections] = useState<string[]>([]);
  const [newSection, setNewSection] = useState('');

  useEffect(() => {
    supabase.from('districts').select('*').order('name').then(({ data }) => { if (data) setDistricts(data); });
    supabase.from('municipalities').select('*').order('name').then(({ data }) => { if (data) setMunicipalities(data); });
  }, []);

  const filteredMunicipalities = form.district
    ? municipalities.filter(m => {
        const dist = districts.find(d => d.name === form.district);
        return dist && m.district_id === dist.id;
      })
    : [];

  const addSection = () => {
    if (newSection.trim() && !sections.includes(newSection.trim())) {
      setSections([...sections, newSection.trim()]);
      setNewSection('');
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.district || !form.municipality || sections.length === 0) {
      toast.error('Please fill in village name, district, municipality, and add at least one section');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('villages').insert({
      name: form.name,
      district: form.district,
      municipality: form.municipality,
      traditional_authority: form.traditional_authority || null,
      sections,
      created_by: user!.id,
    } as any);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('Village created successfully!');
    setForm({ name: '', district: '', municipality: '', traditional_authority: '' });
    setSections([]);
    setDialogOpen(false);
    setLoading(false);
    refresh();
  };

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Create Village</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create a New Village</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Village Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Tshivhilwi" />
              </div>
              <div>
                <Label>District Municipality</Label>
                <Select onValueChange={v => setForm(f => ({ ...f, district: v, municipality: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Local Municipality</Label>
                <Select value={form.municipality} onValueChange={v => setForm(f => ({ ...f, municipality: v }))}>
                  <SelectTrigger><SelectValue placeholder={form.district ? 'Select municipality' : 'Select district first'} /></SelectTrigger>
                  <SelectContent>
                    {filteredMunicipalities.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Traditional Authority (optional)</Label>
                <Input value={form.traditional_authority} onChange={e => setForm(f => ({ ...f, traditional_authority: e.target.value }))} placeholder="e.g. Thovhele Tshivhase" />
              </div>
              <div>
                <Label>Village Sections</Label>
                <div className="flex gap-2 mb-2">
                  <Input value={newSection} onChange={e => setNewSection(e.target.value)} placeholder="e.g. Tshilongwe"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSection())} />
                  <Button type="button" variant="outline" size="sm" onClick={addSection}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sections.map(s => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button onClick={() => setSections(sections.filter(x => x !== s))}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                  {sections.length === 0 && <p className="text-xs text-muted-foreground">Add at least one section</p>}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Village'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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