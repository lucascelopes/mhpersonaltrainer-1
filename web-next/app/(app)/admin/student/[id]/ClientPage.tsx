'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageShell from '@/components/PageShell';
import AdminGate from '@/components/AdminGate';
import { formatDate, useDocumentData } from '@/lib/firestoreHooks';
import { getUserDisplayRole } from '@/lib/userRole';
import styles from './page.module.css';

type StudentDoc = {
  id: string;
  display_name?: string;
  displayName?: string;
  email?: string;
  phone_number?: string;
  phoneNumber?: string;
  cidade?: string;
  estado?: string;
  objetivoNoApp?: string;
  created_time?: unknown;
  createdTime?: unknown;
  alunoDesde?: unknown;
  last_active_time?: unknown;
  acessoSuspenso?: boolean | string | number;
  admin?: boolean | string | number;
  professorAccount?: boolean | string | number;
  academyAccount?: boolean | string | number;
};

const isTrue = (value: boolean | string | number | undefined) =>
  value === true || value === 'true' || value === 1;

export default function AdminStudentDetailPage({ params }: { params: { id: string } }) {
  const pathname = usePathname();
  const studentId = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    return last && last !== 'student' ? last : params.id;
  }, [pathname, params.id]);

  return (
    <PageShell
      title="Ficha do aluno"
      description="Dados de cadastro e acesso para consulta no painel admin."
      breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Alunos', href: '/admin/students' }]}
      actions={[{ label: 'Voltar para alunos', href: '/admin/students' }]}
    >
      <AdminGate>
        <StudentDetails studentId={studentId} />
      </AdminGate>
    </PageShell>
  );
}

function StudentDetails({ studentId }: { studentId: string }) {
  const { data, loading, error } = useDocumentData<StudentDoc>(['users', studentId]);
  const isStudent = data && getUserDisplayRole(data) === 'aluno';
  const name = data?.displayName || data?.display_name || data?.email?.split('@')[0] || 'Aluno sem nome';
  const joinedAt = data?.alunoDesde || data?.created_time || data?.createdTime;
  const location = [data?.cidade, data?.estado].filter(Boolean).join(' · ');

  return (
    <>
        {loading ? (
          <div className={styles.state} role="status">Carregando ficha do aluno...</div>
        ) : error ? (
          <div className={styles.state} role="alert">
            Não foi possível carregar esta ficha. Tente novamente mais tarde.
          </div>
        ) : !data ? (
          <div className={styles.state} role="status">
            <h2>Aluno não encontrado</h2>
            <p>Confira a lista de alunos cadastrados.</p>
            <Link href="/admin/students" className={styles.stateLink}>Ver alunos</Link>
          </div>
        ) : !isStudent ? (
          <div className={styles.state} role="status">
            <h2>Este perfil não é de aluno</h2>
            <p>Consulte o diretório de usuários para ver outros tipos de conta.</p>
            <Link href="/admin/users" className={styles.stateLink}>Ver usuários</Link>
          </div>
        ) : (
          <div className={styles.content}>
            <section className={styles.hero} aria-labelledby="student-name">
              <div className={styles.avatar} aria-hidden="true">{name.trim().charAt(0).toUpperCase()}</div>
              <div className={styles.heroText}>
                <span className={styles.eyebrow}>Cadastro do aluno</span>
                <h2 id="student-name">{name}</h2>
                <p>{data.email || 'E-mail não informado'}</p>
              </div>
              <span className={`${styles.status} ${isTrue(data.acessoSuspenso) ? styles.suspended : styles.active}`}>
                {isTrue(data.acessoSuspenso) ? 'Acesso suspenso' : 'Acesso ativo'}
              </span>
            </section>

            <section className={styles.card} aria-labelledby="registration-title">
              <div className={styles.sectionHead}>
                <h3 id="registration-title">Dados de cadastro</h3>
                <p>Informações de leitura. Nenhuma alteração é feita nesta tela.</p>
              </div>
              <dl className={styles.fields}>
                <div><dt>E-mail</dt><dd>{data.email || 'Não informado'}</dd></div>
                <div><dt>Telefone</dt><dd>{data.phone_number || data.phoneNumber || 'Não informado'}</dd></div>
                <div><dt>Localidade</dt><dd>{location || 'Não informada'}</dd></div>
                <div><dt>Objetivo</dt><dd>{data.objetivoNoApp || 'Não informado'}</dd></div>
                <div><dt>Cadastro</dt><dd>{formatDate(joinedAt)}</dd></div>
                <div><dt>Última atividade</dt><dd>{formatDate(data.last_active_time)}</dd></div>
              </dl>
            </section>
          </div>
        )}
    </>
  );
}
