'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const redirect = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
      const loginPath = pathname?.startsWith('/academy') ? '/academy-login' : '/login';
      router.replace(`${loginPath}${redirect}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container" style={{ padding: '80px 0' }}>
        <div className="card">
          <h2>Carregando...</h2>
          <p className="subtle" style={{ marginTop: 8 }}>
            Preparando seu painel.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
