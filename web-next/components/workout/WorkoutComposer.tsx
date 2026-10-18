'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchAvailableExercises } from '@/lib/services/workouts';
import type { Exercise } from '@/lib/types/workout';
import { getMHWorkoutPhoto } from '@/lib/workoutPhotos';
import styles from './WorkoutComposer.module.css';

export type WorkoutExerciseDraft = {
  id: string;
  name: string;
  category: string;
  photoUrl: string;
  sets: string;
  reps: string;
  load: string;
  interval: string;
  videoUrl: string;
};

export type WorkoutTemplate = {
  title: string;
  description: string;
  nome: string;
  objetivo: string;
  duracao: string;
  dias: string[];
  foto: string;
  exercises: WorkoutExerciseDraft[];
};

const makePreset = (
  id: string,
  name: string,
  category: string,
  photoUrl: string,
  sets = '3',
  reps = '10–12',
  interval = '60'
): WorkoutExerciseDraft => ({
  id,
  name,
  category,
  photoUrl,
  sets,
  reps,
  load: '',
  interval,
  videoUrl: '',
});

export const workoutTemplates: WorkoutTemplate[] = [
  {
    title: 'Hipertrofia 4x',
    description: 'Volume moderado e progressão.',
    nome: 'Hipertrofia 4x - Base',
    objetivo: 'Ganho de massa com foco em exercícios básicos',
    duracao: '55 min',
    dias: ['Seg', 'Ter', 'Qui', 'Sex'],
    foto: getMHWorkoutPhoto('Supino reto', 'Peito', '9yxCKNUY0azRzIJA3aFm'),
    exercises: [
      makePreset('hipertrofia-supino', 'Supino reto', 'Peito', getMHWorkoutPhoto('Supino reto', 'Peito', '9yxCKNUY0azRzIJA3aFm')),
      makePreset('hipertrofia-remada', 'Remada curvada', 'Costas', getMHWorkoutPhoto('Remada curvada', 'Costas', 'S5lkcDqNKSYt6Whbtyh2')),
      makePreset('hipertrofia-agachamento', 'Agachamento livre', 'Pernas', getMHWorkoutPhoto('Agachamento livre', 'Pernas', 'gypOye905Ro4R1DRrT7t')),
      makePreset('hipertrofia-terra', 'Levantamento terra romeno', 'Posterior', getMHWorkoutPhoto('Levantamento terra romeno', 'Posterior', 'xO3KRITozedZpDsSxcoh')),
    ],
  },
  {
    title: 'Emagrecimento 3x',
    description: 'Força, circuito e cardio curto.',
    nome: 'Emagrecimento 3x - Circuito',
    objetivo: 'Condicionamento e resistência',
    duracao: '40 min',
    dias: ['Seg', 'Qua', 'Sex'],
    foto: getMHWorkoutPhoto('Agachamento goblet', 'Pernas', 'f9y5Cvqi0053iUOJy4Ab'),
    exercises: [
      makePreset('emagrecimento-agachamento', 'Agachamento goblet', 'Pernas', getMHWorkoutPhoto('Agachamento goblet', 'Pernas', 'f9y5Cvqi0053iUOJy4Ab'), '3', '12–15', '45'),
      makePreset('emagrecimento-supino', 'Flexão de braço', 'Peito', getMHWorkoutPhoto('Flexão de braço', 'Peito', 'Z0kpA13IDtfIIPg00FzI'), '3', '8–12', '45'),
      makePreset('emagrecimento-remada', 'Remada com halteres', 'Costas', getMHWorkoutPhoto('Remada com halteres', 'Costas', '9H3BOeVbYUFuTDuFzs6b'), '3', '12', '45'),
      makePreset('emagrecimento-prancha', 'Prancha', 'Core', getMHWorkoutPhoto('Prancha', 'Core', 'cTkgx4tBGIIURCgg0IAD'), '3', '30–45 s', '30'),
    ],
  },
  {
    title: 'Funcional 2x',
    description: 'Movimentos completos, mobilidade e core.',
    nome: 'Funcional 2x - Mobilidade',
    objetivo: 'Mobilidade, força e estabilidade',
    duracao: '35 min',
    dias: ['Ter', 'Sáb'],
    foto: getMHWorkoutPhoto('Levantamento terra com halteres', 'Funcional', 'AlB2YaWj4xqe5LqWOfYn'),
    exercises: [
      makePreset('funcional-terra', 'Levantamento terra com halteres', 'Funcional', getMHWorkoutPhoto('Levantamento terra com halteres', 'Funcional', 'AlB2YaWj4xqe5LqWOfYn'), '3', '10–12', '60'),
      makePreset('funcional-afundo', 'Afundo alternado', 'Pernas', getMHWorkoutPhoto('Afundo alternado', 'Pernas', 'inoqvJUlIqzZyN2B4hBU'), '3', '10 cada lado', '45'),
      makePreset('funcional-remada', 'Remada com halteres', 'Costas', getMHWorkoutPhoto('Remada com halteres', 'Costas', '9H3BOeVbYUFuTDuFzs6b'), '3', '12', '45'),
    ],
  },
];

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

type WorkoutComposerProps = {
  selectedExercises: WorkoutExerciseDraft[];
  onExercisesChange: (exercises: WorkoutExerciseDraft[]) => void;
  onApplyTemplate: (template: WorkoutTemplate) => void;
};

export default function WorkoutComposer({
  selectedExercises,
  onExercisesChange,
  onApplyTemplate,
}: WorkoutComposerProps) {
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(24);
  const [customName, setCustomName] = useState('');
  const [activeTemplate, setActiveTemplate] = useState('');

  useEffect(() => {
    let active = true;

    fetchAvailableExercises().then((result) => {
      if (!active) return;
      if (result.error) {
        setLoadError('Não foi possível carregar o catálogo agora. Você ainda pode adicionar exercícios manualmente.');
        setAvailableExercises([]);
      } else {
        setAvailableExercises(result.data || []);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(availableExercises.map((exercise) => String(exercise.colecao || '').trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [availableExercises]
  );

  const filteredExercises = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    return availableExercises.filter((exercise) => {
      const name = String(exercise.nomeDoTreino || '');
      const exerciseCategory = String(exercise.colecao || '');
      const matchesCategory = category === 'all' || exerciseCategory === category;
      const matchesSearch = !normalizedSearch ||
        normalizeText(`${name} ${exerciseCategory}`).includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [availableExercises, category, search]);

  useEffect(() => {
    setVisibleCount(24);
  }, [category, search]);

  const applyTemplate = (template: WorkoutTemplate) => {
    setActiveTemplate(template.title);
    onApplyTemplate(template);
  };

  const addCatalogExercise = (exercise: Exercise) => {
    const name = String(exercise.nomeDoTreino || '').trim();
    if (!name || selectedExercises.some((item) => item.id === exercise.id)) return;

    onExercisesChange([
      ...selectedExercises,
      {
        id: exercise.id,
        name,
        category: exercise.colecao || 'geral',
        photoUrl: getMHWorkoutPhoto(name, exercise.colecao || '', exercise.id),
        sets: String(exercise.seriesRep ?? '3'),
        reps: '10–12',
        load: String(exercise.carga ?? ''),
        interval: String(exercise.intervalo ?? '60'),
        videoUrl: exercise.videoUrl1080 || exercise.videoUrl720 || exercise.videoUrl || '',
      },
    ]);
  };

  const addCustomExercise = () => {
    const name = customName.trim();
    if (!name || selectedExercises.some((item) => normalizeText(item.name) === normalizeText(name))) return;

    onExercisesChange([
      ...selectedExercises,
      {
        id: `custom-${Date.now()}`,
        name,
        category: 'Personalizado',
        photoUrl: getMHWorkoutPhoto(name),
        sets: '3',
        reps: '10–12',
        load: '',
        interval: '60',
        videoUrl: '',
      },
    ]);
    setCustomName('');
  };

  const updateExercise = (id: string, field: 'sets' | 'reps' | 'load' | 'interval', value: string) => {
    onExercisesChange(selectedExercises.map((exercise) =>
      exercise.id === id ? { ...exercise, [field]: value } : exercise
    ));
  };

  const removeExercise = (id: string) => {
    onExercisesChange(selectedExercises.filter((exercise) => exercise.id !== id));
  };

  return (
    <section className={styles.composer} aria-labelledby="workout-composer-title">
      <header className={styles.header}>
        <div>
          <h3 id="workout-composer-title">Monte o treino completo</h3>
          <p>Comece pela biblioteca ou use um modelo como ponto de partida.</p>
        </div>
        <span className={styles.count}>{selectedExercises.length} selecionados</span>
      </header>

      <div className={styles.libraryHeader}>
        <div>
          <h4>Biblioteca de exercícios</h4>
          <p>Busque e adicione quantos exercícios quiser. Os modelos rápidos abaixo são só exemplos.</p>
        </div>
        <span>{availableExercises.length} no catálogo</span>
      </div>

      <div className={styles.filters}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Buscar exercício</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar exercício ou grupo muscular"
          />
        </label>
        <label className={styles.categorySelect}>
          <span className={styles.visuallyHidden}>Filtrar por categoria</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">Todas as categorias</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className={styles.customExercise}>
        <label>
          <span className={styles.visuallyHidden}>Nome do exercício personalizado</span>
          <input
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCustomExercise();
              }
            }}
            placeholder="Ou digite um exercício que não está na lista"
          />
        </label>
        <button type="button" onClick={addCustomExercise} disabled={!customName.trim()}>
          Adicionar exercício
        </button>
      </div>

      <div className={styles.library} aria-live="polite" aria-busy={loading}>
        {loading ? (
          <p className={styles.message} role="status">Carregando todos os exercícios…</p>
        ) : loadError ? (
          <p className={styles.message} role="status">{loadError}</p>
        ) : filteredExercises.length ? (
          filteredExercises.slice(0, visibleCount).map((exercise) => {
            const name = exercise.nomeDoTreino || 'Exercício';
            const alreadyAdded = selectedExercises.some((item) => item.id === exercise.id);
            return (
              <article className={styles.exercise} key={exercise.id}>
                <img
                  src={getMHWorkoutPhoto(name, exercise.colecao || '', exercise.id)}
                  alt={`Imagem ilustrativa de ${name}`}
                  loading="lazy"
                  onError={(event) => { event.currentTarget.hidden = true; }}
                />
                <div className={styles.exerciseCopy}>
                  <strong>{name}</strong>
                  <span>{exercise.colecao || 'Geral'}</span>
                </div>
                <button type="button" onClick={() => addCatalogExercise(exercise)} disabled={alreadyAdded}>
                  {alreadyAdded ? 'Adicionado' : 'Adicionar'}
                </button>
              </article>
            );
          })
        ) : (
          <p className={styles.message}>
            {availableExercises.length ? 'Nenhum exercício encontrado nessa busca.' : 'O catálogo está vazio. Adicione seus exercícios pelo campo acima.'}
          </p>
        )}
      </div>

      {!loading && !loadError && filteredExercises.length > visibleCount && (
        <div className={styles.loadActions}>
          <button
            type="button"
            className={styles.loadMore}
            onClick={() => setVisibleCount((count) => Math.min(count + 24, filteredExercises.length))}
          >
            Carregar mais ({visibleCount} de {filteredExercises.length})
          </button>
          <button
            type="button"
            className={styles.loadMore}
            onClick={() => setVisibleCount(filteredExercises.length)}
          >
            Mostrar todos
          </button>
        </div>
      )}

      <div className={styles.templateHeader}>
        <h4>Modelos rápidos opcionais</h4>
        <p>Adicionam uma base ao treino; você pode continuar escolhendo exercícios no catálogo.</p>
      </div>
      <div className={styles.templateGrid}>
        {workoutTemplates.map((template) => (
          <button
            key={template.title}
            type="button"
            className={`${styles.template} ${activeTemplate === template.title ? styles.templateActive : ''}`}
            onClick={() => applyTemplate(template)}
            aria-pressed={activeTemplate === template.title}
          >
            <img
              src={template.foto}
              alt=""
              loading="lazy"
              onError={(event) => { event.currentTarget.hidden = true; }}
            />
            <span className={styles.templateContent}>
              <strong className={styles.templateTitle}>{template.title}</strong>
              <span className={styles.templateDescription}>{template.description}</span>
              <span className={styles.templateMeta}>
                {template.dias.join(' · ')} · {template.exercises.length} exercícios
              </span>
            </span>
          </button>
        ))}
      </div>

      {selectedExercises.length > 0 && (
        <div className={styles.selectedSection}>
          <h4>Exercícios incluídos ({selectedExercises.length})</h4>
          <div className={styles.selectedList}>
            {selectedExercises.map((exercise) => (
              <article className={styles.selectedExercise} key={exercise.id}>
                <img
                  src={exercise.photoUrl || getMHWorkoutPhoto(exercise.name, exercise.category, exercise.id)}
                  alt=""
                  loading="lazy"
                  onError={(event) => { event.currentTarget.hidden = true; }}
                />
                <div className={styles.selectedCopy}>
                  <strong>{exercise.name}</strong>
                  <div className={styles.metrics}>
                    <label>Séries<input inputMode="numeric" value={exercise.sets} onChange={(event) => updateExercise(exercise.id, 'sets', event.target.value)} /></label>
                    <label>Reps<input value={exercise.reps} onChange={(event) => updateExercise(exercise.id, 'reps', event.target.value)} /></label>
                    <label>Carga<input inputMode="decimal" value={exercise.load} onChange={(event) => updateExercise(exercise.id, 'load', event.target.value)} placeholder="kg" /></label>
                    <label>Descanso<input inputMode="numeric" value={exercise.interval} onChange={(event) => updateExercise(exercise.id, 'interval', event.target.value)} placeholder="seg" /></label>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removeExercise(exercise.id)}
                  aria-label={`Remover ${exercise.name}`}
                >
                  Remover
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
