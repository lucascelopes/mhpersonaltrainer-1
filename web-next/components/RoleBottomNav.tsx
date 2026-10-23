'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  Barbell,
  Buildings,
  CalendarDots,
  ChatCircleDots,
  ClipboardText,
  CurrencyDollar,
  DotsThree,
  FolderOpen,
  House,
  TrendUp,
  UserCircle,
  UsersThree,
} from '@phosphor-icons/react';
import { useAuth } from '@/lib/auth';

type RoleBottomNavProps = {
  role: 'admin' | 'academy' | 'student';
};

type MoreItem = {
  href: string;
  label: string;
  section: string;
  premium?: boolean;
};

const academyPrimary = [
  { href: '/academy', label: 'Painel', Icon: House },
  { href: '/academy/students', label: 'Alunos', Icon: UsersThree },
  { href: '/academy/personals', label: 'Personais', Icon: UserCircle },
  { href: '/academy/agenda', label: 'Agenda', Icon: CalendarDots },
];

const academyMore: MoreItem[] = [
  { href: '/academy/billing', label: 'Faturas', section: 'Academia' },
  { href: '/academy/ai', label: 'IA', section: 'Academia', premium: true },
  { href: '/academy/linking', label: 'Vínculos', section: 'Vínculos' },
  { href: '/academy/checkins', label: 'Histórico de entradas', section: 'Controle' },
  { href: '/academy/access', label: 'Credenciais', section: 'Controle' },
  { href: '/chat', label: 'Chat', section: 'Comunicação' },
  { href: '/support', label: 'Suporte', section: 'Suporte' },
  { href: '/profile', label: 'Perfil', section: 'Conta' },
];

const adminPrimary = [
  { href: '/admin', label: 'Resumo', Icon: House },
  { href: '/admin/academy', label: 'Academias', Icon: Buildings },
  { href: '/admin/students', label: 'Alunos', Icon: UsersThree },
  { href: '/admin/users', label: 'Usuários', Icon: UserCircle },
];

const adminMore: MoreItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', section: 'Visão geral' },
  { href: '/admin/manage-students', label: 'Gestão de alunos', section: 'Visão geral' },
  { href: '/admin/treinors', label: 'Treinadores', section: 'Visão geral' },
  { href: '/admin/support', label: 'Suporte', section: 'Operação' },
  { href: '/admin/instagram', label: 'Posts Instagram (IA)', section: 'Operação' },
  { href: '/admin/emails', label: 'E-mails do domínio', section: 'Operação' },
  { href: '/notifications/admin', label: 'Notificações no app', section: 'Operação' },
  { href: '/admin/kabam', label: 'Kabam', section: 'Operação' },
  { href: '/chat', label: 'Chat', section: 'Comunicação' },
  { href: '/profile', label: 'Perfil', section: 'Conta' },
];

const studentPrimary = [
  { href: '/app', label: 'Início', Icon: House },
  { href: '/workouts', label: 'Treinos', Icon: Barbell },
  { href: '/evaluations', label: 'Avaliações', Icon: ClipboardText },
  { href: '/chat', label: 'Chat', Icon: ChatCircleDots },
];

const studentMore: MoreItem[] = [
  { href: '/progress', label: 'Progresso', section: 'Acompanhamento' },
  { href: '/schedule', label: 'Agenda', section: 'Acompanhamento' },
  { href: '/feedbacks', label: 'Feedbacks', section: 'Acompanhamento' },
  { href: '/financeiro/aluno', label: 'Financeiro', section: 'Conta e recursos' },
  { href: '/documents/aluno', label: 'Arquivos', section: 'Conta e recursos' },
  { href: '/notifications', label: 'Notificações', section: 'Conta e recursos' },
  { href: '/profile', label: 'Perfil', section: 'Conta e recursos' },
];

const isCurrentRoute = (pathname: string, href: string) => {
  if (href === '/admin' || href === '/academy') return pathname === href;
  if (href === '/workouts') {
    return pathname === href || pathname.startsWith('/workout/') || pathname === '/start-workout';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function RoleBottomNav({ role }: RoleBottomNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const moreTriggerRef = useRef<HTMLButtonElement | null>(null);
  const isAcademy = role === 'academy';
  const isStudent = role === 'student';
  const primaryItems = isAcademy ? academyPrimary : isStudent ? studentPrimary : adminPrimary;
  const moreItems = isAcademy ? academyMore : isStudent ? studentMore : adminMore;
  const navLabel = isAcademy ? 'Navegação da academia' : isStudent ? 'Navegação do aluno' : 'Navegação administrativa';
  const moreLabel = isAcademy ? 'Mais opções da academia' : isStudent ? 'Mais opções do aluno' : 'Mais opções administrativas';
  const moreHeading = 'Mais opções';
  const premiumStatus = String(
    (user as any)?.stripeSubscriptionStatus ||
      (user as any)?.subscriptionStatus ||
      (user as any)?.statusAssinatura ||
      (user as any)?.assinaturaStatus ||
      ''
  ).trim().toLowerCase();
  const hasPremium = Boolean(
    user?.assinatura ||
      user?.planoChatGPT ||
      premiumStatus === 'active' ||
      premiumStatus === 'trialing' ||
      premiumStatus === 'past_due'
  );
  const visibleMoreItems = moreItems.filter((item) => !item.premium || hasPremium);
  const moreActive = visibleMoreItems.some((item) => isCurrentRoute(pathname, item.href));
  const moreGroups = visibleMoreItems.reduce<Array<{ section: string; items: MoreItem[] }>>((groups, item) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.section === item.section) {
      lastGroup.items.push(item);
    } else {
      groups.push({ section: item.section, items: [item] });
    }
    return groups;
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        moreTriggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [moreOpen]);

  return (
    <>
      {moreOpen ? (
        <button
          className="role-bottom-nav-backdrop"
          type="button"
          aria-label="Fechar mais opções de navegação"
          onClick={() => {
            setMoreOpen(false);
            moreTriggerRef.current?.focus();
          }}
        />
      ) : null}
      <nav className={clsx('role-bottom-nav', { 'is-academy': isAcademy, 'is-admin': !isAcademy && !isStudent, 'is-student': isStudent })} aria-label={navLabel}>
        {primaryItems.map((item) => {
          const Icon = item.Icon;
          const active = isCurrentRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx('role-bottom-nav-link', { active })}
              aria-current={active ? 'page' : undefined}
            >
              <span className="role-bottom-nav-icon"><Icon size={20} weight={active ? 'fill' : 'regular'} aria-hidden="true" /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          className={clsx('role-bottom-nav-link role-bottom-nav-more-trigger', { active: moreActive || moreOpen })}
          type="button"
          ref={moreTriggerRef}
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          aria-controls="role-bottom-nav-more"
          onClick={() => setMoreOpen((open) => !open)}
        >
          <span className="role-bottom-nav-icon"><DotsThree size={22} weight="bold" aria-hidden="true" /></span>
          <span>Mais</span>
        </button>
        {moreOpen ? (
          <div
            id="role-bottom-nav-more"
            className="role-bottom-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label={moreLabel}
            tabIndex={-1}
            ref={dialogRef}
          >
            <strong>{moreHeading}</strong>
            <div className="role-bottom-nav-panel-groups">
              {moreGroups.map((group) => (
                <section className="role-bottom-nav-panel-group" key={group.section}>
                  <h3>{group.section}</h3>
                  <div className="role-bottom-nav-panel-links">
                    {group.items.map((item) => {
                      const active = isCurrentRoute(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={clsx({ active })}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => {
                            setMoreOpen(false);
                            moreTriggerRef.current?.focus();
                          }}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : null}
      </nav>
    </>
  );
}
