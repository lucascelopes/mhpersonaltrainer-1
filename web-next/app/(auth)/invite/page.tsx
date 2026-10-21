import { Suspense } from 'react';
import AuthLoading from '../AuthLoading';
import InvitePage from './ClientPage';

export default function Page() {
  return (
    <Suspense fallback={<AuthLoading title="Abrindo seu convite" />}>
      <InvitePage />
    </Suspense>
  );
}
