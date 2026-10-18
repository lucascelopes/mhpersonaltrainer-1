export const MH_WORKOUT_PHOTOS = {
  bench: '/workout-photos/exercises/9yxCKNUY0azRzIJA3aFm.jpg',
  hinge: '/workout-photos/exercises/AlB2YaWj4xqe5LqWOfYn.jpg',
  squat: '/workout-photos/exercises/0prnZebqjaKUQG7BvjC5.jpg',
} as const;

const MH_EXERCISE_PHOTOS: Record<string, string> = {
  '9yxCKNUY0azRzIJA3aFm': '/workout-photos/mh-exercises/9yxCKNUY0azRzIJA3aFm.jpg',
  S5lkcDqNKSYt6Whbtyh2: '/workout-photos/mh-exercises/S5lkcDqNKSYt6Whbtyh2.jpg',
  gypOye905Ro4R1DRrT7t: '/workout-photos/mh-exercises/gypOye905Ro4R1DRrT7t.jpg',
  xO3KRITozedZpDsSxcoh: '/workout-photos/mh-exercises/xO3KRITozedZpDsSxcoh.jpg',
};

export function getMHWorkoutPhoto(name: string, category = '', exerciseId?: string) {
  if (exerciseId && /^[A-Za-z0-9]{20}$/.test(exerciseId)) {
    return MH_EXERCISE_PHOTOS[exerciseId] || `/workout-photos/exercises/${exerciseId}.jpg`;
  }

  const value = `${name} ${category}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (/supino|peito|flexao|push|crucifixo/.test(value)) return MH_WORKOUT_PHOTOS.bench;
  if (/agach|perna|leg press|afundo|passada|panturrilha|lunge|squat|prancha/.test(value)) {
    return MH_WORKOUT_PHOTOS.squat;
  }
  return MH_WORKOUT_PHOTOS.hinge;
}
