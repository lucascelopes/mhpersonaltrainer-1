'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { firestoreService, type AdminOverview } from '@/lib/services/firestoreService';
import { useAuth } from '@/lib/auth';

interface AdminDashboardData {
  overview: AdminOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAdminDashboardData(enabled = true): AdminDashboardData {
  const { user, role } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const fetchOverview = useCallback(async () => {
    const current = ++request.current;
    if (!enabled || !user?.uid || role !== 'admin') {
      setOverview(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await firestoreService.getAdminOverview();
      if (current !== request.current) return;
      setOverview(data);
    } catch (err: any) {
      if (current !== request.current) return;
      setOverview(null);
      setError(err.message || 'Erro ao carregar dados do admin.');
    } finally {
      if (current === request.current) setLoading(false);
    }
  }, [enabled, user?.uid, role]);

  useEffect(() => {
    fetchOverview();
    return () => { request.current += 1; };
  }, [fetchOverview]);

  return {
    overview,
    loading,
    error,
    refresh: fetchOverview,
  };
}
