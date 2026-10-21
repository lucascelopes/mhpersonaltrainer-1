'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function PersonalLoginPage() {
  const { loginAsPersonal, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  const validate = () => {
    if (!email || !password) {
      setError('Informe email e senha.');
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
    const result = await loginAsPersonal(email, password);
    setLoading(false);
    if (result.success) {
      router.replace(redirectTo);
    } else {
      setError(result.error || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <p className="auth-kicker">Área do personal</p>
        <h1>Entrar no painel profissional</h1>
        <p className="subtle">
          Acesso exclusivo para personal trainer, professor ou admin.
        </p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="auth-input"
          />
        </label>
        <div className="auth-field">
          <label htmlFor="auth-password">Senha</label>
          <div className="auth-password">
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-input"
            />
            <button
              type="button"
              className="auth-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar no painel'}
        </button>
      </form>
      <div className="auth-links">
        <Link href="/forgot-password" className="auth-link">
          Esqueci a senha
        </Link>
        <Link href="/login" className="auth-link">
          Login comum
        </Link>
      </div>
    </div>
  );
}
