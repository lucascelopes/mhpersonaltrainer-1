import Link from 'next/link';

interface PersonalStudentRequiredProps {
  loading: boolean;
  requestedStudentId: string;
  error?: string;
  description: string;
}

export default function PersonalStudentRequired({
  loading,
  requestedStudentId,
  error,
  description,
}: PersonalStudentRequiredProps) {
  return (
    <section className="portal-card" aria-live="polite">
      <h2>{loading ? 'Carregando aluno' : requestedStudentId ? 'Não foi possível abrir este aluno' : 'Selecione um aluno'}</h2>
      <p className="subtle">
        {loading ? 'Conferindo o acesso ao aluno...' : error || description}
      </p>
      <Link href="/students" className="button">Ver alunos</Link>
    </section>
  );
}
