import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, Plus, X, LogOut, ArrowRight, ArrowLeft, Crown, Building2, Landmark, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface District { id: string; name: string; }
interface Municipality { id: string; name: string; district_id: string; }

const CHIEF_TITLES = ['Thovhele', 'Khosi', 'Hosi', 'Induna', 'Kgoshi', 'Chief', 'Headman', 'Other'];

export default function CreateVillage() {
  const { user, signOut } = useAuth();
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: '',
    district_id: '',
    district_name: '',
    municipality_id: '',
    municipality_name: '',
    chief_title: 'Thovhele',
    chief_name: '',
    chief_phone: '',
    traditional_authority: '',
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

  const filteredMunicipalities = form.district_id
    ? municipalities.filter(m => m.district_id === form.district_id)
    : [];

  const addSection = () => {
    if (newSection.trim() && !sections.includes(newSection.trim())) {
      setSections([...sections, newSection.trim()]);
      setNewSection('');
    }
  };

  const canProceed = (s: number) => {
    if (s === 1) return form.district_id && form.municipality_id;
    if (s === 2) return form.name.trim();
    if (s === 3) return form.chief_name.trim();
    if (s === 4) return sections.length > 0;
    return true;
  };

  const handleCreate = async () => {
    if (!canProceed(1) || !canProceed(2) || !canProceed(3) || !canProceed(4)) {
      toast.error('Please complete all required fields');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('villages').insert({
      name: form.name,
      district: form.district_name,
      municipality: form.municipality_name,
      municipality_id: form.municipality_id,
      traditional_authority: form.traditional_authority || `${form.chief_title} ${form.chief_name}`,
      chief_title: form.chief_title,
      chief_name: form.chief_name,
      chief_phone: form.chief_phone || null,
      sections,
      created_by: user!.id,
    } as any);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Assign admin role to creator
    await supabase.from('user_roles').upsert(
      { user_id: user!.id, role: 'admin' as any },
      { onConflict: 'user_id,role' }
    );

    toast.success('Village registered successfully! Your community is now digital.');
    setTimeout(() => window.location.reload(), 1200);
  };

  const stepIcons = [
    { icon: Building2, label: 'Location' },
    { icon: Globe, label: 'Village' },
    { icon: Crown, label: 'Chief' },
    { icon: MapPin, label: 'Sections' },
    { icon: CheckCircle2, label: 'Confirm' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Landmark className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-display">Digitise Your Community</h1>
          <p className="text-sm text-muted-foreground mt-1">Register your village on VillageConnect Limpopo to manage households, payments, burial society, and more.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {stepIcons.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <button
                onClick={() => i + 1 < step && setStep(i + 1)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i + 1 === step ? 'bg-primary text-primary-foreground' :
                  i + 1 < step ? 'bg-primary/20 text-primary cursor-pointer' :
                  'bg-muted text-muted-foreground'
                }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < stepIcons.length - 1 && <div className={`w-4 h-0.5 ${i + 1 < step ? 'bg-primary/40' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6 space-y-5">
            {/* Step 1: Geographic Location */}
            {step === 1 && (
              <>
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  <p>📍 <strong>Step 1:</strong> Select your district and local municipality. This links your village to the correct government structures.</p>
                </div>
                <div>
                  <Label>District Municipality *</Label>
                  <Select value={form.district_id} onValueChange={v => {
                    const d = districts.find(x => x.id === v);
                    setForm(f => ({ ...f, district_id: v, district_name: d?.name || '', municipality_id: '', municipality_name: '' }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select district municipality" /></SelectTrigger>
                    <SelectContent>
                      {districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Local Municipality *</Label>
                  <Select value={form.municipality_id} onValueChange={v => {
                    const m = municipalities.find(x => x.id === v);
                    setForm(f => ({ ...f, municipality_id: v, municipality_name: m?.name || '' }));
                  }}>
                    <SelectTrigger><SelectValue placeholder={form.district_id ? 'Select local municipality' : 'Select district first'} /></SelectTrigger>
                    <SelectContent>
                      {filteredMunicipalities.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 2: Village Details */}
            {step === 2 && (
              <>
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  <p>🏘️ <strong>Step 2:</strong> Enter the name of your village as it is known in the community.</p>
                </div>
                <div>
                  <Label>Village Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Tshivhilwi, Makwarela, Ha-Lambani" />
                </div>
              </>
            )}

            {/* Step 3: Chief / Traditional Leader */}
            {step === 3 && (
              <>
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  <p>👑 <strong>Step 3:</strong> Enter details of your traditional leader. This links the village to its chief for governance.</p>
                </div>
                <div>
                  <Label>Chief Title *</Label>
                  <Select value={form.chief_title} onValueChange={v => setForm(f => ({ ...f, chief_title: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CHIEF_TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Chief Full Name *</Label>
                  <Input value={form.chief_name} onChange={e => setForm(f => ({ ...f, chief_name: e.target.value }))} placeholder="e.g. Tshivhase" />
                </div>
                <div>
                  <Label>Chief Phone Number (optional)</Label>
                  <Input value={form.chief_phone} onChange={e => setForm(f => ({ ...f, chief_phone: e.target.value }))} placeholder="e.g. 082 123 4567" type="tel" />
                </div>
                <div>
                  <Label>Traditional Authority / Royal Council (optional)</Label>
                  <Input value={form.traditional_authority} onChange={e => setForm(f => ({ ...f, traditional_authority: e.target.value }))} placeholder="e.g. Tshivhase Traditional Council" />
                </div>
              </>
            )}

            {/* Step 4: Village Sections */}
            {step === 4 && (
              <>
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  <p>📍 <strong>Step 4:</strong> Add the sections (areas/wards) within your village. Each section can have its own leader.</p>
                </div>
                <div>
                  <Label>Add Sections *</Label>
                  <div className="flex gap-2 mb-2">
                    <Input value={newSection} onChange={e => setNewSection(e.target.value)} placeholder="e.g. Tshilongwe, Manamani"
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSection())} />
                    <Button type="button" variant="outline" size="sm" onClick={addSection}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {sections.map(s => (
                      <Badge key={s} variant="secondary" className="gap-1">
                        {s}
                        <button onClick={() => setSections(sections.filter(x => x !== s))}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                    {sections.length === 0 && <p className="text-xs text-muted-foreground">Add at least one section to continue</p>}
                  </div>
                </div>
              </>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Review Your Village</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">District:</span><span className="font-medium">{form.district_name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Municipality:</span><span className="font-medium">{form.municipality_name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Village:</span><span className="font-medium">{form.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Chief:</span><span className="font-medium">{form.chief_title} {form.chief_name}</span></div>
                    {form.chief_phone && <div className="flex justify-between"><span className="text-muted-foreground">Chief Phone:</span><span className="font-medium">{form.chief_phone}</span></div>}
                    {form.traditional_authority && <div className="flex justify-between"><span className="text-muted-foreground">Traditional Authority:</span><span className="font-medium">{form.traditional_authority}</span></div>}
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground">Sections ({sections.length}):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sections.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  <p>✅ You will become the <strong>Admin</strong> of this village. You can then add households, record payments, manage burial cases, and assign staff (Treasurer, Secretary, Section Leaders).</p>
                </div>
              </>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />Back
                </Button>
              )}
              {step < 5 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed(step)} className="flex-1">
                  Next<ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleCreate} disabled={loading} className="flex-1">
                  {loading ? 'Registering...' : '🚀 Register Village'}
                </Button>
              )}
            </div>

            <Button variant="ghost" size="sm" className="w-full" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}