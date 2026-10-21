'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useUserScope } from '@/lib/firestoreHooks';
import { firestoreService, type Aluno } from '@/lib/services/firestoreService';

interface StudentListState {
  ownerId: string;
  requestedStudentId: string;
  students: Aluno[];
  loading: boolean;
  error: string;
}

export function useStudentScopeFromQuery(requestedStudentId: string) {
  const { user, role, isLoading: authLoading } = useAuth();
  const { userId: scopedUserId } = useUserScope();
  const isPersonal = role === 'personal' || role === 'professor';
  const [state, setState] = useState<StudentListState>({
    ownerId: '',
    requestedStudentId: '',
    students: [],
    loading: false,
    error: '',
  });

  useEffect(() => {
    const ownerId = user?.uid || '';
    if (!isPersonal || !ownerId || !requestedStudentId) {
      setState({ ownerId, requestedStudentId, students: [], loading: false, error: '' });
      return;
    }

    let active = true;
    setState({ ownerId, requestedStudentId, students: [], loading: true, error: '' });
    firestoreService
      .getAlunosDoPersonal(ownerId)
      .then((students) => {
        if (!active) return;
        setState({ ownerId, requestedStudentId, students, loading: false, error: '' });
      })
      .catch(() => {
        if (!active) return;
        setState({
          ownerId,
          requestedStudentId,
          students: [],
          loading: false,
          error: 'Não foi possível confirmar o acesso ao aluno agora. Tente novamente.',
        });
      });

    return () => {
      active = false;
    };
  }, [isPersonal, requestedStudentId, user?.uid]);

  const currentState = state.ownerId === user?.uid && state.requestedStudentId === requestedStudentId
    ? state
    : null;
  const student = currentState?.students.find((item) => item.id === requestedStudentId) || null;

  return {
    isPersonal,
    student,
    userId: isPersonal ? student?.id || '' : authLoading ? '' : scopedUserId,
    loading: isPersonal && Boolean(requestedStudentId) && (currentState?.loading ?? true),
    error: currentState?.error || '',
  };
}
