'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import UserScopePicker from '@/components/data/UserScopePicker';
import { useUserScope } from '@/lib/firestoreHooks';
import { fetchAppointments } from '@/lib/services/scheduling';
import { fetchUserWorkouts } from '@/lib/services/workouts';
import { fetchEvaluations, fetchEvaluationsForStudents, getEvaluationTypeLabel } from '@/lib/services/evaluations';
import { firestoreService, type Aluno } from '@/lib/services/firestoreService';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Appointment, AppointmentStatus, AppointmentType } from '@/lib/types/scheduling';
import type { PhysicalEvaluation } from '@/lib/types/evaluation';
import type { UserWorkout } from '@/lib/types/workout';
import { CalendarBlank, CaretLeft, CaretRight, Clock, FunnelSimple, Plus, TrendUp } from '@phosphor-icons/react';
import styles from './schedule.module.css';

const FILTER_OPTIONS: { id: AppointmentType | null; label: string }[] = [
  { id: null, label: 'Todos' },
  { id: 'treino', label: 'Treino' },
  { id: 'avaliacao', label: 'Avaliação' },
  { id: 'consulta', label: 'Consulta' },
];

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const TYPE_LABELS: Record<AppointmentType, string> = {
  treino: 'Treino',
  avaliacao: 'Avaliação',
  consulta: 'Consulta',
  acompanhamento: 'Acompanhamento',
  online: 'Online',
  presencial: 'Presencial',
};

const STATUS_LABELS: Record<string, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  reagendado: 'Reagendado',
  nao_compareceu: 'Não compareceu',
};

type AgendaSource = 'appointment' | 'workout' | 'evaluation';

type AgendaItem = Appointment & {
  source: AgendaSource;
  route?: string;
};

const mapEvaluationStatus = (status: string): AppointmentStatus => {
  const normalized = String(status || '').toLowerCase();
  switch (normalized) {
    case 'agendada':
      return 'agendado';
    case 'em_andamento':
      return 'em_andamento';
    case 'concluida':
      return 'concluido';
    case 'cancelada':
    case 'nao_realizada':
      return 'cancelado';
    default:
      return 'agendado';
  }
};

const buildWorkoutRoute = (workoutId: string, studentId?: string) =>
  studentId ? `/workout/${workoutId}?studentId=${studentId}` : `/workout/${workoutId}`;

const buildWorkoutAppointment = (
  workout: UserWorkout,
  student: Aluno | null,
  personalId: string
): AgendaItem | null => {
  const appointmentDate =
    workout.data || workout.createdAt || workout.updatedAt || workout.lastCompletedAt;
  if (!appointmentDate) return null;
  return {
    id: `workout-${student?.id ?? personalId}-${workout.id}`,
    alunoId: student?.id ?? personalId,
    personalId,
    alunoNome: student?.nome,
    personalNome: undefined,
    data: appointmentDate,
    horaInicio: '',
    horaFim: '',
    tipo: 'treino',
    status: workout.lastCompletedAt ? 'concluido' : 'agendado',
    servico: workout.nomeDoTreino || 'Treino',
    observacoes: workout.obsInstrucao,
    createdAt: workout.createdAt || appointmentDate,
    updatedAt: workout.updatedAt,
    source: 'workout',
    route: buildWorkoutRoute(workout.id, student?.id),
  };
};

const resolveEvaluationDate = (evaluation: PhysicalEvaluation): Date => {
  if (evaluation.type === 'personalizada') {
    const prazo = (evaluation as PhysicalEvaluation & { prazoResposta?: Date | null }).prazoResposta;
    if (prazo) return prazo;
  }
  return evaluation.date || evaluation.createdAt || new Date();
};

const buildEvaluationAppointment = (
  evaluation: PhysicalEvaluation,
  student: Aluno | null,
  personalId: string
): AgendaItem => {
  const appointmentDate = resolveEvaluationDate(evaluation);
  const query = new URLSearchParams({ type: evaluation.type });
  if (evaluation.userId) {
    query.set('userId', evaluation.userId);
  }
  return {
    id: `evaluation-${student?.id ?? personalId}-${evaluation.id}`,
    alunoId: student?.id ?? personalId,
    personalId,
    alunoNome: student?.nome,
    personalNome: undefined,
    data: appointmentDate,
    horaInicio: '',
    horaFim: '',
    tipo: 'avaliacao',
    status: mapEvaluationStatus(evaluation.status),
    servico: getEvaluationTypeLabel(evaluation.type),
    createdAt: evaluation.createdAt || appointmentDate,
    updatedAt: evaluation.updatedAt,
    source: 'evaluation',
    route: `/evaluations/${evaluation.id}?${query.toString()}`,
  };
};

const sortAgendaItems = (items: AgendaItem[]) =>
  [...items].sort((a, b) => {
    const dateDiff = a.data.getTime() - b.data.getTime();
    if (dateDiff !== 0) return dateDiff;
    return (a.horaInicio || '').localeCompare(b.horaInicio || '');
  });

const parseDateParam = (value?: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map((part) => Number(part));
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

const formatMonthYear = (date: Date) =>
  date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

const formatSelectedDate = (date: Date) =>
  date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

const formatShortDate = (date: Date) =>
  date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

const getWeekStart = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
};

const getMinutes = (time: string) => {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour < 24 && minute < 60 ? hour * 60 + minute : null;
};

const HOUR_HEIGHT = 38;

const layoutDayEvents = (items: AgendaItem[]) => {
  type Positioned = { item: AgendaItem; lane: number; lanes: number };
  const sorted = [...items].sort(
    (a, b) => (getMinutes(a.horaInicio || '') ?? 0) - (getMinutes(b.horaInicio || '') ?? 0)
  );
  const result: Positioned[] = [];
  let group: Positioned[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;

  const flush = () => {
    group.forEach((entry) => { entry.lanes = laneEnds.length; });
    result.push(...group);
    group = [];
    laneEnds = [];
    groupEnd = -1;
  };

  sorted.forEach((item) => {
    const start = getMinutes(item.horaInicio || '') ?? 0;
    const end = Math.max(start + 30, getMinutes(item.horaFim || '') ?? start + 60);
    if (group.length && start >= groupEnd) flush();
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = end;
    groupEnd = Math.max(groupEnd, end);
    group.push({ item, lane, lanes: 1 });
  });
  if (group.length) flush();
  return result;
};

const getItemTone = (type: AppointmentType) => {
  if (type === 'avaliacao') return styles.evaluation;
  if (type === 'consulta') return styles.consultation;
  return styles.training;
};

const getItemContext = (item: AgendaItem, isStudent: boolean) => {
  const parts = isStudent
    ? [item.servico, item.personalNome]
    : [item.alunoNome, item.servico];
  const uniqueParts = [...new Set(parts.map((part) => part?.trim()).filter(Boolean))];
  return uniqueParts.join(' · ') || TYPE_LABELS[item.tipo] || 'Compromisso';
};

type ViewMode = 'week' | 'month';

export default function SchedulePage() {
  const { userId } = useUserScope();
  const { user, role } = useAuth();
  const isStudent = role === 'aluno';
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const weekHeaderScrollRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const errors: string[] = [];
      const isPersonal = role === 'personal' || role === 'professor' || role === 'admin';
      const scopedUserId = isPersonal ? user?.uid : userId;
      if (!scopedUserId) {
        setAgendaItems([]);
        setLoading(false);
        setHydrating(false);
        return;
      }
      setLoading(true);
      setHydrating(true);
      setError('');
      const baseResult = await fetchAppointments(scopedUserId, isPersonal);
      if (baseResult.error) errors.push(baseResult.error);
      const baseItems: AgendaItem[] = (baseResult.data || []).map((appointment) => ({
        ...appointment,
        source: 'appointment',
        route: `/schedule/${appointment.id}`,
      }));

      if (!active) return;
      setAgendaItems(baseItems);
      setLoading(false);

      let workoutItems: AgendaItem[] = [];
      let evaluationItems: AgendaItem[] = [];

      if (isPersonal) {
        const students = await firestoreService.getAlunosDoPersonal(scopedUserId);
        const studentMap = new Map<string, Aluno>();
        students.forEach((student) => studentMap.set(student.id, student));
        const studentIds = students.map((student) => student.id);
        const workoutResults = await Promise.all(
          students.map(async (student) => ({
            student,
            result: await fetchUserWorkouts(student.id, false),
          }))
        );
        workoutItems = workoutResults
          .flatMap(({ student, result }) => {
            if (result.error) errors.push(result.error);
            return (result.data || [])
              .map((workout) => buildWorkoutAppointment(workout, student, scopedUserId))
              .filter(Boolean);
          })
          .filter(Boolean) as AgendaItem[];

        const evaluationsResult = await fetchEvaluationsForStudents(studentIds);
        if (evaluationsResult.error) errors.push(evaluationsResult.error);
        evaluationItems = (evaluationsResult.data || []).map((evaluation) =>
          buildEvaluationAppointment(
            evaluation,
            studentMap.get(evaluation.userId) || null,
            scopedUserId
          )
        );
      } else {
        const [workoutsResult, evaluationsResult] = await Promise.all([
          fetchUserWorkouts(scopedUserId, false),
          fetchEvaluations(scopedUserId),
        ]);
        if (workoutsResult.error) errors.push(workoutsResult.error);
        if (evaluationsResult.error) errors.push(evaluationsResult.error);
        workoutItems = (workoutsResult.data || [])
          .map((workout) => buildWorkoutAppointment(workout, null, scopedUserId))
          .filter(Boolean) as AgendaItem[];
        evaluationItems = (evaluationsResult.data || []).map((evaluation) =>
          buildEvaluationAppointment(evaluation, null, scopedUserId)
        );
      }

      if (!active) return;
      const merged = sortAgendaItems([...baseItems, ...workoutItems, ...evaluationItems]);
      setAgendaItems(merged);
      setError(errors.join(' | '));
      setHydrating(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [role, user?.uid, userId]);

  useEffect(() => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate, viewMode]);

  useEffect(() => {
    const paramDate = parseDateParam(dateParam);
    if (!paramDate) return;
    setSelectedDate(paramDate);
  }, [dateParam]);

  const appointmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    agendaItems.forEach((item) => {
      if (!item?.data) return;
      const key = getDateKey(item.data);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [agendaItems]);

  const filteredAppointments = useMemo(() => {
    const key = getDateKey(selectedDate);
    const items = agendaItems.filter((item) => {
      if (!item?.data) return false;
      if (getDateKey(item.data) !== key) return false;
      if (selectedFilter && item.tipo !== selectedFilter) return false;
      return true;
    });
    return sortAgendaItems(items);
  }, [agendaItems, selectedDate, selectedFilter]);

  const weekDays = useMemo(() => {
    const start = getWeekStart(selectedDate);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [selectedDate]);

  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  useEffect(() => {
    if (viewMode !== 'week') return;
    const container = weekHeaderScrollRef.current;
    const selected = container?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    if (!container || !selected) return;
    const containerRect = container.getBoundingClientRect();
    const selectedRect = selected.getBoundingClientRect();
    if (selectedRect.left < containerRect.left) {
      container.scrollLeft += selectedRect.left - containerRect.left;
    } else if (selectedRect.right > containerRect.right) {
      container.scrollLeft += selectedRect.right - containerRect.right;
    }
  }, [selectedDate, viewMode]);
  const weekItems = useMemo(() => {
    const startKey = getDateKey(weekStart);
    const endKey = getDateKey(weekEnd);
    return agendaItems.filter((item) => {
      const key = getDateKey(item.data);
      return key >= startKey && key <= endKey;
    });
  }, [agendaItems, weekStart, weekEnd]);

  const timedWeekItems = useMemo(
    () => weekItems.filter((item) =>
      getMinutes(item.horaInicio || '') !== null && (!selectedFilter || item.tipo === selectedFilter)
    ),
    [weekItems, selectedFilter]
  );
  const unscheduledDayItems = filteredAppointments.filter(
    (item) => getMinutes(item.horaInicio || '') === null
  );
  const nextAppointment = filteredAppointments.find((item) => {
    const minutes = getMinutes(item.horaInicio || '');
    if (minutes === null) return false;
    if (!isSameDay(selectedDate, new Date())) return true;
    const now = new Date();
    return minutes >= now.getHours() * 60 + now.getMinutes();
  });
  const weekCount = (type: AppointmentType) => weekItems.filter((item) => item.tipo === type).length;
  const weekRange = `${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)} ${weekEnd.getFullYear()}`;
  const selectedWeekday = selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dayTitle = isSameDay(selectedDate, new Date())
    ? 'Hoje, ' + selectedWeekday
    : selectedWeekday;
  const nextRelativeLabel = (() => {
    if (!nextAppointment || !isSameDay(selectedDate, new Date())) return '';
    const startMinutes = getMinutes(nextAppointment.horaInicio || '');
    if (startMinutes === null) return '';
    const now = new Date();
    const minutes = Math.max(0, startMinutes - now.getHours() * 60 - now.getMinutes());
    if (minutes < 60) return 'Em ' + minutes + ' min';
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return 'Em ' + hours + ' h' + (remainder ? ' e ' + remainder + ' min' : '');
  })();

  const getDayCount = (date: Date) => {
    const key = getDateKey(date);
    return appointmentCounts[key] || 0;
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handlePreviousMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() - 1);
    setCurrentMonth(next);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const handlePreviousWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 7);
    setSelectedDate(next);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
  };

  const renderMonth = () => (
    <div className={styles.monthScroll}>
      <div className={styles.monthGrid}>
      {DAY_LABELS.slice(1).concat(DAY_LABELS[0]).map((label) => (
        <span key={label} className={styles.monthWeekday}>{label}</span>
      ))}
      {Array.from({ length: (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 6) % 7 }, (_, index) => (
        <span key={`blank-${index}`} className={styles.monthBlank} />
      ))}
      {getMonthDays(currentMonth).filter((day): day is Date => day !== null).map((day) => (
        <button
          key={getDateKey(day)}
          type="button"
          className={`${styles.monthDay} ${isSameDay(day, selectedDate) ? styles.monthSelected : ''}`}
          onClick={() => { setSelectedDate(day); setViewMode('week'); }}
        >
          <strong>{day.getDate()}</strong>
          {getDayCount(day) > 0 && <small>{getDayCount(day)} compromisso{getDayCount(day) === 1 ? '' : 's'}</small>}
        </button>
      ))}
      </div>
    </div>
  );

  return (
    <section aria-label={isStudent ? 'Minha agenda' : 'Agenda'}>
      <div className={styles.page}>
        <div className={styles.scope}><UserScopePicker /></div>
        <header className={styles.overview}>
          <div className={styles.intro}>
            <h2>{isStudent ? 'Minha agenda' : 'Agenda'}</h2>
            <p>{isStudent ? 'Acompanhe seus treinos, avaliações e horários combinados com seu personal.' : 'Organize seus compromissos, otimize seu tempo e continue fazendo a diferença na vida dos seus alunos.'}</p>
          </div>
          <div className={styles.headStats} aria-label="Resumo da semana">
            <div><strong>{weekItems.length}</strong><span>COMPROMISSOS</span><small>nesta semana</small></div>
            <div><strong>{weekCount('treino')}</strong><span>TREINOS</span><small>{isStudent ? 'na sua rotina' : 'com alunos'}</small></div>
            <div><strong>{weekCount('avaliacao')}</strong><span>AVALIAÇÕES</span><small>nesta semana</small></div>
          </div>
          <div className={styles.headActions}>
            <button className={styles.periodButton} type="button" onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')} aria-label={viewMode === 'week' ? 'Ver mês' : 'Ver semana'}>
              <CalendarBlank size={22} />
              <span><strong>{viewMode === 'week' ? 'Semana' : 'Mês'}</strong><small>{viewMode === 'week' ? weekRange : formatMonthYear(currentMonth)}</small></span>
            </button>
            {!isStudent && <Link href="/schedule/create" className={styles.createButton}>Novo compromisso <Plus size={19} weight="bold" /></Link>}
          </div>
        </header>
        <div className={styles.mainGrid}>
          <section className={styles.calendarCard} aria-label="Calendário de compromissos">
            <div className={styles.calendarToolbar}>
              <div className={styles.calendarTitle}>
                <button type="button" className={styles.iconButton} onClick={viewMode === 'month' ? handlePreviousMonth : handlePreviousWeek} aria-label={viewMode === 'month' ? 'Mês anterior' : 'Semana anterior'}><CaretLeft size={19} /></button>
                <strong>{viewMode === 'month' ? formatMonthYear(currentMonth) : formatShortDate(weekStart) + ' – ' + formatShortDate(weekEnd) + ' ' + weekEnd.getFullYear()}</strong>
              </div>
              <div className={styles.calendarActions}>
                <button type="button" className={styles.filterButton} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} aria-controls="agenda-filters"><FunnelSimple size={16} /> <span>{selectedFilter ? TYPE_LABELS[selectedFilter] : 'Filtrar'}</span></button>
                <button type="button" className={styles.todayButton} onClick={() => { setSelectedDate(new Date()); setCurrentMonth(new Date()); }}>Hoje</button>
                <button type="button" className={styles.iconButton} onClick={viewMode === 'month' ? handlePreviousMonth : handlePreviousWeek} aria-label="Anterior"><CaretLeft size={17} /></button>
                <button type="button" className={styles.iconButton} onClick={viewMode === 'month' ? handleNextMonth : handleNextWeek} aria-label="Próximo"><CaretRight size={17} /></button>
              </div>
            </div>
            {filtersOpen && <div id="agenda-filters" className={styles.filters} aria-label="Filtrar compromissos">
              {FILTER_OPTIONS.map((option) => (
                <button key={option.id ?? 'all'} type="button" className={[styles.filter, selectedFilter === option.id ? styles.filterActive : ''].join(' ')} onClick={() => { setSelectedFilter(option.id); setFiltersOpen(false); }} aria-pressed={selectedFilter === option.id}>{option.label}</button>
              ))}
            </div>}
            {viewMode === 'month' ? renderMonth() : (
              <div className={styles.weekScroll}>
                <div className={styles.weekHeaderScroll} ref={weekHeaderScrollRef}>
                  <div className={styles.weekHeader}>
                    <span aria-hidden="true" />
                    {weekDays.map((day) => (
                      <button key={getDateKey(day)} type="button" className={[styles.dayHeader, isSameDay(day, selectedDate) ? styles.selectedDay : ''].join(' ')} onClick={() => setSelectedDate(day)} aria-pressed={isSameDay(day, selectedDate)}>
                        <strong>{DAY_LABELS[day.getDay()]}</strong><span>{day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.weekBody}>
                  <div className={styles.timeGutter}>{Array.from({ length: 14 }, (_, hour) => <span key={hour}>{String(hour + 7).padStart(2, '0')}:00</span>)}</div>
                  {weekDays.map((day) => (
                    <div key={getDateKey(day)} className={[styles.dayColumn, isSameDay(day, selectedDate) ? styles.selectedColumn : ''].join(' ')}>
                      {Array.from({ length: 14 }, (_, hour) => <span key={hour} className={styles.hourCell} />)}
                      {layoutDayEvents(timedWeekItems.filter((item) => isSameDay(item.data, day))).map(({ item, lane, lanes }) => {
                        const start = getMinutes(item.horaInicio || '') ?? 420;
                        const end = getMinutes(item.horaFim || '') ?? start + 60;
                        if (start >= 1260 || end <= 420) return null;
                        const top = Math.max(0, (start - 420) / 60 * HOUR_HEIGHT);
                        const height = Math.max(30, (Math.min(1260, Math.max(start + 30, end)) - Math.max(420, start)) / 60 * HOUR_HEIGHT - 3);
                        return (
                          <Link key={item.id} href={item.route || '/schedule/' + item.id} className={[styles.event, getItemTone(item.tipo)].join(' ')} style={{ top, height, left: 'calc(' + (lane / lanes * 100) + '% + 3px)', right: 'calc(' + ((lanes - lane - 1) / lanes * 100) + '% + 3px)' }} title={item.horaInicio + ' ' + getItemContext(item, isStudent)}>
                            <small>{item.horaInicio}{item.horaFim ? ' – ' + item.horaFim : ''}</small>
                            <strong>{TYPE_LABELS[item.tipo] || item.tipo}</strong>
                            <span>{getItemContext(item, isStudent)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
          <aside className={styles.dayPanel} aria-label="Compromissos do dia selecionado">
            <div className={styles.panelHeading}><h3>{dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1)}</h3><p>{selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
            {nextAppointment ? (
              <Link href={nextAppointment.route || '/schedule/' + nextAppointment.id} className={styles.nextCard}>
                <div><Clock size={19} /><strong>Próximo compromisso</strong></div>
                <strong className={styles.nextTime}>{nextAppointment.horaInicio}{nextAppointment.horaFim ? ' – ' + nextAppointment.horaFim : ''}</strong>
                <span>{getItemContext(nextAppointment, isStudent)}</span>
                {nextRelativeLabel && <em className={styles.nextRelative}>{nextRelativeLabel}</em>}
                <small>{TYPE_LABELS[nextAppointment.tipo]}</small>
              </Link>
            ) : <div className={styles.nextEmpty}><Clock size={20} /><span>Nenhum próximo horário marcado neste dia.</span></div>}
            <div className={styles.agendaHeading}><h4>Agenda do dia</h4><span>{filteredAppointments.length} compromisso{filteredAppointments.length === 1 ? '' : 's'}</span></div>
            {loading && <p className={styles.message}>Carregando agenda...</p>}
            {!loading && hydrating && <p className={styles.message}>Atualizando compromissos...</p>}
            {error && <p className={styles.error} role="alert">{error}</p>}
            {!loading && !hydrating && filteredAppointments.length === 0 && <p className={styles.message}>{isStudent ? 'Sem compromissos para esta data. Seus próximos treinos e avaliações aparecerão aqui.' : 'Nenhum compromisso nesta data. Escolha outro dia ou crie um novo compromisso.'}</p>}
            {!loading && filteredAppointments.length > 0 && (
              <div className={styles.dayList}>
                {filteredAppointments.map((item) => (
                  <Link key={item.id} href={item.route || '/schedule/' + item.id} className={styles.dayItem}>
                    <span className={[styles.dayDot, getItemTone(item.tipo)].join(' ')} />
                    <span className={styles.dayTime}>{item.horaInicio || '—'}</span>
                    <span className={styles.dayItemCopy}><strong>{TYPE_LABELS[item.tipo] || item.tipo}</strong><small>{getItemContext(item, isStudent) || STATUS_LABELS[item.status]}</small></span>
                    <CaretRight size={17} />
                  </Link>
                ))}
              </div>
            )}
            {unscheduledDayItems.length > 0 && <p className={styles.unscheduledNote}>“—” indica item sem horário definido.</p>}
            <div className={styles.panelHint}><TrendUp size={21} /><div><strong>Lembrete do dia</strong><p>{filteredAppointments.length ? (isStudent ? 'Confira o horário e deixe tudo pronto para o próximo encontro.' : 'Confira os horários e prepare os próximos atendimentos dos seus alunos.') : (isStudent ? 'Quando seu personal marcar um horário, ele aparecerá aqui.' : 'Selecione outro dia da semana para conferir os próximos atendimentos.')}</p></div></div>
          </aside>
        </div>
        <section className={styles.weekSummary} aria-label="Resumo da semana">
          <div className={styles.summaryIntro}><h3>Resumo da semana</h3><p>Visão geral dos seus compromissos.</p></div>
          <div><CalendarBlank size={27} /><strong>{weekItems.length}</strong><span>COMPROMISSOS</span></div>
          <div><Clock size={27} /><strong>{weekCount('treino')}</strong><span>TREINOS</span></div>
          <div><TrendUp size={27} /><strong>{weekCount('avaliacao')}</strong><span>AVALIAÇÕES</span></div>
          <div><Clock size={27} /><strong>{weekCount('consulta')}</strong><span>CONSULTAS</span></div>
        </section>
      </div>
    </section>
  );
}
