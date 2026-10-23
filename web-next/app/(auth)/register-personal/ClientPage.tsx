'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { generateAvailablePersonalCode } from '@/lib/services/personalCode';
import { internalAuthRedirect } from '@/lib/authRedirect';
import styles from '../responsive-auth.module.css';

export default function RegisterPersonalPage() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = internalAuthRedirect(searchParams.get('redirect'), '/app');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [personalCode, setPersonalCode] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const registrationStarted = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !registrationStarted.current) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  const validate = () => {
    if (!name.trim()) {
      setError('Nome obrigatório.');
      return false;
    }
    if (!email.trim()) {
      setError('E-mail obrigatório.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
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
    if (!validate()) return;
    registrationStarted.current = true;
    setLoading(true);
    let code: number;
    try {
      code = await generateAvailablePersonalCode();
    } catch {
      setLoading(false);
      setError('Não foi possível verificar um código de personal. Tente novamente.');
      return;
    }
    const result = await register(email.trim(), password, name.trim(), {
      professorAccount: true,
      codigoPersonal: code,
    });
    setLoading(false);
    if (result.success) {
      setPersonalCode(code);
      setSuccess(true);
    } else {
      setError(result.error || 'Erro ao cadastrar.');
    }
  };

  return (
    <div className={`auth-card ${styles.responsiveAuthCard}`}>
      <div className="auth-card-header">
        <p className="auth-kicker">Cadastro profissional</p>
        <h1>Crie sua conta de personal</h1>
        <p className="subtle">
          Tenha um painel completo para treinos, avaliações, agenda e comunicação.
        </p>
      </div>
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
        {personalCode && (
          <div className="auth-code">
            <span>Seu código de personal</span>
            <strong>{personalCode}</strong>
          </div>
        )}
        {success ? (
          <button
            type="button"
            className="auth-submit"
            onClick={() => router.replace(redirectTo)}
          >
            Ir para o painel
          </button>
        ) : (
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Criar conta'}
          </button>
        )}
      </form>
      <div className="auth-links auth-links--account">
        <span className="subtle">Já tem conta?</span>
        <Link href="/personal-login" className="auth-link">
          Entrar
        </Link>
      </div>
    </div>
  );
}
