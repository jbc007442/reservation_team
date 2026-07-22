'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const { user } = await res.json();

        setUser(user);
      } catch (error) {
        console.error('AuthProvider:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
