import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Users, ShieldCheck, Home, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Auth() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('staff');

  // Household login
  const [standNumber, setStandNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message?.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. If you are not yet registered as staff, please contact your Admin.');
        } else if (error.message?.includes('Email not confirmed')) {
          toast.error('Your email has not been verified yet. Please check your inbox.');
        } else {
          toast.error(error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHouseholdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standNumber.trim()) {
      toast.error('Please enter your stand number');
      return;
    }
    if (!idNumber.trim() || idNumber.trim().length < 6) {
      toast.error('Please enter a valid ID number');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('household-login', {
        body: { stand_number: standNumber, id_number: idNumber },
      });

      if (error) {
        toast.error('Login failed. Please check your details.');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.session) {
        // Set the session
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        toast.success(`Welcome, ${data.member_name}!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display">VillageConnect Limpopo</CardTitle>
          <p className="text-sm text-muted-foreground">Multi-Community Management Platform</p>
          <Link to="/about" className="mt-2 inline-flex items-center justify-center gap-1 text-xs text-primary hover:underline">
            <Info className="h-3 w-3" />Learn what VillageConnect is
          </Link>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="staff" className="flex-1">
                <ShieldCheck className="h-4 w-4 mr-1" />Staff
              </TabsTrigger>
              <TabsTrigger value="household" className="flex-1">
                <Home className="h-4 w-4 mr-1" />Household
              </TabsTrigger>
            </TabsList>

            <TabsContent value="staff">
              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Please wait...</> : 'Sign In'}
                </Button>
              </form>
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Staff accounts are created by the Admin. Contact your Admin if you need access.</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="household">
              <form onSubmit={handleHouseholdLogin} className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground mb-2">
                  <p>Login using your <strong>stand number</strong> and any registered member's <strong>ID number</strong> to view your household profile.</p>
                </div>
                <div>
                  <Label>Stand Number</Label>
                  <Input value={standNumber} onChange={e => setStandNumber(e.target.value)} placeholder="e.g. Stand 45" required />
                </div>
                <div>
                  <Label>ID Number</Label>
                  <Input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="e.g. 9001015800087" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</> : 'View My Household'}
                </Button>
              </form>
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>For registered household members to view their profile</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
