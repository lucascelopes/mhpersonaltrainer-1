import type { Metadata } from 'next';
import Link from 'next/link';
import BrandLockup from '@/components/BrandLockup';
import styles from './auth-layout.module.css';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    nosnippet: true,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <main className="container auth-grid">
        <aside className="auth-hero">
          <Link href="/" className="auth-brand" aria-label="MH Personal Trainer — início">
            <BrandLockup width={164} height={52} priority />
          </Link>
          <span className="auth-eyebrow">Plataforma completa</span>
          <p className="auth-title">Treinos, avaliações e agenda no mesmo lugar.</p>
          <p className="auth-lead">
            Tudo o que aluno, personal e academia precisam para evoluir: IA para treinos,
            avaliação completa, chat direto e relatórios de progresso.
          </p>
          <div className="auth-pill-row">
            <span className="auth-pill">Web</span>
            <span className="auth-pill">Android</span>
            <span className="auth-pill">iOS em breve</span>
          </div>
          <div className="auth-highlight-grid">
            <div className="auth-highlight-card">
              <strong>Aluno engajado</strong>
              <span>Plano claro, notificações e progresso visível.</span>
            </div>
            <div className="auth-highlight-card">
              <strong>Personal eficiente</strong>
              <span>IA para montar treinos e avaliar rápido.</span>
            </div>
            <div className="auth-highlight-card">
              <strong>Academia no controle</strong>
              <span>Gestão, repasses e indicadores em tempo real.</span>
            </div>
          </div>
        </aside>

        <div className="auth-panel">
          <Link href="/" className={styles.mobileBrand} aria-label="MH Personal Trainer — início">
            <BrandLockup width={150} height={48} surface="theme" priority />
          </Link>
          {children}
          <p className="auth-note">Seus dados ficam protegidos e sincronizados em todos os dispositivos.</p>
        </div>
      </main>
    </div>
  );
}
