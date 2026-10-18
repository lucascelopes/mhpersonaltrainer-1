'use client';

import { useEffect, useState } from 'react';
import { useUserScope } from '@/lib/firestoreHooks';
import { useAuth } from '@/lib/auth';
import styles from './UserScopePicker.module.css';

export default function UserScopePicker() {
  const { role } = useAuth();
  const { userId, setUserId } = useUserScope();
  const [value, setValue] = useState(userId);

  useEffect(() => {
    setValue(userId);
  }, [userId]);

  if (role !== 'admin') {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <p className="pill">Filtro por usuário</p>
      <p className="subtle" style={{ marginTop: 8 }}>
        Informe o UID do usuário para carregar subcoleções (avaliações, pagamentos, documentos etc.).
      </p>
      <div className={styles.controls}>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="UID do usuário"
          aria-label="UID do usuário"
        />
        <button
          className="button"
          type="button"
          onClick={() => setUserId(value.trim())}
        >
          Aplicar
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            setValue('');
            setUserId('');
          }}
        >
          Limpar
        </button>
      </div>
      {userId && (
        <p className="subtle" style={{ marginTop: 10 }}>
          Usuário atual: {userId}
        </p>
      )}
    </div>
  );
}
