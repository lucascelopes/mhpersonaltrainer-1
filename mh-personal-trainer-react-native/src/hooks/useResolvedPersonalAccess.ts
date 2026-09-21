import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

const truthy = (value: unknown) => value === true || value === 'true' || value === 1;

export function useResolvedPersonalAccess() {
  const { user, role, isLoading } = useAuthStore();

  return useMemo(() => {
    const isPersonal =
      role === 'admin' ||
      role === 'personal' ||
      role === 'professor' ||
      truthy(user?.admin) ||
      truthy(user?.professorAccount);

    return {
      isPersonal,
      isChecking: isLoading,
    };
  }, [isLoading, role, user?.admin, user?.professorAccount]);
}
