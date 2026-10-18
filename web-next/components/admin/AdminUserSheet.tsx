'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { formatDate } from '@/lib/firestoreHooks';
import { firestoreService, type Avaliacao, type PersonalProfile, type Treino } from '@/lib/services/firestoreService';
import styles from './AdminUserSheet.module.css';
import type { User } from '@/lib/types/user';

export type AdminUserSheetSeed = {
  id: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'personal' | 'aluno' | 'academy';
  status?: 'ativo' | 'suspenso';
};

type AdminUserSheetProps = {
  open: boolean;
  userId: string | null;
  seed?: AdminUserSheetSeed | null;
  onClose: () => void;
  onSelectUser?: (userId: string) => void;
};

const roleLabel = (role?: string) => {
  if (role === 'admin') return 'Admin';
  if (role === 'academy') return 'Academia';
  if (role === 'personal') return 'Personal';
  return 'Aluno';
};

const getRole = (user?: User | null, seed?: AdminUserSheetSeed | null) => {
  if (user) {
    return user.admin
      ? 'admin'
      : user.academyAccount
      ? 'academy'
      : user.professorAccount
      ? 'personal'
      : 'aluno';
  }
  return seed?.role || 'aluno';
};

const getStatusLabel = (isSuspended: boolean) => (isSuspended ? 'suspenso' : 'ativo');

export default function AdminUserSheet({
  open,
  userId,
  seed,
  onClose,
  onSelectUser,
}: AdminUserSheetProps) {
  const [user, setUser] = useState<User | null>(null);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [personal, setPersonal] = useState<PersonalProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionSaving, setActionSaving] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      returnFocusRef.current?.focus();
      return;
    }
    const body = document.body;
    const originalOverflow = body.style.overflow;
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      body.style.overflow = originalOverflow;
      if (!open) returnFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable.item(0);
      const last = focusable.item(focusable.length - 1);
      if (!first || !last) {
        event.preventDefault();
        panel.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !userId) return;
    let active = true;
    setLoading(true);
    setDetailsLoading(true);
    setError('');
    setActionError('');
    setUser(null);
    setTreinos([]);
    setAvaliacoes([]);
    setPersonal(null);

    const load = async () => {
      try {
        const doc = await firestoreService.getUserDocument(userId);
        if (!active) return;
        setUser(doc);
        setLoading(false);
        if (!doc) {
          setDetailsLoading(false);
          return;
        }
        const [treinosData, avaliacoesData] = await Promise.all([
          firestoreService.getTreinosDoAluno(userId),
          firestoreService.getAvaliacoesDoAluno(userId),
        ]);
        if (!active) return;
        setTreinos(treinosData || []);
        setAvaliacoes(avaliacoesData || []);
        if (doc.codigoPersonal) {
          const personalProfile = await firestoreService.getPersonalProfileByCode(doc.codigoPersonal);
          if (!active) return;
          setPersonal(personalProfile);
        }
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Erro ao carregar dados do usuário.');
      } finally {
        if (active) {
          setLoading(false);
          setDetailsLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [open, userId]);

  const role = getRole(user, seed);
  const isSuspended = user ? Boolean(user.acessoSuspenso) : seed?.status === 'suspenso';
  const statusLabel = getStatusLabel(isSuspended);
  const displayName = useMemo(() => {
    if (user?.displayName) return user.displayName;
    if (seed?.name) return seed.name;
    if (user?.email) return user.email.split('@')[0];
    if (seed?.email) return seed.email.split('@')[0];
    return 'Usuário';
  }, [seed?.email, seed?.name, user?.displayName, user?.email]);
  const displayEmail = user?.email || seed?.email || '';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';

  const metaRows = useMemo(() => {
    const rows = [
      { label: 'Perfil', value: roleLabel(role) },
      { label: 'Status', value: statusLabel },
      { label: 'UID', value: userId || '-' },
      { label: 'Criado em', value: user?.createdTime ? formatDate(user.createdTime) : '-' },
      { label: 'Último acesso', value: user?.lastActiveTime ? formatDate(user.lastActiveTime) : '-' },
      { label: 'Cidade', value: user?.cidade || '-' },
      { label: 'Estado', value: user?.estado || '-' },
      { label: 'Telefone', value: user?.phoneNumber || '-' },
    ];
    if (role === 'academy') {
      rows.push({
        label: 'Código da academia',
        value: user?.codigoAcademia ? String(user.codigoAcademia) : '-',
      });
    } else {
      rows.push({
        label: 'Código do personal',
        value: user?.codigoPersonal ? String(user.codigoPersonal) : '-',
      });
    }
    return rows;
  }, [
    role,
    statusLabel,
    user?.cidade,
    user?.codigoAcademia,
    user?.codigoPersonal,
    user?.createdTime,
    user?.estado,
    user?.lastActiveTime,
    user?.phoneNumber,
    userId,
  ]);

  const handleToggleStatus = async () => {
    if (!userId) return;
    const willActivate = isSuspended;
    if (!willActivate) {
      const confirmed = window.confirm('Deseja bloquear este usuário?');
      if (!confirmed) return;
    }
    setActionSaving(true);
    setActionError('');
    try {
      await firestoreService.updateStudentStatus(userId, willActivate);
      setUser((prev) => (prev ? { ...prev, acessoSuspenso: !willActivate } : prev));
    } catch (err: any) {
      setActionError(err?.message || 'Erro ao atualizar status do usuário.');
    } finally {
      setActionSaving(false);
    }
  };

  if (!open || !userId || typeof document === 'undefined') return null;

  return createPortal((
    <div className={`admin-user-sheet ${styles.sheet}`}>
      <button
        className="admin-user-sheet-overlay"
        type="button"
        tabIndex={-1}
        aria-label="Fechar perfil do usuário"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="admin-user-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-user-sheet-heading"
        tabIndex={-1}
      >
        <div className="admin-user-sheet-header">
          <div className="admin-user-sheet-title">
            <span className="admin-user-sheet-kicker">Usuário</span>
            <div className="admin-user-sheet-main">
              <div className="admin-user-sheet-avatar">{initial}</div>
              <div className="admin-user-sheet-identity">
                <h3 id="admin-user-sheet-heading">{displayName}</h3>
                <span>{displayEmail || 'Sem email'}</span>
                <div className="admin-user-sheet-badges">
                  <span className="admin-user-sheet-pill is-role">{roleLabel(role)}</span>
                  <span className={`admin-user-sheet-pill ${isSuspended ? 'is-off' : 'is-on'}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="admin-user-sheet-actions">
            <Link href={`/notifications/admin?userId=${userId}`} className="button secondary sm">
              Mensagem
            </Link>
            <button
              type="button"
              className={`button ${isSuspended ? 'secondary' : 'danger'} sm`}
              onClick={handleToggleStatus}
              disabled={actionSaving}
            >
              {actionSaving ? 'Salvando...' : isSuspended ? 'Ativar' : 'Suspender'}
            </button>
            <button ref={closeButtonRef} type="button" className="button secondary sm" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
        {error && <p className="admin-user-sheet-alert">{error}</p>}
        {actionError && <p className="admin-user-sheet-alert">{actionError}</p>}
        <div className="admin-user-sheet-body">
          {!loading && !user && !error ? (
            <p className="subtle">Usuário não encontrado.</p>
          ) : (
            <div className="admin-user-sheet-grid">
              <div className="admin-user-sheet-card">
                <div className="admin-user-sheet-card-header">
                  <h4>Informações</h4>
                  <span className={`admin-user-sheet-pill ${isSuspended ? 'is-off' : 'is-on'}`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="admin-user-sheet-meta">
                  {metaRows.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-user-sheet-stack">
                <div className="admin-user-sheet-card">
                  <div className="admin-user-sheet-card-header">
                    <h4>Personal ativo</h4>
                    {role !== 'aluno' && <span className="admin-user-sheet-pill">Não se aplica</span>}
                  </div>
                  {role !== 'aluno' ? (
                    <p className="subtle">Este usuário não está vinculado como aluno.</p>
                  ) : detailsLoading ? (
                    <p className="subtle">Carregando personal...</p>
                  ) : personal ? (
                    <button
                      type="button"
                      className="admin-user-sheet-personal"
                      onClick={() => onSelectUser?.(personal.uid)}
                    >
                      <div>
                        <strong>{personal.displayName}</strong>
                        <span>{personal.especializacao || 'Personal ativo'}</span>
                        {personal.codigoPersonal && (
                          <small>Código: {String(personal.codigoPersonal)}</small>
                        )}
                      </div>
                      <span className="admin-user-sheet-link">Ver personal</span>
                    </button>
                  ) : user?.nameDoSeuPersonal ? (
                    <div className="admin-user-sheet-empty">
                      <strong>{user.nameDoSeuPersonal}</strong>
                      <span>Sem dados completos do personal.</span>
                    </div>
                  ) : (
                    <p className="subtle">Sem personal vinculado.</p>
                  )}
                </div>

                <div className="admin-user-sheet-card">
                  <div className="admin-user-sheet-card-header">
                    <h4>Treinos recentes</h4>
                    <span className="admin-user-sheet-pill">{treinos.length}</span>
                  </div>
                  {detailsLoading ? (
                    <p className="subtle">Carregando treinos...</p>
                  ) : treinos.length ? (
                    <div className="admin-user-sheet-list">
                      {treinos.slice(0, 6).map((treino) => (
                        <div key={treino.id} className="admin-user-sheet-item">
                          <strong>{treino.nome}</strong>
                          <span>{treino.tipo || 'Treino'}</span>
                          <small>
                            Exercício(s): {treino.exercicios ?? 0} · Último: {formatDate(treino.lastCompletedAt)}
                          </small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="subtle">Nenhum treino encontrado.</p>
                  )}
                </div>

                <div className="admin-user-sheet-card">
                  <div className="admin-user-sheet-card-header">
                    <h4>Avaliações recentes</h4>
                    <span className="admin-user-sheet-pill">{avaliacoes.length}</span>
                  </div>
                  {detailsLoading ? (
                    <p className="subtle">Carregando avaliações...</p>
                  ) : avaliacoes.length ? (
                    <div className="admin-user-sheet-list">
                      {avaliacoes.slice(0, 6).map((avaliacao) => (
                        <div key={avaliacao.id} className="admin-user-sheet-item">
                          <strong>{avaliacao.tipo || 'Avaliação'}</strong>
                          <span>{formatDate(avaliacao.data)}</span>
                          <small>{avaliacao.observacoes || 'Sem observações.'}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="subtle">Nenhuma avaliação encontrada.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {loading && <p className="subtle">Carregando dados do usuário...</p>}
        </div>
      </div>
    </div>
  ), document.body);
}
