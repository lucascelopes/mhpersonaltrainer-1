'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types/user';

const parsePersonalCode = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const numeric = Number(trimmed);
  if (!Number.isSafeInteger(numeric) || numeric <= 0) return null;
  return numeric;
};

export default function RegisterAlunoPage() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [personalCode, setPersonalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/app');
    }
  }, [isAuthenticated, router]);

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
      setError('Senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return false;
    }
    if (personalCode.trim() && parsePersonalCode(personalCode) === null) {
      setError('Código do personal inválido.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const codigoPersonal = parsePersonalCode(personalCode);
    const extraData: Partial<User> = {
      alunoDesde: new Date(),
    };
    if (codigoPersonal !== null) {
      extraData.codigoPersonal = codigoPersonal;
    }
    const result = await register(email.trim(), password, name.trim(), extraData);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Erro ao cadastrar.');
    }
  };

  return (
    <div className="auth-card auth-card--student">
      <div className="auth-card-header">
        <p className="auth-kicker">Aluno</p>
        <h1>Crie sua conta de aluno</h1>
        <p className="subtle">
          Cadastro rápido para acessar seus treinos e progresso no celular ou computador.
        </p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field">
          <span>Nome completo</span>
          <input
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            required
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
            required
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
            required
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
            required
            placeholder="********"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="auth-input"
          />
        </label>
        <label className="auth-field">
          <span>Código do personal (opcional)</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ex: 1234"
            value={personalCode}
            onChange={(event) => setPersonalCode(event.target.value)}
            className="auth-input"
          />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {success && <p className="auth-success" role="status">Conta criada com sucesso.</p>}
        {success ? (
          <button type="button" className="auth-submit" onClick={() => router.replace('/app')}>
            Ir para o painel
          </button>
        ) : (
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        )}
      </form>
      <div className="auth-links auth-links--account">
        <span className="subtle">Já tem conta?</span>
        <Link href="/login-aluno" className="auth-link">
          Entrar
        </Link>
      </div>
      <div className="auth-links">
        <Link href="/invite" className="auth-link">
          Tenho convite
        </Link>
        <Link href="/login" className="auth-link">
          Entrar como personal
        </Link>
      </div>
    </div>
  );
}
