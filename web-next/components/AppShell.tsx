'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth';
import AppSidebar from '@/components/AppSidebar';
import ChatWidget from '@/components/ChatWidget';
import ToastCenter from '@/components/ToastCenter';
import RoleBottomNav from '@/components/RoleBottomNav';
import PersonalBottomNav from '@/components/PersonalBottomNav';
import AdminProfileCompletionSheet from '@/components/admin/AdminProfileCompletionSheet';

export default function AppShell({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const isStudent = role === 'aluno';
  const isPersonal = role === 'personal' || role === 'professor';
  const isAdmin = role === 'admin';

  if (isStudent) {
    return (
      <div className="app-shell app-shell-student student-shell">
        <AppSidebar />
        <main className="app-content student-content">{children}</main>
        <RoleBottomNav role="student" />
        <ToastCenter />
      </div>
    );
  }

  return (
    <div className={clsx('app-shell', { 'app-shell-personal': isPersonal, 'app-shell-academy': role === 'academy' })}>
      <AppSidebar />
      <main className={clsx('app-content', { 'app-content-personal': isPersonal })}>{children}</main>
      {isPersonal ? <PersonalBottomNav /> : null}
      {role === 'academy' ? <RoleBottomNav role="academy" /> : null}
      <ChatWidget />
      <ToastCenter />
      {isAdmin ? <AdminProfileCompletionSheet /> : null}
    </div>
  );
}
