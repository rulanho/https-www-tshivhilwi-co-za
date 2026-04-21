import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, Plus, X, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface District { id: string; name: string; }
interface Municipality { id: string; name: string; district_id: string; }

export default function CreateVillage() {
  const { user, signOut } = useAuth();
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', district: '', municipality: '', traditional_authority: '',
  });
  const [sections, setSections] = useState<string[]>([]);
  const [newSection, setNewSection] = useState('');

  useEffect(() => {
    supabase.from('districts').select('*').order('name').then(({ data }) => {
      if (data) setDistricts(data);
    });
    supabase.from('municipalities').select('*').order('name').then(({ data }) => {
      if (data) setMunicipalities(data);
    });
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

  const removeSection = (s: string) => setSections(sections.filter(x => x !== s));

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

    // Also assign admin role to this user
    await supabase.from('user_roles').upsert(
      { user_id: user!.id, role: 'admin' as any },
      { onConflict: 'user_id,role' }
    );

    toast.success('Village created! Reloading...');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Globe className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">VillageConnect Limpopo</CardTitle>
          <p className="text-sm text-muted-foreground">Create your village to get started</p>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  <button onClick={() => removeSection(s)}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
              {sections.length === 0 && <p className="text-xs text-muted-foreground">Add at least one section</p>}
            </div>
          </div>
          <Button onClick={handleCreate} className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Village'}
          </Button>
          <Button variant="ghost" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}