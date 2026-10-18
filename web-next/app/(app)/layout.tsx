import type { Metadata } from 'next';
import AuthGate from '@/components/AuthGate';
import AppShell from '@/components/AppShell';
import './student-dark-surfaces.css';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    nosnippet: true,
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
