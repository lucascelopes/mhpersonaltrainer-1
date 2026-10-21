import { Suspense } from 'react';
import AuthLoading from '../AuthLoading';
import ForgotPasswordPage from './ClientPage';

export default function Page() {
  return (
    <Suspense fallback={<AuthLoading title="Abrindo a recuperação de senha" />}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
