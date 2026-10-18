'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { useAuth } from '@/lib/auth';
import { useUserScope } from '@/lib/firestoreHooks';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { createUserWorkout, createWorkout } from '@/lib/services/workouts';
import WorkoutComposer, {
  type WorkoutExerciseDraft,
  type WorkoutTemplate,
} from '@/components/workout/WorkoutComposer';

const weekOptions = [
  { id: 'seg', label: 'Seg', value: 'Seg' },
  { id: 'ter', label: 'Ter', value: 'Ter' },
  { id: 'qua', label: 'Qua', value: 'Qua' },
  { id: 'qui', label: 'Qui', value: 'Qui' },
  { id: 'sex', label: 'Sex', value: 'Sex' },
  { id: 'sab', label: 'Sáb', value: 'Sab' },
  { id: 'dom', label: 'Dom', value: 'Dom' },
];

export default function WorkoutCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role } = useAuth();
  const { userId: scopedUserId } = useUserScope();
  const dashboard = useDashboardData();
  const isPersonal = role === 'personal' || role === 'professor';
  const isAdmin = role === 'admin';
  const [nome, setNome] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [duracao, setDuracao] = useState('');
  const [dias, setDias] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExerciseDraft[]>([]);
  const [scope, setScope] = useState<'user' | 'public'>('user');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const paramStudentId = searchParams.get('studentId') || '';

  const toggleDay = (id: string) => {
    setDias((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  useEffect(() => {
    if (!isPersonal) return;
    if (!paramStudentId) return;
    const exists = dashboard.alunos.some((aluno) => aluno.id === paramStudentId);
    if (exists) {
      setSelectedStudentId(paramStudentId);
    }
  }, [dashboard.alunos, isPersonal, paramStudentId]);

  useEffect(() => {
    if (!isAdmin) return;
    if (!targetUserId && scopedUserId) {
      setTargetUserId(scopedUserId);
    }
  }, [isAdmin, scopedUserId, targetUserId]);

  const selectedStudent = useMemo(
    () => dashboard.alunos.find((aluno) => aluno.id === selectedStudentId) || null,
    [dashboard.alunos, selectedStudentId]
  );

  const applyTemplate = (template: WorkoutTemplate) => {
    setNome(template.nome);
    setObjetivo(template.objetivo);
    setDuracao(template.duracao);
    setDias(template.dias);
    setSelectedExercises((current) => {
      const existingNames = new Set(current.map((exercise) =>
        exercise.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
      ));
      const additions = template.exercises.filter((exercise) =>
        !existingNames.has(exercise.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim())
      );
      return [...current, ...additions];
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.uid) {
      setError('Usuario nao autenticado.');
      return;
    }
    if (!nome) {
      setError('Informe o nome do treino.');
      return;
    }
    if (scope === 'user' && isPersonal && !selectedStudentId) {
      setError('Selecione um aluno para vincular o treino.');
      return;
    }
    if (scope === 'user' && isAdmin && !targetUserId.trim()) {
      setError('Informe o UID do usuario para vincular o treino.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (scope === 'public') {
        const result = await createWorkout({
          nomeDoTreino: nome,
          uid: user.uid,
          uidTreinos: user.uid,
          colecao: objetivo || 'geral',
          objetivo,
          duracao,
          diasDaSemana: dias,
          treino: selectedExercises.map((exercise) => exercise.name),
          seriesRep: selectedExercises.map((exercise) => exercise.sets),
          repeticoes: selectedExercises.map((exercise) => exercise.reps),
          carga: selectedExercises.map((exercise) => exercise.load),
          intervalo: selectedExercises.map((exercise) => exercise.interval),
          videoUrls: selectedExercises.map((exercise) => exercise.videoUrl),
          fotoUrls: selectedExercises.map((exercise) => exercise.photoUrl),
          exercicios: selectedExercises.map((exercise) => ({
            exerciseId: exercise.id,
            nome: exercise.name,
            series: exercise.sets,
            repeticoes: exercise.reps,
            carga: exercise.load,
            intervalo: exercise.interval,
            videoUrl: exercise.videoUrl,
          })),
        } as any);
        if (result.error || !result.data) {
          throw new Error(result.error || 'Erro ao criar treino.');
        }
        router.replace(`/workout/${result.data.id}`);
        return;
      }

      const targetId = isPersonal ? selectedStudentId : isAdmin ? targetUserId.trim() : user.uid;
      const result = await createUserWorkout(targetId, {
        nomeDoTreino: nome,
        obsInstrucao: objetivo,
        treino: selectedExercises.map((exercise) => exercise.name),
        seriesRep: selectedExercises.map((exercise) => exercise.sets),
        repeticoes: selectedExercises.map((exercise) => exercise.reps),
        carga: selectedExercises.map((exercise) => exercise.load),
        intervalo: selectedExercises.map((exercise) => exercise.interval),
        videoUrls: selectedExercises.map((exercise) => exercise.videoUrl),
        fotoUrls: selectedExercises.map((exercise) => exercise.photoUrl),
        duracao,
        diasDaSemana: dias,
        arquivos: false,
      });
      if (result.error || !result.data) {
        throw new Error(result.error || 'Erro ao criar treino.');
      }
      router.replace(`/workout/${result.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar treino.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Criar treino"
      description="Crie quantos treinos quiser, cada um com os exercícios que precisar."
      breadcrumbs={[{ label: 'Treinos', href: '/workouts' }]}
    >
      <div className="workout-create">
        <div className="workout-create-grid">
          <div className="card workout-create-form-card">
            <div className="workout-create-header">
              <div>
                <h3>Informacoes do treino</h3>
                <p className="subtle">Preencha o basico e deixe a estrutura pronta para ajustes.</p>
              </div>
              <span className="pill">Novo treino</span>
            </div>
            <form className="workout-create-form" onSubmit={handleSubmit}>
              {isPersonal && scope === 'user' && (
                <label className="workout-create-label">
                  Aluno
                  {dashboard.loading ? (
                    <p className="subtle workout-create-helper">Carregando alunos...</p>
                  ) : dashboard.alunos.length ? (
                    <select
                      className="workout-create-input"
                      value={selectedStudentId}
                      onChange={(event) => setSelectedStudentId(event.target.value)}
                    >
                      <option value="">Selecione um aluno</option>
                      {dashboard.alunos.map((aluno) => (
                        <option key={aluno.id} value={aluno.id}>
                          {aluno.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="workout-create-empty">
                      <p className="subtle">Nenhum aluno conectado.</p>
                      <Link href="/students" className="students-action">
                        Gerar link de convite
                      </Link>
                    </div>
                  )}
                </label>
              )}
              {isAdmin && scope === 'user' && (
                <label className="workout-create-label">
                  UID do usuario
                  <input
                    type="text"
                    value={targetUserId}
                    onChange={(event) => setTargetUserId(event.target.value)}
                    placeholder="UID do usuario"
                    className="workout-create-input"
                  />
                  <span className="workout-create-helper">
                    Use a lista em <Link href="/admin/users">Usuarios</Link> para copiar o UID.
                  </span>
                </label>
              )}
              <label className="workout-create-label">
                Nome do treino
                <input
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Treino A - Superior"
                  className="workout-create-input"
                />
              </label>
              <label className="workout-create-label">
                Objetivo
                <input
                  type="text"
                  value={objetivo}
                  onChange={(event) => setObjetivo(event.target.value)}
                  placeholder="Hipertrofia, condicionamento..."
                  className="workout-create-input"
                />
              </label>
              <label className="workout-create-label">
                Duracao estimada
                <input
                  type="text"
                  value={duracao}
                  onChange={(event) => setDuracao(event.target.value)}
                  placeholder="50 min"
                  className="workout-create-input"
                />
              </label>
              <label className="workout-create-label">
                Dias sugeridos
                <div className="workout-create-days">
                  {weekOptions.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      className={`workout-create-day ${dias.includes(day.value) ? 'is-active' : ''}`}
                      onClick={() => toggleDay(day.value)}
                      aria-pressed={dias.includes(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </label>
              <label className="workout-create-label">
                Tipo de treino
                <select
                  value={scope}
                  onChange={(event) => setScope(event.target.value as 'user' | 'public')}
                  className="workout-create-input"
                >
                  <option value="user">Treino do aluno</option>
                  <option value="public">Treino geral</option>
                </select>
                <span className="workout-create-helper">
                  {scope === 'public'
                    ? 'Treinos gerais ficam disponiveis como base.'
                    : 'Treino exclusivo para o aluno selecionado.'}
                </span>
              </label>
              {error && <p className="workout-create-error">{error}</p>}
              <div className="workout-create-actions">
                <button className="button" type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar treino'}
                </button>
                <Link className="button secondary" href="/ai/assistant">
                  Abrir assistente
                </Link>
              </div>
            </form>
          </div>

          <div className="workout-create-side">
            <div className="card workout-create-preview">
              <div className="workout-create-header">
                <div>
                  <h3>Resumo do treino</h3>
                  <p className="subtle">Preview do que o aluno vai receber.</p>
                </div>
                <span className="pill">Ao vivo</span>
              </div>
              <div className="workout-create-summary">
                <div>
                  <span>Aluno</span>
                  <strong>
                    {scope === 'public'
                      ? 'Treino geral'
                      : isPersonal
                      ? selectedStudent?.nome || 'Selecione um aluno'
                      : 'Voce'}
                  </strong>
                </div>
                <div>
                  <span>Nome</span>
                  <strong>{nome || 'Treino sem titulo'}</strong>
                </div>
                <div>
                  <span>Objetivo</span>
                  <strong>{objetivo || 'Defina o objetivo principal'}</strong>
                </div>
                <div>
                  <span>Duracao</span>
                  <strong>{duracao || 'Tempo livre'}</strong>
                </div>
                <div>
                  <span>Exercícios</span>
                  <strong>{selectedExercises.length}</strong>
                </div>
              </div>
              <div className="workout-create-badges">
                {dias.length ? (
                  dias.map((dia) => (
                    <span key={dia} className="workout-create-badge">
                      {weekOptions.find((option) => option.value === dia)?.label || dia}
                    </span>
                  ))
                ) : (
                  <span className="subtle">Nenhum dia selecionado.</span>
                )}
              </div>
            </div>

            <div className="card workout-create-next">
              <h3>Proximos passos</h3>
              <p className="subtle">Depois de salvar, refine o treino com blocos e exercicios.</p>
              <ul className="workout-create-list">
                <li>Crie blocos por objetivo (forca, cardio, core).</li>
                <li>Adicione cargas, series e repeticoes.</li>
                <li>Marque dias sugeridos para guiar o aluno.</li>
              </ul>
              <div className="workout-create-tips">
                <strong>Dica rapida</strong>
                <p className="subtle">
                  Se o aluno for iniciante, comece com 2 a 3 exercicios por bloco.
                </p>
              </div>
            </div>
          </div>
        </div>

        <WorkoutComposer
          selectedExercises={selectedExercises}
          onExercisesChange={setSelectedExercises}
          onApplyTemplate={applyTemplate}
        />
      </div>
    </PageShell>
  );
}
