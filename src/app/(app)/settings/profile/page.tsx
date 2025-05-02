'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Wallet, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfileSettingsPage() {
  const { user, userType, updateUser, loading, error, setError } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    userType: userType || 'buyer',
    walletAddress: user?.walletAddress || '',
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Populate form with current user data
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        userType: userType || 'buyer',
        walletAddress: user.walletAddress || '',
      });
    }
  }, [user, userType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (value) => {
    setForm(prev => ({ ...prev, userType: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      const result = await updateUser({
        userType: form.userType,
        walletAddress: form.walletAddress,
      });

      if (result) {
        setSuccess('Profile updated successfully! Wallet address saved.');
        setIsEditing(false);
        
        // No need to manually update localStorage - the auth service's updateProfile 
        // function already updates the user in the store, which syncs with localStorage
        
        // Remove any direct wallet address entry in localStorage that may exist from before
        localStorage.removeItem('trusttrade_wallet_address');
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      setForm(prev => ({ ...prev, walletAddress: userAddress }));
    } catch (err) {
      setError('Failed to connect wallet');
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Contact support to change your email address</p>
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">User Type</label>
                  <Select
                    value={form.userType}
                    onValueChange={handleUserTypeChange}
                    disabled={!isEditing}
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
                  <p className="text-xs text-muted-foreground">
                    Your account type determines your available actions on the platform
                  </p>
                </div>

                <div className="pt-4 flex justify-between">
                  {!isEditing ? (
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(true)} 
                      variant="outline"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form to original values
                          if (user) {
                            setForm({
                              username: user.username || '',
                              email: user.email || '',
                              userType: userType || 'buyer',
                              walletAddress: user.walletAddress || '',
                            });
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Configuration</CardTitle>
              <CardDescription>
                Connect your wallet for secure transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Wallet Address</label>
                  <div className="flex gap-2">
                    <Input
                      name="walletAddress"
                      value={form.walletAddress}
                      onChange={handleChange}
                      placeholder="0x..."
                      className="flex-1"
                      disabled={!isEditing}
                    />
                    {isEditing && (
                      <Button 
                        type="button" 
                        onClick={handleConnectWallet} 
                        variant="outline"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your Ethereum wallet address for receiving payments and handling disputes
                  </p>
                </div>

                <div className="pt-4 flex justify-between">
                  {!isEditing ? (
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(true)} 
                      variant="outline"
                    >
                      Edit Wallet
                    </Button>
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form to original values
                          setForm(prev => ({
                            ...prev,
                            walletAddress: user.walletAddress || '',
                          }));
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}