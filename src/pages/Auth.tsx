import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Users, ShieldCheck, Home } from 'lucide-react';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('staff');

  // Household login
  const [standNumber, setStandNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) toast.error(error.message);
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) toast.error(error.message);
        else toast.success('Account created! Please check your email to verify your account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHouseholdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standNumber || !idNumber) {
      toast.error('Please enter both stand number and ID number');
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
          <CardTitle className="text-2xl font-display">Tshivhilwi Village</CardTitle>
          <p className="text-sm text-muted-foreground">Burial Society Management System</p>
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
                {!isLogin && (
                  <div>
                    <Label>Full Name</Label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" required />
                  </div>
                )}
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Please wait...</> : isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button onClick={() => setIsLogin(!isLogin)} className="text-primary underline">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
              <div className="mt-4 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>For Admin, Treasurer, and Secretary staff accounts</span>
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
