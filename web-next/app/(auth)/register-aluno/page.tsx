import type { Metadata } from 'next';
import { Suspense } from 'react';
import RegisterAlunoPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Cadastro de aluno',
  description: 'Crie sua conta de aluno no MH Personal Trainer para acompanhar treinos e progresso.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegisterAlunoPage />
    </Suspense>
  );
}
