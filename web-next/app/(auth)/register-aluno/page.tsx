import { Suspense } from 'react';
import AuthLoading from '../AuthLoading';
import RegisterAlunoPage from './ClientPage';

export default function Page() {
  return (
    <Suspense fallback={<AuthLoading title="Preparando o cadastro do aluno" />}>
      <RegisterAlunoPage />
    </Suspense>
  );
}
