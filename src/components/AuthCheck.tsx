'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { getCookie, deleteCookie } from '@/lib/cookies';

interface JWTPayload {
  sub: string;
  email: string;
  // Add other JWT fields as needed
}

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Public paths that don't require authentication
  const isPublicPath = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/verificar';

  useEffect(() => {
    // This function should only run in the browser
    if (typeof window === 'undefined') return;

    const checkAuth = () => {
      try {
        console.log("=== AUTH CHECK STARTED ===");
        console.log("Current pathname:", pathname);
        console.log("Is public path:", isPublicPath);
        
        // Get token from cookies (our new approach)
        const token = getCookie('auth_token');
        console.log("Token from cookies:", token ? "EXISTS" : "NOT_FOUND");
        
        if (!isPublicPath && !token) {
          // Redirect to login if not on a public path and no token exists
          console.log("No token found, redirecting to login");
          if (pathname !== '/login') { // Avoid redirect loop
            router.push('/login');
            return;
          }
        }

        if (!isPublicPath && token) {
          // If user is on a protected route with a token, verify it
          try {
            console.log("Verifying token...");
            const decoded = jwtDecode<JWTPayload>(token);
            console.log("Decoded token:", { sub: decoded.sub, email: decoded.email });
            
            if (!decoded || !decoded.sub) {
              console.log("Invalid token structure, removing and redirecting");
              deleteCookie('auth_token');
              deleteCookie('expiresAt');
              // Also clean up localStorage for backwards compatibility
              localStorage.removeItem('userID');
              router.push('/login');
              return;
            }
            console.log("Token is valid");
          } catch (error) {
            // Invalid token
            console.error("Token decode error:", error);
            deleteCookie('auth_token');
            deleteCookie('expiresAt');
            // Also clean up localStorage for backwards compatibility
            localStorage.removeItem('userID');
            router.push('/login');
            return;
          }
        }
        
        console.log("Auth check completed successfully");
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Listen for storage events to handle login/logout in other tabs
    const handleStorageChange = () => {
      console.log("Storage change detected, rechecking auth");
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleStorageChange);
    };
  }, [router, isPublicPath, pathname]);

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}