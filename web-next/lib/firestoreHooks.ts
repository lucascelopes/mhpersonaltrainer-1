'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebaseClient';
import { useAuth } from './auth';

export type FirestorePath = (string | undefined | null)[];
const EMPTY_QUERY_CONSTRAINTS: QueryConstraint[] = [];
const USER_SCOPE_CHANGED_EVENT = 'mh-user-scope-changed';

const buildPath = (segments: FirestorePath) => {
  if (segments.some((segment) => segment === '' || segment === undefined || segment === null)) {
    return [] as string[];
  }
  return segments.filter(Boolean) as string[];
};

export const formatDate = (value?: any) => {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  if (typeof value?.toDate === 'function') {
    return value.toDate().toLocaleDateString('pt-BR');
  }
  if (value instanceof Date) return value.toLocaleDateString('pt-BR');
  return String(value);
};

export const useCollectionData = <T extends DocumentData>(
  path: FirestorePath,
  constraints: QueryConstraint[] = EMPTY_QUERY_CONSTRAINTS
) => {
  const pathKey = useMemo(() => buildPath(path).join('/'), [path]);
  type CollectionResult = {
    pathKey: string;
    data: T[];
    loading: boolean;
    error: Error | null;
  };
  const [result, setResult] = useState<CollectionResult>({
    pathKey,
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    const segments = buildPath(path);
    if (!segments.length) {
      setResult({ pathKey, data: [], loading: false, error: null });
      return () => { active = false; };
    }

    setResult((current) => current.pathKey === pathKey
      ? current
      : { pathKey, data: [], loading: true, error: null });
    const ref = collection(db, ...(segments as [string, ...string[]]));
    const q = constraints.length ? query(ref, ...constraints) : ref;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!active) return;
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as unknown as T[];
        setResult({ pathKey, data: items, loading: false, error: null });
      },
      (err) => {
        if (!active) return;
        setResult({ pathKey, data: [], loading: false, error: err });
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [pathKey, constraints]);

  const isCurrentPath = result.pathKey === pathKey;
  return {
    data: isCurrentPath ? result.data : [],
    loading: !isCurrentPath || result.loading,
    error: isCurrentPath ? result.error : null,
  };
};

export const useCollectionCount = (
  path: FirestorePath,
  constraints: QueryConstraint[] = EMPTY_QUERY_CONSTRAINTS
) => {
  const { data, loading, error } = useCollectionData(path, constraints);
  return { count: data.length, loading, error };
};

export const useDocumentData = <T extends DocumentData>(path: FirestorePath) => {
  const pathKey = useMemo(() => buildPath(path).join('/'), [path]);
  type DocumentResult = {
    pathKey: string;
    data: T | null;
    loading: boolean;
    error: Error | null;
  };
  const [result, setResult] = useState<DocumentResult>({
    pathKey,
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    const segments = buildPath(path);
    if (segments.length < 2) {
      setResult({ pathKey, data: null, loading: false, error: null });
      return () => {
        active = false;
      };
    }

    setResult({ pathKey, data: null, loading: true, error: null });
    const ref = doc(db, ...(segments as [string, ...string[]]));
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!active) return;
        setResult({
          pathKey,
          data: snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as unknown as T) : null,
          loading: false,
          error: null,
        });
      },
      (err) => {
        if (!active) return;
        setResult({ pathKey, data: null, loading: false, error: err });
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [pathKey]);

  const isCurrentPath = result.pathKey === pathKey;
  return {
    data: isCurrentPath ? result.data : null,
    loading: !isCurrentPath || result.loading,
    error: isCurrentPath ? result.error : null,
  };
};

const DEFAULT_USER_ID_KEY = 'mh-web-user-id';

export const useUserScope = () => {
  const { user, role } = useAuth();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      const stored = window.localStorage.getItem(DEFAULT_USER_ID_KEY);
      if (stored) {
        setUserId(stored);
        return;
      }
    }
    setUserId(user?.uid || '');
  }, [role, user?.uid]);

  useEffect(() => {
    if (role !== 'admin') return;
    const syncScope = (event: Event) => {
      setUserId((event as CustomEvent<string>).detail || '');
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key === DEFAULT_USER_ID_KEY) setUserId(event.newValue || '');
    };
    window.addEventListener(USER_SCOPE_CHANGED_EVENT, syncScope);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener(USER_SCOPE_CHANGED_EVENT, syncScope);
      window.removeEventListener('storage', syncStorage);
    };
  }, [role]);

  const updateUserId = useCallback(
    (nextId: string) => {
      if (role !== 'admin') {
        setUserId(user?.uid || '');
        return;
      }
      setUserId(nextId);
      if (nextId) {
        window.localStorage.setItem(DEFAULT_USER_ID_KEY, nextId);
      } else {
        window.localStorage.removeItem(DEFAULT_USER_ID_KEY);
      }
      window.dispatchEvent(new CustomEvent<string>(USER_SCOPE_CHANGED_EVENT, { detail: nextId }));
    },
    [role, user?.uid]
  );

  return { userId, setUserId: updateUserId };
};

export const firestoreHelpers = {
  orderBy,
  limit,
  where,
};
