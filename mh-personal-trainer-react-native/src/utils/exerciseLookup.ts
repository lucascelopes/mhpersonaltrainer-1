import { Exercise } from '../types/workout';

export type ExerciseNameLookup = Map<string, Exercise>;

export type ExerciseMediaLookupResult = {
  url: string;
  videoUrl: string;
  gifUrl: string;
  kind: 'video' | 'gif' | 'none';
};

function normalizeExerciseName(value?: string | null): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function resolveVideoUrl(exercise?: Partial<Exercise> | null): string {
  return String(
    (exercise as any)?.videoUrl1080 ||
      (exercise as any)?.videoUrl720 ||
      exercise?.videoUrl ||
      ''
  ).trim();
}

function resolveGifUrl(exercise?: Partial<Exercise> | null): string {
  return String((exercise as any)?.gifUrl || '').trim();
}

export function buildExerciseNameLookup(exercises: Exercise[]): ExerciseNameLookup {
  const lookup: ExerciseNameLookup = new Map();
  exercises.forEach((exercise) => {
    const key = normalizeExerciseName(exercise.nomeDoTreino);
    if (key && !lookup.has(key)) {
      lookup.set(key, exercise);
    }
  });
  return lookup;
}

export function resolveExerciseByName(
  name: string,
  lookup: ExerciseNameLookup
): Exercise | undefined {
  const key = normalizeExerciseName(name);
  if (!key) return undefined;
  if (lookup.has(key)) return lookup.get(key);
  return Array.from(lookup.entries()).find(
    ([candidate]) => candidate.includes(key) || key.includes(candidate)
  )?.[1];
}

export function resolveExerciseMediaFromExercise(
  exercise?: Partial<Exercise> | null,
  preferred: 'video' | 'gif' = 'video'
): ExerciseMediaLookupResult {
  const videoUrl = resolveVideoUrl(exercise);
  const gifUrl = resolveGifUrl(exercise);
  const preferGif = preferred === 'gif' && gifUrl;
  const url = preferGif ? gifUrl : videoUrl || gifUrl;
  return {
    url,
    videoUrl,
    gifUrl,
    kind: url ? (url === gifUrl && !videoUrl ? 'gif' : preferGif ? 'gif' : 'video') : 'none',
  };
}

export function resolveExerciseMediaByName(
  name: string,
  fallbackUrl: string | undefined,
  lookup: ExerciseNameLookup
): ExerciseMediaLookupResult {
  const exercise = resolveExerciseByName(name, lookup);
  const media = resolveExerciseMediaFromExercise(exercise, 'video');
  if (media.url) return media;
  const url = String(fallbackUrl || '').trim();
  return {
    url,
    videoUrl: url,
    gifUrl: '',
    kind: url ? 'video' : 'none',
  };
}
