'use client';

import Link from 'next/link';
import PageShell from '@/components/PageShell';
import AdminGate from '@/components/AdminGate';
import styles from './page.module.css';

export default function AdminManageStudentsPage() {
  return (
    <PageShell
      title="Gerenciar alunos"
      description="Consulte cadastros e gerencie o acesso dos alunos."
      breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
    >
      <AdminGate>
        <div className={`card ${styles.card}`}>
          <h2 className={styles.heading}>Alunos no MH Personal</h2>
          <p className={styles.description}>
            Consulte os alunos cadastrados ou abra o diretório para conferir o perfil e o acesso de cada pessoa.
          </p>
          <div className={styles.actions}>
            <Link className={`button ${styles.action}`} href="/admin/students">
              Ver alunos cadastrados
            </Link>
            <Link className={`button secondary ${styles.action}`} href="/admin/users">
              Gerenciar acessos
            </Link>
          </div>
          <p className={styles.notice}>
            A aprovação de novos alunos ainda não está disponível aqui. Nenhum cadastro é alterado nesta página.
          </p>
        </div>
      </AdminGate>
    </PageShell>
  );
}
