'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loginPath, setLoginPath] = useState('/login');

  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get('from');
    if (from === 'academy') setLoginPath('/academy-login');
    if (from === 'student') setLoginPath('/login-aluno');
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setError('Informe seu e-mail.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('E-mail inválido.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);
    if (result.success) {
      setMessage('Link enviado para seu e-mail.');
    } else {
      setError(result.error || 'Erro ao enviar link.');
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <p className="auth-kicker">Recuperar acesso</p>
        <h1>Recuperar senha</h1>
        <p className="subtle">Enviaremos um link de recuperação para seu e-mail.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field">
          <span>E-mail</span>
          <input
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="auth-input"
          />
        </label>
        {message && <p className="auth-success" role="status">{message}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>
      <div className="auth-links auth-links--account">
        <Link href={loginPath} className="auth-link">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
