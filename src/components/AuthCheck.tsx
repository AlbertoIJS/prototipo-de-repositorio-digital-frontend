'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { setCookie, deleteCookie } from 'cookies-next';

interface JWTPayload {
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
        const token = localStorage.getItem('accessToken');
        
        // Sync token to cookies for middleware
        if (token) {
          setCookie('accessToken', token);
        } else {
          deleteCookie('accessToken');
        }
        
        if (!isPublicPath && !token) {
          // Redirect to login if not on a public path and no token exists
          if (pathname !== '/login') { // Avoid redirect loop
            router.push('/login');
            return;
          }
        }

        if (!isPublicPath && token) {
          // If user is on a protected route with a token, verify it
          try {
            const decoded = jwtDecode<JWTPayload>(token);
            if (!decoded || !decoded.email) {
              localStorage.removeItem('accessToken');
              deleteCookie('accessToken');
              router.push('/login');
              return;
            }
          } catch (error) {
            // Invalid token
            localStorage.removeItem('accessToken');
            deleteCookie('accessToken');
            router.push('/login');
            return;
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
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