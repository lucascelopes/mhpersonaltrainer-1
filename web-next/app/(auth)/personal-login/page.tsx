import { Suspense } from 'react';
import AuthLoading from '../AuthLoading';
import PersonalLoginPage from './ClientPage';

export default function Page() {
  return (
    <Suspense fallback={<AuthLoading title="Abrindo o acesso profissional" />}>
      <PersonalLoginPage />
    </Suspense>
  );
}
