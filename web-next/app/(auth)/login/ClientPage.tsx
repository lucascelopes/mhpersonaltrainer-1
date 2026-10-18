'use client';

import Link from 'next/link';
import { useState, useEffect, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AppleLogo,
  ArrowRight,
  Barbell,
  Buildings,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  GoogleLogo,
  LockKey,
  ShieldCheck,
  User,
} from '@phosphor-icons/react';
import BrandLockup from '@/components/BrandLockup';
import { useAuth } from '@/lib/auth';
import { isMobileOrTablet } from '@/lib/device';
import { getMobileAppUrl } from '@/lib/mobileApp';
import styles from './login.module.css';

export default function LoginPage() {
  const { login, loginWithGoogle, loginWithApple, isAuthenticated, role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const getDefaultRedirect = (currentRole: typeof role) => {
    if (currentRole === 'admin') return '/admin';
    if (currentRole === 'academy') return '/academy';
    return '/app';
  };
  const resolveRedirect = (currentRole: typeof role) => {
    if (!redirectParam) return getDefaultRedirect(currentRole);
    if (redirectParam.startsWith('/academy') && currentRole !== 'academy') {
      return getDefaultRedirect(currentRole);
    }
    if (redirectParam.startsWith('/admin') && currentRole !== 'admin') {
      return getDefaultRedirect(currentRole);
    }
    return redirectParam;
  };
  const redirectTo = resolveRedirect(role);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const mobileUrl = getMobileAppUrl('/login');
    if (mobileUrl && isMobileOrTablet()) {
      window.location.replace(mobileUrl);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && role) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, role, router]);

  const validate = () => {
    if (!email || !password) {
      setError('Informe e-mail e senha.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('E-mail inválido.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login.');
    }
  };

  const handleGoogle = async () => {
    setSocialLoading(true);
    const result = await loginWithGoogle();
    setSocialLoading(false);
    if (!result.success) {
      setError(result.error || 'Falha ao entrar com Google.');
    }
  };

  const handleApple = async () => {
    setSocialLoading(true);
    const result = await loginWithApple();
    setSocialLoading(false);
    if (!result.success) {
      setError(result.error || 'Falha ao entrar com Apple.');
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.mobileIntro}>
        <div className={styles.mobileBrandRow}>
          <Link href="/" aria-label="MH Personal Trainer — início">
            <BrandLockup width={164} height={50} surface="light" priority />
          </Link>
          <span className={styles.mobileBrandWords}>
            Disciplina
            <br />
            Evolução
            <br />
            Resultados
          </span>
        </div>
        <p className={styles.mobileKicker}>Portal MH</p>
        <h2 className={styles.mobileHeadline}>
          Seu próximo passo <span>começa aqui.</span>
        </h2>
        <p className={styles.mobileLead}>Entre para acompanhar sua evolução.</p>
        <nav className={styles.roleNav} aria-label="Tipo de acesso">
          <span className={styles.roleActive} aria-current="page">
            <Barbell aria-hidden="true" />
            Personal
          </span>
          <Link href="/academy-login">
            <Buildings aria-hidden="true" />
            Academia
          </Link>
          <Link href="/login-aluno">
            <User aria-hidden="true" />
            Aluno
          </Link>
        </nav>
      </div>

      <div className="auth-card">
        <div className={styles.loginCard}>
          <div className="auth-card-header">
            <p className="auth-kicker">Portal profissional</p>
            <h1>Entrar no painel</h1>
            <p className={`subtle ${styles.desktopSubtitle}`}>
              Acesso para personal, admin e academia. Aluno entra pelo painel mobile.
            </p>
            <p className={styles.mobileSubtitle}>Acesse sua conta e continue evoluindo.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-field">
              <span>E-mail</span>
              <div className={styles.inputWrap}>
                <EnvelopeSimple className={styles.inputIcon} aria-hidden="true" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  className="auth-input"
                />
              </div>
            </label>
            <label className="auth-field">
              <span>Senha</span>
              <div className="auth-password">
                <LockKey className={styles.inputIcon} aria-hidden="true" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <span className={styles.desktopToggleText}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </span>
                  {showPassword ? (
                    <EyeSlash className={styles.mobileToggleIcon} aria-hidden="true" />
                  ) : (
                    <Eye className={styles.mobileToggleIcon} aria-hidden="true" />
                  )}
                </button>
              </div>
            </label>
            <Link href="/forgot-password" className={styles.mobileForgot}>
              Esqueci a senha
            </Link>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="auth-submit" disabled={loading || socialLoading}>
              {loading ? 'Entrando...' : 'Entrar'}
              <ArrowRight className={styles.mobileButtonIcon} aria-hidden="true" />
            </button>
          </form>

          <div className="auth-divider">
            <span className={styles.desktopDivider}>ou</span>
            <span className={styles.mobileDivider}>ou continue com</span>
          </div>

          <div className="auth-form">
            <button
              type="button"
              className="auth-secondary"
              onClick={handleGoogle}
              disabled={loading || socialLoading}
            >
              <GoogleLogo className={styles.socialIcon} aria-hidden="true" />
              {socialLoading ? 'Conectando...' : 'Entrar com Google'}
            </button>
            <button
              type="button"
              className="auth-secondary"
              onClick={handleApple}
              disabled={loading || socialLoading}
            >
              <AppleLogo className={styles.socialIcon} aria-hidden="true" />
              {socialLoading ? 'Conectando...' : 'Entrar com Apple'}
            </button>
          </div>
          <p className={styles.mobileSecurity}>
            <ShieldCheck aria-hidden="true" />
            Acesso seguro e seus dados sempre protegidos.
          </p>
        </div>

        <section className="auth-access">
          <div className="auth-access-header">
            <span className="subtle">Outras opções de acesso</span>
            <Link href="/forgot-password" className="auth-link">
              Esqueci a senha
            </Link>
          </div>

          <div className="auth-access-list">
            <div className="auth-access-item">
              <div>
                <p className="auth-access-title">Personal</p>
                <p className="subtle">Conta profissional no painel web.</p>
              </div>
              <div className="auth-access-actions">
                <Link href="/register" className="auth-link auth-link-chip">
                  Criar conta de personal
                </Link>
              </div>
            </div>

            <div className="auth-access-item">
              <div>
                <p className="auth-access-title">Academia</p>
                <p className="subtle">Acesso de gestão para equipes e operação.</p>
              </div>
              <div className="auth-access-actions">
                <Link href="/academy-login" className="auth-link auth-link-chip">
                  Entrar
                </Link>
                <Link href="/register-academy" className="auth-link auth-link-chip">
                  Criar conta
                </Link>
              </div>
            </div>

            <div className="auth-access-item">
              <div>
                <p className="auth-access-title">Aluno (mobile)</p>
                <p className="subtle">Fluxo focado no app para acompanhamento diário.</p>
              </div>
              <div className="auth-access-actions">
                <Link href="/login-aluno" className="auth-link auth-link-chip">
                  Entrar
                </Link>
                <Link href="/register-aluno" className="auth-link auth-link-chip">
                  Criar conta
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <p className={styles.mobileFooter}>
        Pessoas mais fortes
        <br />
        todos os dias
      </p>
    </div>
  );
}
