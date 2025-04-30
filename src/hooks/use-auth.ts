import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { AuthService } from '../lib/auth';
import { useStore, useAuth as useAuthStore } from '../lib/store';

/**
 * Custom hook for authentication state and operations
 * Makes it easier to use authentication in components
 */
export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get auth state from store - this won't cause re-renders unless the auth state changes
  const authState = useAuthStore();

  // Access store functions directly from the store to avoid recreating objects
  // These references are stable and won't change between renders
  const storeLogin = useStore.getState().login;
  const storeLogout = useStore.getState().logout;
  
  /**
   * Log in with email and password
   */
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await AuthService.login({ email, password });
      
      if (result.success) {
        router.push('/dashboard');
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  /**
   * Register a new user
   */
  const signup = useCallback(async (userData: { 
    email: string; 
    password: string;
    username?: string;
    name?: string;
    userType?: string;
    walletAddress?: string;
    [key: string]: any;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await AuthService.signup(userData);
      
      if (result.success) {
        router.push('/dashboard');
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred during registration');
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  /**
   * Log the user out
   */
  const logout = useCallback(() => {
    AuthService.logout();
    router.push('/login');
  }, [router]);

  return {
    // Auth state
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
    userType: authState.userType,
    walletAddress: authState.walletAddress,
    
    // Auth operations
    login,
    signup,
    logout,
    
    // UI state
    loading,
    error,
    setError,
  };
};