import { Suspense } from 'react';
import AuthLoading from '../AuthLoading';
import RegisterAcademyPage from './ClientPage';

export default function Page() {
  return (
    <Suspense fallback={<AuthLoading title="Preparando o cadastro da academia" />}>
      <RegisterAcademyPage />
    </Suspense>
  );
}
