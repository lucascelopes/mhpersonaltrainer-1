import { Suspense } from 'react';
import AuthLoading from '../AuthLoading';
import AcademyLoginPage from './ClientPage';

export default function Page() {
  return (
    <Suspense fallback={<AuthLoading title="Abrindo o acesso da academia" />}>
      <AcademyLoginPage />
    </Suspense>
  );
}
