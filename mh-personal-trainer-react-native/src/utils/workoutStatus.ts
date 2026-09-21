export type WorkoutStatusPresentation = {
  status: 'completed' | 'partial' | 'pending';
  label: string;
  description: string;
};

type WorkoutStatusInput = {
  lastCompletedAt?: unknown;
  lastSessionAt?: unknown;
  lastSessionStatus?: unknown;
  lastSessionRemainingExercises?: unknown;
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const millis = value < 1000000000000 ? value * 1000 : value;
    const parsed = new Date(millis);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === 'object' && typeof (value as any).toDate === 'function') {
    const parsed = (value as any).toDate();
    return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function toRemainingExercises(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function getWorkoutStatusPresentation(
  input: WorkoutStatusInput
): WorkoutStatusPresentation {
  const today = new Date();
  const completedAt = toDate(input.lastCompletedAt);
  if (completedAt && isSameDay(completedAt, today)) {
    return {
      status: 'completed',
      label: 'Concluido',
      description: 'Treino finalizado hoje',
    };
  }

  const sessionAt = toDate(input.lastSessionAt);
  const sessionStatus = String(input.lastSessionStatus || '').trim().toLowerCase();
  const remainingExercises = toRemainingExercises(input.lastSessionRemainingExercises);
  const hasOpenSession =
    sessionStatus === 'partial' ||
    sessionStatus === 'started' ||
    sessionStatus === 'in_progress' ||
    sessionStatus === 'em_andamento' ||
    remainingExercises > 0;

  if (hasOpenSession) {
    const remainingDescription =
      remainingExercises > 0
        ? `${remainingExercises} exercicio${remainingExercises === 1 ? '' : 's'} restante${remainingExercises === 1 ? '' : 's'}`
        : 'Continue de onde parou';
    return {
      status: 'partial',
      label: sessionAt && isSameDay(sessionAt, today) ? 'Em andamento' : 'Pendente',
      description: remainingDescription,
    };
  }

  return {
    status: 'pending',
    label: 'Pendente',
    description: 'Abra os detalhes para iniciar',
  };
}
