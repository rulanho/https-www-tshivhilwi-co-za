import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Mail, Loader2 } from 'lucide-react';

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
  const [codeSent, setCodeSent] = useState(false);
  const [displayCode, setDisplayCode] = useState<string | null>(null);

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

  const handleRequestCode = async () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      const normalizedPhone = phone.replace(/\s+/g, '');
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: normalizedPhone },
      });
      if (error) {
        toast.error('Failed to send code. Please try again.');
        return;
      }
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setCodeSent(true);
      if (data?.smsSent) {
        toast.success('A verification code has been sent to your phone.');
      } else if (data?.code) {
        // SMS not configured — show code directly (for testing)
        setDisplayCode(data.code);
        toast.success('Code generated! SMS is not configured, showing code below.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !accessCode) return;
    setLoading(true);
    try {
      const normalizedPhone = phone.replace(/\s+/g, '');
      const { data, error } = await supabase.functions.invoke('verify-access-code', {
        body: { phone: normalizedPhone, code: accessCode },
      });
      if (error) {
        toast.error('Login failed. Check your code and try again.');
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
              <TabsTrigger value="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />Household
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />Staff
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone">
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your registered phone number to receive a one-time login code.
                </p>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setCodeSent(false); setDisplayCode(null); setAccessCode(''); }}
                    placeholder="e.g. 0712345678"
                    required
                  />
                </div>

                {!codeSent ? (
                  <Button type="button" className="w-full" disabled={loading} onClick={handleRequestCode}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Checking...</> : 'Get Login Code'}
                  </Button>
                ) : (
                  <>
                    {displayCode && (
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Your code (SMS not configured):</p>
                        <p className="text-2xl font-mono font-bold tracking-widest">{displayCode}</p>
                      </div>
                    )}
                    <div>
                      <Label>Enter Code</Label>
                      <Input
                        value={accessCode}
                        onChange={e => setAccessCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center text-lg font-mono tracking-widest"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => { setCodeSent(false); setDisplayCode(null); setAccessCode(''); }}>
                      Request new code
                    </Button>
                  </>
                )}
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
