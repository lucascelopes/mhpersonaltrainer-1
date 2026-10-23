'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Aluno } from '@/lib/services/firestoreService';
import type { UserWorkout } from '@/lib/types/workout';
import type { FeedbackItem } from '@/lib/types/feedback';
import './PersonalWorkoutsDashboard.css';

type Props = {
  students: Aluno[];
  selectedStudent: Aluno | null;
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  studentQuery: string;
  onStudentQueryChange: (query: string) => void;
  workouts: UserWorkout[];
  loadingWorkouts: boolean;
  feedbacks: FeedbackItem[];
  onAssistant: (prompt: string) => void;
};

const weekday = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const initials = (value?: string) =>
  (value || 'MH')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

const displayDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(date)
    .replace('.', '');

const workoutDuration = (workout: UserWorkout) => {
  const intervals = Array.isArray(workout.intervalo) ? workout.intervalo.length : 0;
  return intervals ? `${intervals * 2} min` : 'Tempo livre';
};

const workoutExercises = (workout: UserWorkout) => Array.isArray(workout.treino) ? workout.treino.length : 0;

const isCompleted = (workout: UserWorkout) => Boolean(workout.lastCompletedAt);

export default function PersonalWorkoutsDashboard({
  students,
  selectedStudent,
  selectedStudentId,
  onSelectStudent,
  studentQuery,
  onStudentQueryChange,
  workouts,
  loadingWorkouts,
  feedbacks,
  onAssistant,
}: Props) {
  const filteredStudents = useMemo(() => {
    const term = studentQuery.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) =>
      `${student.nome} ${student.email}`.toLowerCase().includes(term)
    );
  }, [studentQuery, students]);

  const visibleStudents = useMemo(() => {
    if (!selectedStudent || filteredStudents.some((student) => student.id === selectedStudent.id)) return filteredStudents;
    return [selectedStudent, ...filteredStudents];
  }, [filteredStudents, selectedStudent]);

  const week = useMemo(() => {
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    return weekday.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const matchingWorkout = selectedStudent ? workouts.find((workout) => {
        const assignedDays = (workout.diasDaSemana || []).join(' ').toLowerCase();
        return assignedDays.includes(label.toLowerCase());
      }) : undefined;
      return { label, date, workout: matchingWorkout };
    });
  }, [selectedStudent, workouts]);

  const completedCount = workouts.filter(isCompleted).length;
  const completedByDay = week.map((day) => workouts.filter((workout) => workout.lastCompletedAt?.toDateString() === day.date.toDateString()).length);
  const maxCompletedByDay = Math.max(0, ...completedByDay);
  const feedback = selectedStudent ? feedbacks.find((item) => item.yourName === selectedStudent.nome) : undefined;
  const firstName = selectedStudent?.nome?.split(' ')[0] || 'seu aluno';

  return (
    <div className="personal-workouts-page">
      <section className="personal-workouts-hero">
        <div>
          <p className="personal-workouts-kicker">PLANEJAMENTO DE TREINO</p>
          <h1>Treinos</h1>
          <p>Organize a semana e acompanhe cada evolução.</p>
        </div>
        <Link href="/workout/create" className="personal-workouts-primary">Criar treino</Link>
      </section>

      <section className="personal-workouts-focus">
        <div className="personal-workouts-board">
          <div className="personal-workouts-student-select">
            <div className="personal-workouts-avatar large">
              {selectedStudent?.photoUrl ? <img src={selectedStudent.photoUrl} alt="" /> : <span>{initials(selectedStudent?.nome)}</span>}
            </div>
            <div className="personal-workouts-student-copy">
              <strong>{selectedStudent?.nome || 'Selecione um aluno'}</strong>
              <span>{selectedStudent ? `${selectedStudent.treinosConcluidos} treinos concluídos` : 'Escolha uma pessoa para montar o plano.'}</span>
            </div>
            <label className="sr-only" htmlFor="workouts-student-select">Trocar aluno</label>
            <select
              id="workouts-student-select"
              value={selectedStudentId}
              onChange={(event) => onSelectStudent(event.target.value)}
              disabled={!visibleStudents.length}
            >
              {!visibleStudents.length && <option value="">Nenhum aluno ativo</option>}
              {visibleStudents.map((student) => <option key={student.id} value={student.id}>{student.nome}</option>)}
            </select>
          </div>

          <div className="personal-workouts-week-card">
            <div className="personal-workouts-week-head">
              <div>
                <h2>Semana de treino</h2>
                <p>{selectedStudent ? `Plano ativo de ${firstName}` : 'Organize os treinos programados ao longo da semana.'}</p>
              </div>
              {selectedStudent && <span>{`${completedCount} concluído${completedCount === 1 ? '' : 's'}`}</span>}
            </div>
            <div className={`personal-workouts-week-grid${selectedStudent ? '' : ' is-empty'}`}>
              {selectedStudent ? week.map(({ label, date, workout }) => (
                <article key={label} className={`personal-workouts-day${workout ? '' : ' is-rest'}${date.toDateString() === new Date().toDateString() ? ' is-today' : ''}`}>
                  <small>{label}<em>{displayDate(date)}</em></small>
                  {workout ? (
                    <Link href={`/workout/${workout.id}?studentId=${selectedStudentId}`}>
                      <strong>{workout.nomeDoTreino || 'Treino'}</strong>
                      <span>{workoutExercises(workout)} exercícios</span>
                      <footer>{workoutDuration(workout)} {isCompleted(workout) && <b>Concluído</b>}</footer>
                    </Link>
                  ) : loadingWorkouts ? (
                    <div><strong>Carregando…</strong><span>Buscando o plano deste aluno.</span></div>
                  ) : (
                    <div><strong>Sem treino</strong><span>Nenhuma rotina programada para este dia.</span></div>
                  )}
                </article>
              )) : (
                <div className="personal-workouts-week-empty" role="status">
                  <strong>Nenhum aluno selecionado</strong>
                  <span>O plano semanal aparecerá aqui depois da seleção.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="personal-workouts-assistant">
          <p className="personal-workouts-assistant-label">MH Assistente</p>
          <h2>Um próximo treino mais preciso.</h2>
          <p>Use os objetivos e o ritmo de {firstName} para começar uma rotina personalizada.</p>
          <div className="personal-workouts-assistant-note">
            <strong>Sugestão para a semana</strong>
            <span>{selectedStudent ? 'Monte um treino equilibrado e ajuste o volume conforme a evolução.' : 'Escolha um aluno para receber uma sugestão personalizada.'}</span>
          </div>
          <button type="button" onClick={() => onAssistant(`Monte um treino semanal para ${selectedStudent?.nome || 'um aluno'}, com base nos objetivos e no histórico.`)}>
            Criar com assistente
          </button>
          <Link href="/workout/create">Criar manualmente</Link>
        </aside>
      </section>

      <section className="personal-workouts-recent">
        <div className="personal-workouts-section-heading">
          <div>
            <p className="personal-workouts-kicker">ACOMPANHAMENTO</p>
            <h2>Últimos treinos de {firstName}</h2>
          </div>
          {selectedStudent && <Link href={`/students/${selectedStudent.id}`}>Ver perfil</Link>}
        </div>
        {loadingWorkouts ? (
          <p className="personal-workouts-empty">Carregando os treinos do aluno.</p>
        ) : workouts.length ? (
          <div className="personal-workouts-recent-list">
            {workouts.slice(0, 4).map((workout) => (
              <Link key={workout.id} href={`/workout/${workout.id}?studentId=${selectedStudentId}`} className="personal-workouts-recent-item">
                <strong>{workout.nomeDoTreino || 'Treino'}</strong>
                <span>{workoutExercises(workout)} exercícios · {workoutDuration(workout)}</span>
                <small className={isCompleted(workout) ? 'is-completed' : ''}>{isCompleted(workout) ? 'Concluído' : 'Programado'}</small>
              </Link>
            ))}
          </div>
        ) : (
          <p className="personal-workouts-empty">{selectedStudent ? 'Nenhum treino disponível ainda. Crie a primeira rotina para este aluno.' : 'Selecione um aluno para consultar os treinos recentes.'}</p>
        )}
      </section>

      <section className="personal-workouts-footer-strip">
        <div>
          <p className="personal-workouts-kicker">VISÃO DO PERSONAL</p>
          <h2>Ritmo de acompanhamento</h2>
          <p>Os treinos concluídos e os retornos dos alunos aparecem aqui conforme a carteira evolui.</p>
        </div>
        <div className="personal-workouts-bars" aria-label="Atividade semanal">
          {maxCompletedByDay ? completedByDay.map((count, index) => <i key={weekday[index]} style={{ height: `${count ? Math.max(14, (count / maxCompletedByDay) * 86) : 0}%` }}><span>{weekday[index]}{count ? ` · ${count}` : ''}</span></i>) : <p className="personal-workouts-bars-empty">Sem treinos concluídos nesta semana.</p>}
        </div>
        <div className="personal-workouts-feedback">
          <strong>{feedback?.yourName || (selectedStudent ? 'Sem feedback pendente' : 'Selecione um aluno')}</strong>
          <span>{feedback?.comentarioDoAluno || (selectedStudent ? 'Quando o aluno concluir treinos, os retornos aparecerão neste espaço.' : 'O acompanhamento semanal aparecerá quando houver um aluno selecionado.')}</span>
        </div>
      </section>
    </div>
  );
}
