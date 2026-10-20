'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { QueryConstraint } from 'firebase/firestore';
import PageShell from '@/components/PageShell';
import AdminGate from '@/components/AdminGate';
import DataTable from '@/components/data/DataTable';
import { formatDate, useCollectionData } from '@/lib/firestoreHooks';
import { getUserDisplayRole } from '@/lib/userRole';
import styles from './page.module.css';

interface UserRow {
  id: string;
  display_name?: string;
  displayName?: string;
  email?: string;
  admin?: boolean | string | number;
  professorAccount?: boolean | string | number;
  academyAccount?: boolean | string | number;
  acessoSuspenso?: boolean | string | number;
  created_time?: any;
  createdTime?: any;
}

const toBool = (value: any) => value === true || value === 'true' || value === 1;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const EMPTY_QUERY_CONSTRAINTS: QueryConstraint[] = [];

export default function AdminStudentsPage() {
  const { data, loading, error } = useCollectionData<UserRow>(['users'], EMPTY_QUERY_CONSTRAINTS);
  const [search, setSearch] = useState('');
  const students = useMemo(() => data.flatMap((user) => {
    if (getUserDisplayRole(user) !== 'aluno') return [];

    return [{
      ...user,
      displayName: user.displayName || user.display_name || user.email?.split('@')[0] || 'Aluno sem nome',
      accessLabel: toBool(user.acessoSuspenso) ? 'Suspenso' : 'Ativo',
      createdTime: user.created_time || user.createdTime,
    }];
  }), [data]);
  const filteredStudents = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return students;
    return students.filter((student) => normalize(`${student.displayName} ${student.email || ''}`).includes(term));
  }, [search, students]);

  return (
    <PageShell
      title="Gerenciamento de alunos"
      description="Consulte nome, e-mail, acesso e data de cadastro dos alunos."
      breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
    >
      <AdminGate>
        <div className={`card ${styles.card}`}>
          {loading ? <p role="status">Carregando alunos...</p> : null}
          {error ? <p role="alert">Não foi possível carregar os alunos. Tente novamente mais tarde.</p> : null}
          {!loading && !error ? (
            <>
              <div className={styles.toolbar}>
                <p className={styles.count}>{filteredStudents.length} de {students.length} alunos</p>
                <label className={styles.searchLabel}>
                  Buscar aluno
                  <input
                    className={styles.searchInput}
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nome ou e-mail"
                  />
                </label>
              </div>
              {filteredStudents.length ? (
                <>
                  <div className={styles.desktop}>
                    <DataTable
                      rows={filteredStudents}
                      columns={[
                        { key: 'displayName', label: 'Aluno', render: (row) => (
                          <Link className={styles.rowLink} href={`/admin/student/${encodeURIComponent(row.id)}`}>
                            {row.displayName}
                          </Link>
                        ) },
                        { key: 'email', label: 'Email' },
                        { key: 'accessLabel', label: 'Acesso' },
                        { key: 'createdTime', label: 'Criado em', render: (row) => formatDate(row.createdTime) },
                      ]}
                    />
                  </div>
                  <ul className={styles.mobileList} aria-label="Alunos cadastrados">
                    {filteredStudents.map((student) => (
                      <li key={student.id}>
                        <article className={styles.mobileCard}>
                          <h3>{student.displayName}</h3>
                          <dl className={styles.fields}>
                            <div className={`${styles.field} ${styles.wide}`}>
                              <dt>Email</dt>
                              <dd>{student.email || 'Não informado'}</dd>
                            </div>
                            <div className={styles.field}>
                              <dt>Acesso</dt>
                              <dd>{student.accessLabel}</dd>
                            </div>
                            <div className={styles.field}>
                              <dt>Criado em</dt>
                              <dd>{formatDate(student.createdTime)}</dd>
                            </div>
                          </dl>
                          <Link
                            className={styles.cardLink}
                            href={`/admin/student/${encodeURIComponent(student.id)}`}
                            aria-label={`Ver ficha de ${student.displayName}`}
                          >
                            Ver ficha do aluno
                          </Link>
                        </article>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className={styles.empty} role="status">
                  {students.length ? 'Nenhum aluno corresponde à busca.' : 'Nenhum aluno cadastrado.'}
                </p>
              )}
            </>
          ) : null}
        </div>
      </AdminGate>
    </PageShell>
  );
}
