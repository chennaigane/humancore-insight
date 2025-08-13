
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Shield, User } from 'lucide-react';

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLoginType, setActiveLoginType] = useState<'user' | 'admin'>('user');

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password, activeLoginType);
    
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName, activeLoginType);
    
    if (error) {
      setError(error.message);
    } else {
      setError('Please check your email to confirm your account, then try signing in.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-brand-blue">Metrx</h1>
          </div>
          <CardTitle>Welcome to Metrx</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Login Type Selection */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <Button
                type="button"
                variant={activeLoginType === 'user' ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveLoginType('user')}
              >
                <User className="w-4 h-4" />
                User Login
              </Button>
              <Button
                type="button"
                variant={activeLoginType === 'admin' ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveLoginType('admin')}
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </Button>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">
                    {activeLoginType === 'admin' ? 'Admin Email' : 'User Email'}
                  </Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder={`Enter your ${activeLoginType} email`}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : `Sign In as ${activeLoginType === 'admin' ? 'Admin' : 'User'}`}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">
                    {activeLoginType === 'admin' ? 'Admin Email' : 'User Email'}
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder={`Enter your ${activeLoginType} email`}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : `Sign Up as ${activeLoginType === 'admin' ? 'Admin' : 'User'}`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
