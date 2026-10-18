'use client';

import PageShell from '@/components/PageShell';
import AdminGate from '@/components/AdminGate';
import { useAdminDashboardData } from '@/lib/hooks/useAdminDashboardData';
import styles from './page.module.css';

export default function AdminDashboardPage() {
  const { overview, loading, error, refresh } = useAdminDashboardData(true);
  const metrics = [
    ['Usuários', overview?.totalUsers],
    ['Personais', overview?.totalPersonals],
    ['Academias', overview?.totalAcademies],
    ['Administradores', overview?.totalAdmins],
    ['Alunos', overview?.totalAlunos],
  ] as const;

  return (
    <PageShell title="Visão geral do Admin" description="Cadastros por perfil no MH Personal."
      breadcrumbs={[{ label: 'Admin', href: '/admin' }]}>
      <AdminGate>
        <section className={styles.overview} aria-label="Resumo de cadastros" aria-busy={loading}>
          <div className={styles.toolbar}>
            <button type="button" className="button secondary" onClick={() => void refresh()} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar dados'}
            </button>
          </div>
          {error && <p className={styles.error} role="alert">Não foi possível carregar os cadastros. Tente atualizar os dados.</p>}
          <div className={styles.metrics}>
            {metrics.map(([label, value]) => (
              <div className={styles.card} key={label}>
                <h2>{label}</h2>
                <strong>{loading ? '...' : error || value === undefined ? '—' : value}</strong>
              </div>
            ))}
          </div>
        </section>
      </AdminGate>
    </PageShell>
  );
}
