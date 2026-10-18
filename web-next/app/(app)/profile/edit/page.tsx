'use client';

import PageShell from '@/components/PageShell';
import ProfileInfoEditor from '@/components/profile/ProfileInfoEditor';

export default function ProfileEditPage() {
  return (
    <PageShell
      title="Editar perfil"
      description="Atualize as informações pessoais da sua conta."
      breadcrumbs={[{ label: 'Perfil', href: '/profile' }]}
    >
      <ProfileInfoEditor />
    </PageShell>
  );
}
