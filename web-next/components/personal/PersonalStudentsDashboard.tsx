'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import './PersonalStudentsDashboard.css';

export type PersonalStudentRow = {
  id: string;
  name: string;
  email?: string;
  photoUrl?: string;
  status?: string;
  createdAt?: Date;
  lastActive?: Date;
};

type PersonalStudentsDashboardProps = {
  students: PersonalStudentRow[];
  total: number;
  active: number;
  inactive: number;
  pending: number;
  personalCode: string;
  inviteLink: string;
  inviteCount: number;
  loading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onCopyLink: () => void;
  onCopyMessage: () => void;
  feedback: string;
};

type Filter = 'todos' | 'ativos' | 'atencao' | 'novos';

function getInitials(value?: string | null) {
  const names = value?.trim().split(/\s+/).filter(Boolean) || [];
  return (names.slice(0, 2).map((name) => name[0]).join('') || 'MH').toUpperCase();
}

function formatActivity(value?: Date) {
  if (!value) return 'Sem treino registrado';
  const days = Math.max(0, Math.floor((Date.now() - value.getTime()) / 86400000));
  if (days === 0) return 'Treino concluído hoje';
  if (days === 1) return 'Treino concluído ontem';
  return `Último treino há ${days} dias`;
}

function statusFor(student: PersonalStudentRow) {
  if (student.status === 'inativo') return { label: 'Inativo', tone: 'attention' };
  if (student.status === 'pendente') return { label: 'Pendente', tone: 'new' };
  return { label: 'Ativo', tone: 'good' };
}

export default function PersonalStudentsDashboard({
  students,
  total,
  active,
  inactive,
  pending,
  personalCode,
  inviteLink,
  inviteCount,
  loading,
  query,
  onQueryChange,
  onCopyLink,
  onCopyMessage,
  feedback,
}: PersonalStudentsDashboardProps) {
  const [filter, setFilter] = useState<Filter>('todos');
  const visibleStudents = useMemo(() => {
    if (filter === 'ativos') return students.filter((student) => student.status === 'ativo');
    if (filter === 'atencao') return students.filter((student) => student.status === 'inativo');
    if (filter === 'novos') return students.filter((student) => student.status === 'pendente');
    return students;
  }, [filter, students]);
  const totalSafe = Math.max(total, students.length);
  const activeSafe = Math.max(active, students.filter((student) => student.status === 'ativo').length);
  const attentionSafe = Math.max(inactive, students.filter((student) => student.status === 'inativo').length);
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const activityByDay = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((label, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const count = students.filter((student) => student.lastActive && student.lastActive.toDateString() === date.toDateString()).length;
    return { label, count };
  });
  const maxActivity = Math.max(0, ...activityByDay.map((day) => day.count));

  const filters: Array<{ key: Filter; label: string; total: number }> = [
    { key: 'todos', label: 'Todos', total: totalSafe },
    { key: 'ativos', label: 'Ativos', total: activeSafe },
    { key: 'atencao', label: 'Inativos', total: attentionSafe },
    { key: 'novos', label: 'Pendentes', total: pending },
  ];

  return (
    <div className="personal-students">
      <div className="personal-students-content">
        <section className="personal-students-heading">
          <div>
            <p>Gestão de alunos</p>
            <h1>Alunos</h1>
            <span>Acompanhe cada pessoa, plano e próximo passo.</span>
          </div>
          <div className="personal-students-heading-side">
            <div className="personal-students-metrics">
              <div><strong>{activeSafe}</strong><span>Alunos ativos</span><small>{activeSafe ? 'com vínculo ativo' : 'Pronto para começar'}</small></div>
              <div><strong>{attentionSafe}</strong><span>Inativos</span><small>{attentionSafe ? 'fora do acompanhamento' : 'nenhum aluno inativo'}</small></div>
              <div><strong>{pending}</strong><span>Pendentes</span><small>{pending ? 'aguardam vínculo' : 'nenhum convite pendente'}</small></div>
            </div>
            <a href="#convite" className="personal-students-invite-top">Convidar aluno</a>
          </div>
        </section>

        <section className="personal-students-main-grid">
          <article className="personal-students-roster">
            <div className="personal-students-section-head">
              <div><h2>Todos os alunos</h2><p>{totalSafe} {totalSafe === 1 ? 'aluno cadastrado' : 'alunos cadastrados'} na sua equipe.</p></div>
              <label className="personal-students-list-search"><span className="sr-only">Filtrar alunos</span><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Nome ou e-mail" /></label>
            </div>
            <div className="personal-students-filters" role="group" aria-label="Filtros de alunos">
              {filters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={filter === item.key ? 'is-active' : ''}
                  aria-pressed={filter === item.key}
                  onClick={() => setFilter(item.key)}
                >
                  {item.label}<span>{item.total}</span>
                </button>
              ))}
            </div>
            {loading ? <p className="personal-students-loading">Carregando alunos...</p> : visibleStudents.length ? (
              <div className="personal-students-table" role="table" aria-label="Lista de alunos">
                <div className="personal-students-table-header" role="row"><span>Aluno</span><span>Plano atual</span><span>Última atividade</span><span>Status</span></div>
                {visibleStudents.map((student) => {
                  const status = statusFor(student);
                  return (
                    <Link
                      href={`/students/${student.id}`}
                      key={student.id}
                      className="personal-students-row"
                      role="row"
                      aria-label={`Ver ficha de ${student.name}`}
                    >
                      <span className="personal-students-person"><i>{student.photoUrl ? <img src={student.photoUrl} alt="" /> : getInitials(student.name)}</i><em><strong>{student.name}</strong><small>{student.email || 'Aluno MH Personal'}</small></em></span>
                      <span className="personal-students-plan"><span className="personal-students-row-label">Plano atual</span><strong>Plano não informado</strong><small>Consulte o perfil do aluno</small></span>
                      <span className="personal-students-activity"><span className="personal-students-row-label">Última atividade</span><strong>{student.lastActive ? 'Último treino registrado' : 'Sem atividade'}</strong><small>{formatActivity(student.lastActive)}</small></span>
                      <span className={`personal-students-status is-${status.tone}`} aria-label={`Status: ${status.label}`}>{status.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="personal-students-empty"><strong>Nenhum aluno encontrado.</strong><span>{totalSafe ? 'Ajuste a busca ou o filtro para ver os alunos da sua equipe.' : 'Use o convite ao lado para trazer o primeiro aluno para a sua equipe.'}</span></div>
            )}
          </article>

          <aside id="convite" className="personal-students-invite">
            <h2>Convide novos alunos</h2>
            <p>Compartilhe seu link para que a pessoa crie a conta já vinculada a você.</p>
            <div className="personal-students-code"><span>Seu código</span><strong>{personalCode || '--'}</strong><small>{inviteCount} {inviteCount === 1 ? 'aluno vinculado' : 'alunos vinculados'} à sua equipe</small></div>
            <label><span>Link de convite</span><input readOnly value={inviteLink || 'Link do app indisponível'} /></label>
            <button type="button" className="personal-students-copy primary" disabled={!inviteLink} onClick={onCopyLink}>Copiar link</button>
            <button type="button" className="personal-students-copy secondary" disabled={!inviteLink} onClick={onCopyMessage}>Copiar mensagem</button>
            {feedback ? <p className="personal-students-feedback" role="status">{feedback}</p> : null}
            <div className="personal-students-tip"><strong>Dica</strong><span>Compartilhe o convite nas redes ou envie diretamente para a pessoa começar com você.</span></div>
          </aside>
        </section>

        <section className="personal-students-insights">
          <div className="personal-students-chart-copy"><h2>Último treino registrado</h2><p>Distribuição dos registros mais recentes nesta semana.</p></div>
          <div className="personal-students-chart" role="img" aria-label="Últimos registros de treino por dia nesta semana">
            {maxActivity ? activityByDay.map((day) => <div key={day.label}><i style={{ height: `${day.count ? Math.max(12, (day.count / maxActivity) * 92) : 0}%` }} /><span>{day.label}</span><small>{day.count || ''}</small></div>) : <div className="personal-students-chart-empty">Sem registros de treino nesta semana.</div>}
          </div>
          <div className="personal-students-observations"><h2>Principais observações</h2><p>{activeSafe ? `${activeSafe} ${activeSafe === 1 ? 'aluno segue' : 'alunos seguem'} em acompanhamento ativo.` : 'Convide seu primeiro aluno para iniciar a carteira.'}</p><p>{attentionSafe ? `${attentionSafe} ${attentionSafe === 1 ? 'aluno precisa' : 'alunos precisam'} de uma ação sua.` : 'Nenhuma pendência de retorno no momento.'}</p></div>
        </section>
      </div>
    </div>
  );
}
