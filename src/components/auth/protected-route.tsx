import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * A higher-order component that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 * Optionally checks for specific user roles
 */
export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: ProtectedRouteProps) => {
  const { isAuthenticated, userType } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // If roles are specified, check if the user has the required role
    if (allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.includes(userType || '');
      if (!hasRequiredRole) {
        router.push('/dashboard'); // Redirect to dashboard instead of unauthorized page
        return;
      }
    }

    // User is authenticated and has required role (if specified)
    setAuthorized(true);
  }, [isAuthenticated, userType, router, allowedRoles]);

  // Show nothing while checking authorization
  if (!authorized) {
    return null;
  }

  // Render children if authorized
  return <>{children}</>;
};

export default ProtectedRoute;