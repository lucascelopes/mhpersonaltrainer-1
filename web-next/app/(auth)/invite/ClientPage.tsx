'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { claimPersonalInvite, inviteErrorMessage, previewPersonalInvite, registerStudentWithInvite } from '@/lib/services/personalInvite';
import styles from './ClientPage.module.css';

type InvitePreview = Awaited<ReturnType<typeof previewPersonalInvite>>;

const normalizeCode = (value?: string | null) => (value ? value.trim() : '');

const resolveCodigoPersonal = (code: string) => {
  const numeric = Number(code);
  return Number.isSafeInteger(numeric) && numeric > 0 ? numeric : null;
};

export default function InvitePage() {
  const { login, isAuthenticated, isLoading, role, user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code');
  const code = normalizeCode(codeParam);

  const [profile, setProfile] = useState<InvitePreview | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileAttempt, setProfileAttempt] = useState(0);
  const [profileFailed, setProfileFailed] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const submitting = useRef(false);

  const codigoPersonal = useMemo(() => resolveCodigoPersonal(code), [code]);
  const hasValidCode = Boolean(code && codigoPersonal !== null);
  const inviteUnavailable = !hasValidCode || Boolean(profileError && !profileLoading && !profile);
  const alreadyLinked = Boolean(user?.codigoPersonal && Number(user.codigoPersonal) === codigoPersonal);
  const loginHref = `/login-aluno?redirect=${encodeURIComponent(`/invite?code=${encodeURIComponent(code)}`)}`;

  useEffect(() => {
    let active = true;
    setProfile(null);
    setProfileLoading(false);
    setProfileFailed(false);
    if (!code || codigoPersonal === null) {
      setProfile(null);
      setProfileError(code ? 'Código do convite inválido.' : 'Código não informado.');
      return;
    }
    setProfileLoading(true);
    setProfileError('');
    previewPersonalInvite(code).then((result) => {
      if (!active) return;
      if (result) {
        setProfile(result);
      } else {
        setProfile(null);
        setProfileError('Personal não encontrado.');
      }
      setProfileLoading(false);
    }).catch((lookupError) => {
      if (!active) return;
      setProfile(null);
      setProfileError(inviteErrorMessage(lookupError));
      setProfileFailed(!['functions/not-found', 'functions/invalid-argument'].includes(String(lookupError?.code || '')));
      setProfileLoading(false);
    });
    return () => {
      active = false;
    };
  }, [code, codigoPersonal, profileAttempt]);

  const validate = () => {
    if (!code || codigoPersonal === null) {
      setError('Código do convite não encontrado.');
      return false;
    }
    if (!profile) {
      setError(profileError || 'Personal não encontrado.');
      return false;
    }
    if (!name) {
      setError('Nome obrigatório.');
      return false;
    }
    if (!email) {
      setError('E-mail obrigatório.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('E-mail inválido.');
      return false;
    }
    if (!password) {
      setError('Senha obrigatória.');
      return false;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    if (!validate()) return;
    submitting.current = true;
    setLoading(true);
    try {
      await registerStudentWithInvite({ code, name: name.trim(), email: email.trim(), password });
      const result = await login(email.trim(), password);
      if (result.success) {
        setSuccess(true);
        router.replace('/app');
      } else {
        setSuccess(true);
        setError('Conta criada. Entre com seu e-mail e senha para continuar.');
      }
    } catch (registrationError) {
      setError(inviteErrorMessage(registrationError));
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (submitting.current || !profile || role !== 'aluno' || !codigoPersonal || alreadyLinked) return;
    submitting.current = true;
    setLoading(true);
    setError('');
    try {
      await claimPersonalInvite(code);
      await refreshUser();
      router.replace('/app');
    } catch (claimError) {
      setError(inviteErrorMessage(claimError));
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="auth-card auth-card--student">
      <div className="auth-card-header">
        <p className="auth-kicker">Convite</p>
        <h1>{isAuthenticated ? 'Vincule seu convite' : 'Crie sua conta de aluno'}</h1>
        <p className="subtle">
          Seu acesso será vinculado ao personal que enviou o convite.
        </p>
      </div>

      {profileLoading && <p className="subtle">Carregando dados do personal...</p>}
      {profileError && <p className="auth-error" role="alert">{profileError}</p>}
      {profileFailed && (
        <button type="button" className={`auth-secondary ${styles.retry}`} onClick={() => setProfileAttempt((value) => value + 1)}>
          Tentar carregar convite novamente
        </button>
      )}
      {profile && (
        <div className="invite-personal">
          <div className="invite-personal-avatar">
            <span>{profile.displayName?.charAt(0).toUpperCase() || 'P'}</span>
          </div>
          <div className="invite-personal-meta">
            <strong>{profile.displayName}</strong>
            <span>{profile.specialization || 'Personal trainer'}</span>
            <span className="invite-personal-code">
              Código {profile.code}
            </span>
          </div>
        </div>
      )}

      {inviteUnavailable ? (
        <div className={styles.existing}>
          <p className="subtle">{hasValidCode ? 'Peça um novo link de convite ao personal.' : 'Abra o link de convite enviado pelo personal para vincular sua conta.'}</p>
          <Link href="/register-aluno" className={`auth-link ${styles.back}`}>Criar conta sem convite</Link>
          <Link href="/login-aluno" className={`auth-link ${styles.back}`}>Entrar como aluno</Link>
        </div>
      ) : isLoading ? (
        <p className="subtle" role="status">Verificando sua conta...</p>
      ) : isAuthenticated ? (
        <div className={styles.existing}>
          <p className="subtle">Conta conectada: <strong>{user?.displayName || user?.email || 'Aluno'}</strong></p>
          {role !== 'aluno' ? (
            <p className="auth-error" role="alert">Este convite é exclusivo para contas de aluno.</p>
          ) : alreadyLinked ? (
            <p role="status">Sua conta já está vinculada a este personal.</p>
          ) : (
            <>
              <p className="subtle">
                {user?.codigoPersonal
                  ? 'Ao continuar, o vínculo com seu personal atual será substituído.'
                  : 'Confirme para adicionar este personal à sua conta de aluno.'}
              </p>
              <button type="button" className="auth-submit" onClick={handleClaim} disabled={loading || profileLoading || !profile}>
                {loading ? 'Vinculando...' : 'Vincular convite à minha conta'}
              </button>
            </>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <Link href="/app" className={`auth-link ${styles.back}`}>Voltar ao painel</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field">
          <span>Nome completo</span>
          <input
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="auth-input"
          />
        </label>
        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="auth-input"
          />
        </label>
        <label className="auth-field">
          <span>Senha</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="auth-input"
          />
        </label>
        <label className="auth-field">
          <span>Confirmar senha</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="********"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="auth-input"
          />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {success ? (
          <button type="button" className="auth-submit" onClick={() => router.replace(loginHref)}>
            Ir para o login
          </button>
        ) : (
          <button type="submit" className="auth-submit" disabled={loading || profileLoading || !profile}>
            {loading ? 'Salvando...' : 'Criar conta'}
          </button>
        )}
        </form>
      )}

      {!inviteUnavailable && !isLoading && !isAuthenticated && <div className={`auth-links ${styles.links}`}>
        <span className="subtle">Já tem conta?</span>
        <Link href={loginHref} className="auth-link">
          Entrar
        </Link>
      </div>}
      {!inviteUnavailable && !isLoading && !isAuthenticated && <div className={`auth-links ${styles.links}`}>
        <Link href="/register-aluno" className="auth-link">
          Criar conta sem convite
        </Link>
      </div>}
    </div>
  );
}
