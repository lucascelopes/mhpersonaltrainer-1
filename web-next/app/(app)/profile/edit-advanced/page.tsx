'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import { useDocumentData, useUserScope } from '@/lib/firestoreHooks';
import { firestoreService } from '@/lib/services/firestoreService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useAuth } from '@/lib/auth';
import styles from './page.module.css';

export default function ProfileEditAdvancedPage() {
  const { role } = useAuth();
  const { userId } = useUserScope();
  const { data } = useDocumentData<any>(['users', userId]);
  const canLinkPersonal = role === 'aluno';

  const [codigoPersonal, setCodigoPersonal] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!data) return;
    setCodigoPersonal(data.codigoPersonal ? String(data.codigoPersonal) : '');
    setCidade(data.cidade || data.city || '');
    setEstado(data.estado || data.uf || data.state || '');
    setObjetivo(data.objetivoNoApp || '');
  }, [data]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId) return;
    const codigoTexto = codigoPersonal.trim();
    const codigoNumero = codigoTexto ? Number(codigoTexto) : null;
    const codigoValido =
      /^\d+$/.test(codigoTexto) && codigoNumero !== null && Number.isSafeInteger(codigoNumero) && codigoNumero > 0;
    if (canLinkPersonal && codigoTexto && !codigoValido) {
      setError('Informe um código do personal válido.');
      setMessage('');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const updates: Record<string, any> = {
        cidade,
        estado,
        objetivoNoApp: objetivo,
      };

      if (canLinkPersonal && codigoNumero) {
        const capacity = await firestoreService.getPersonalStudentCapacityByCode(codigoNumero, {
          excludeUserId: userId,
        });
        if (!capacity.allowed) {
          setError(
            capacity.reason === 'personal_not_found'
              ? 'Código do personal não encontrado.'
              : 'Esse personal já atingiu o limite de 4 alunos no plano gratuito. Peça para ele assinar o Premium para liberar alunos ilimitados.'
          );
          return;
        }
        updates.codigoPersonal = codigoNumero;
        if (capacity.personalName) {
          updates.nameDoSeuPersonal = capacity.personalName;
        }
      } else if (canLinkPersonal) {
        updates.codigoPersonal = codigoNumero;
        updates.nameDoSeuPersonal = '';
      }

      await updateDoc(doc(db, 'users', userId), updates);
      setMessage('Dados atualizados com sucesso.');
    } catch (saveError) {
      console.error('Erro ao salvar perfil avançado:', saveError);
      setError('Não foi possível salvar agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Editar perfil avançado"
      description={canLinkPersonal ? 'Dados extras, preferências e código do personal.' : 'Dados extras e preferências.'}
      breadcrumbs={[{ label: 'Perfil', href: '/profile' }]}
    >
      <div className={styles.layout}>
        <section className={`card ${styles.card}`}>
          <h2>Informações extras</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            {canLinkPersonal && (
              <label className={styles.field}>
                <span>Código do personal</span>
                <input
                  className={styles.control}
                  type="text"
                  inputMode="numeric"
                  value={codigoPersonal}
                  onChange={(event) => setCodigoPersonal(event.target.value)}
                  placeholder="12345"
                />
              </label>
            )}
            <label className={styles.field}>
              <span>Cidade</span>
              <input
                className={styles.control}
                type="text"
                value={cidade}
                onChange={(event) => setCidade(event.target.value)}
                placeholder="São Paulo"
              />
            </label>
            <label className={styles.field}>
              <span>Estado</span>
              <input
                className={styles.control}
                type="text"
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
                placeholder="SP"
              />
            </label>
            <label className={styles.field}>
              <span>Objetivo no app</span>
              <input
                className={styles.control}
                type="text"
                value={objetivo}
                onChange={(event) => setObjetivo(event.target.value)}
                placeholder="Emagrecimento, hipertrofia..."
              />
            </label>
            {message && <p className={styles.success} role="status">{message}</p>}
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className={`button ${styles.submit}`} type="submit" disabled={loading || !role}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        </section>
        <section className={`card ${styles.card}`}>
          <h2>Preferências</h2>
          <p className={`subtle ${styles.preferenceDescription}`}>
            Ajuste seu idioma e estilo de notificação.
          </p>
          <nav className={styles.preferenceLinks} aria-label="Configurações de preferência">
            <Link className="button secondary" href="/profile/language">Idioma</Link>
            <Link className="button secondary" href="/profile/notifications">Notificações</Link>
          </nav>
        </section>
      </div>
    </PageShell>
  );
}
