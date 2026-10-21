import { Suspense } from 'react';
import AuthLoading from '../AuthLoading';
import LoginAlunoPage from './ClientPage';

export default function Page() {
  return (
    <Suspense fallback={<AuthLoading title="Abrindo o acesso do aluno" />}>
      <LoginAlunoPage />
    </Suspense>
  );
}
