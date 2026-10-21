import { Suspense } from 'react';
import AuthLoading from '../AuthLoading';
import LoginPage from './ClientPage';

export default function Page() {
  return (
    <Suspense fallback={<AuthLoading title="Abrindo o login" />}>
      <LoginPage />
    </Suspense>
  );
}
