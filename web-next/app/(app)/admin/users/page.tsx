'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import AdminGate from '@/components/AdminGate';
import DataTable from '@/components/data/DataTable';
import AdminUserSheet, { type AdminUserSheetSeed } from '@/components/admin/AdminUserSheet';
import { formatDate, useCollectionData } from '@/lib/firestoreHooks';
import { firestoreService } from '@/lib/services/firestoreService';
import { getUserDisplayRole } from '@/lib/userRole';
import styles from './page.module.css';

interface RawUserRow {
  id: string;
  display_name?: string;
  displayName?: string;
  email?: string;
  admin?: boolean | string | number;
  professorAccount?: boolean | string | number;
  academyAccount?: boolean | string | number;
  created_time?: any;
  createdTime?: any;
  last_active_time?: any;
  lastActiveTime?: any;
  acessoSuspenso?: boolean | string | number;
}

interface UserRow {
  id: string;
  displayName: string;
  email: string;
  role: 'admin' | 'academy' | 'personal' | 'aluno';
  status: 'ativo' | 'suspenso';
  createdTime?: any;
  lastActiveTime?: any;
}

const toBool = (value: any) => value === true || value === 'true' || value === 1;
const roleLabel = (role: UserRow['role']) => {
  if (role === 'admin') return 'Admin';
  if (role === 'academy') return 'Academia';
  if (role === 'personal') return 'Personal';
  return 'Aluno';
};

export default function AdminUsersPage() {
  const { data } = useCollectionData<RawUserRow>(['users']);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRow['role']>('all');
  const [savingId, setSavingId] = useState('');
  const [actionError, setActionError] = useState('');
  const [sheetUser, setSheetUser] = useState<AdminUserSheetSeed | null>(null);

  const rows = useMemo<UserRow[]>(() => {
    return data.map((item) => {
      const email = item.email || '';
      const displayName =
        item.displayName || item.display_name || (email ? email.split('@')[0] : 'Usuário');
      const role = getUserDisplayRole(item);
      const status = toBool(item.acessoSuspenso) ? 'suspenso' : 'ativo';
      return {
        id: item.id,
        displayName,
        email,
        role,
        status,
        createdTime: item.created_time || item.createdTime,
        lastActiveTime: item.last_active_time || item.lastActiveTime,
      };
    });
  }, [data]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (roleFilter !== 'all' && row.role !== roleFilter) return false;
      if (!term) return true;
      return (
        row.displayName.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term) ||
        row.id.toLowerCase().includes(term)
      );
    });
  }, [rows, search, roleFilter]);

  const counts = useMemo(() => {
    const base = { total: rows.length, admins: 0, academias: 0, personals: 0, alunos: 0, suspensos: 0 };
    rows.forEach((row) => {
      if (row.role === 'admin') base.admins += 1;
      if (row.role === 'academy') base.academias += 1;
      if (row.role === 'personal') base.personals += 1;
      if (row.role === 'aluno') base.alunos += 1;
      if (row.status === 'suspenso') base.suspensos += 1;
    });
    return base;
  }, [rows]);

  const handleToggleStatus = async (row: UserRow) => {
    const willActivate = row.status === 'suspenso';
    if (!willActivate) {
      const confirmed = window.confirm('Deseja bloquear este usuário?');
      if (!confirmed) return;
    }
    setSavingId(row.id);
    setActionError('');
    try {
      await firestoreService.updateStudentStatus(row.id, willActivate);
    } catch (error: any) {
      setActionError(error?.message || 'Erro ao atualizar o status do usuário.');
    } finally {
      setSavingId('');
    }
  };

  const openUserSheet = (row: UserRow) => {
    setSheetUser({
      id: row.id,
      name: row.displayName,
      email: row.email,
      role: row.role,
      status: row.status,
    });
  };

  return (
    <PageShell
      title="Usuários"
      description="Visão completa de cadastros, perfis e status."
      breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
    >
      <AdminGate>
        <div className={`grid admin-users-summary ${styles.summary}`}>
          <div className="card">
            <h3>Total</h3>
            <p className="subtle" style={{ marginTop: 8 }}>{counts.total}</p>
          </div>
          <div className="card">
            <h3>Admins</h3>
            <p className="subtle" style={{ marginTop: 8 }}>{counts.admins}</p>
          </div>
          <div className="card">
            <h3>Academias</h3>
            <p className="subtle" style={{ marginTop: 8 }}>{counts.academias}</p>
          </div>
          <div className="card">
            <h3>Personals</h3>
            <p className="subtle" style={{ marginTop: 8 }}>{counts.personals}</p>
          </div>
          <div className="card">
            <h3>Alunos</h3>
            <p className="subtle" style={{ marginTop: 8 }}>{counts.alunos}</p>
          </div>
          <div className="card">
            <h3>Suspensos</h3>
            <p className="subtle" style={{ marginTop: 8 }}>{counts.suspensos}</p>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h3>Usuários cadastrados</h3>
              <p className="subtle" style={{ marginTop: 6 }}>
                Pesquise por nome, e-mail ou UID.
              </p>
            </div>
            <div className={styles.filters}>
              <input
                className={styles.searchInput}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Buscar usuário por nome, e-mail ou UID"
                placeholder="Buscar usuário"
                style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}
              />
              <select
                className={styles.roleSelect}
                aria-label="Filtrar por perfil"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
                style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}
              >
                <option value="all">Todos os perfis</option>
                <option value="admin">Admin</option>
                <option value="academy">Academia</option>
                <option value="personal">Personal</option>
                <option value="aluno">Aluno</option>
              </select>
            </div>
          </div>
          <p className="subtle" style={{ marginTop: 12 }}>
            Mostrando {filteredRows.length} de {rows.length} usuários.
          </p>
          {actionError && (
            <p style={{ marginTop: 12, color: '#c0392b' }}>{actionError}</p>
          )}
          <div className={`admin-users-desktop ${styles.desktop}`}>
            <DataTable
              rows={filteredRows}
              columns={[
                {
                  key: 'displayName',
                  label: 'Usuário',
                  render: (row) => (
                    <div>
                      <strong>{row.displayName}</strong>
                      <p className="subtle" style={{ marginTop: 4 }}>{row.email || row.id}</p>
                    </div>
                  ),
                },
                { key: 'role', label: 'Perfil', render: (row) => roleLabel(row.role) },
                { key: 'status', label: 'Status' },
                { key: 'createdTime', label: 'Criado em', render: (row) => formatDate(row.createdTime) },
                { key: 'lastActiveTime', label: 'Ultimo acesso', render: (row) => formatDate(row.lastActiveTime) },
                {
                  key: 'actions',
                  label: 'Ações',
                  render: (row) => (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link
                        href={`/notifications/admin?userId=${row.id}`}
                        className="button secondary sm"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Mensagem
                      </Link>
                      <button
                        type="button"
                        className={`button ${row.status === 'suspenso' ? 'secondary' : 'danger'} sm`}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleStatus(row);
                        }}
                        disabled={savingId === row.id}
                      >
                        {savingId === row.id ? 'Salvando...' : row.status === 'suspenso' ? 'Ativar' : 'Bloquear'}
                      </button>
                    </div>
                  ),
                },
              ]}
              emptyMessage="Nenhum usuário encontrado."
              onRowClick={openUserSheet}
            />
          </div>
          {filteredRows.length ? (
            <ul className={`admin-users-mobile-list ${styles.mobileList}`} aria-label="Usuários cadastrados">
              {filteredRows.map((row) => (
                <li key={row.id}>
                  <article className="admin-users-mobile-card">
                    <header className="admin-users-mobile-header">
                      <div className="admin-users-mobile-identity">
                        <h4>{row.displayName}</h4>
                        <p>{row.email || row.id}</p>
                      </div>
                      <span className={`admin-users-mobile-status${row.status === 'suspenso' ? ' is-suspended' : ''}`}>
                        {row.status === 'suspenso' ? 'Suspenso' : 'Ativo'}
                      </span>
                    </header>
                    <dl className="admin-users-mobile-fields">
                      <div>
                        <dt>Perfil</dt>
                        <dd>{roleLabel(row.role)}</dd>
                      </div>
                      <div>
                        <dt>Criado em</dt>
                        <dd>{formatDate(row.createdTime)}</dd>
                      </div>
                      <div className="is-wide">
                        <dt>Último acesso</dt>
                        <dd>{formatDate(row.lastActiveTime)}</dd>
                      </div>
                    </dl>
                    <div className="admin-users-mobile-actions">
                      <button type="button" className="button secondary sm" onClick={() => openUserSheet(row)}>
                        Ver perfil
                      </button>
                      <Link href={`/notifications/admin?userId=${row.id}`} className="button secondary sm">
                        Mensagem
                      </Link>
                      <button
                        type="button"
                        className={`button ${row.status === 'suspenso' ? 'secondary' : 'danger'} sm`}
                        onClick={() => handleToggleStatus(row)}
                        disabled={savingId === row.id}
                      >
                        {savingId === row.id ? 'Salvando...' : row.status === 'suspenso' ? 'Ativar' : 'Bloquear'}
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`subtle admin-users-mobile-empty ${styles.mobileEmpty}`}>Nenhum usuário encontrado.</p>
          )}
        </div>
        <AdminUserSheet
          open={Boolean(sheetUser?.id)}
          userId={sheetUser?.id || null}
          seed={sheetUser}
          onClose={() => setSheetUser(null)}
          onSelectUser={(userId) => setSheetUser({ id: userId })}
        />
      </AdminGate>
    </PageShell>
  );
}
