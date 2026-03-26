import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone login state
  const [phone, setPhone] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) toast.error(error.message);
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) toast.error(error.message);
        else toast.success('Account created! The first user gets Admin role automatically.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !accessCode) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-access-code', {
        body: { phone, code: accessCode },
      });
      if (error) {
        toast.error('Login failed. Check your phone number and code.');
        return;
      }
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        toast.success('Welcome! You are signed in.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
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
          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="phone">Phone & Code</TabsTrigger>
              <TabsTrigger value="email">Staff Login</TabsTrigger>
            </TabsList>

            <TabsContent value="phone">
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Household heads — sign in with your phone number and access code provided by your community leader.
                </p>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 071 234 5678" required />
                </div>
                <div>
                  <Label>Access Code</Label>
                  <Input value={accessCode} onChange={e => setAccessCode(e.target.value)} placeholder="Enter your code" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                  {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button onClick={() => setIsLogin(!isLogin)} className="text-primary underline">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
