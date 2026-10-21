import { Suspense } from 'react';
import AuthLoading from '../AuthLoading';
import RegisterPage from './ClientPage';

export default function Page() {
  return (
    <Suspense fallback={<AuthLoading title="Preparando o cadastro profissional" />}>
      <RegisterPage />
    </Suspense>
  );
}
