'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignupPage() {
  const [form, setForm] = useState({
    username: '', // Changed from name to username to match backend
    email: '',
    password: '',
    userType: 'buyer' // Default to buyer, make it required
  });
  
  const router = useRouter();
  const { signup, loading, error, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleUserTypeChange = (value) => {
    setForm(prev => ({ ...prev, userType: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await signup(form);
  };

  return (
    <div className="max-w-md w-full px-4">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
          <CardDescription className="text-center">
            Create a new TrustTrade account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Select 
                value={form.userType} 
                onValueChange={handleUserTypeChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="arbitrator">Arbitrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-center text-muted-foreground mt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Log in
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground mt-2">
            <Link href="/" className="text-primary underline-offset-4 hover:underline">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}