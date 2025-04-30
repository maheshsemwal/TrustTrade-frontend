'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', walletAddress: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Signup successful!');
        // optionally store JWT or redirect
      } else {
        setMessage(data.msg || data.error || 'Signup failed');
      }
    } catch (err) {
      setMessage('Something went wrong');
    } finally {
      setLoading(false);
    }
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                name="username"
                placeholder="Username"
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                name="walletAddress"
                placeholder="Wallet Address (Optional)"
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            
            {message && (
              <div className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>
                {message}
              </div>
            )}
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