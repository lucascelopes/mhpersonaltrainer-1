import type { Metadata } from 'next';
import Link from 'next/link';

import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Escolha seu perfil',
  description: 'Escolha o tipo de conta para começar a usar o MH Personal Trainer.',
};

const accountTypes = [
  {
    href: '/register-personal',
    role: 'Personal Trainer',
    description: 'Organize alunos, treinos e agenda em um só lugar.',
    action: 'Cadastrar como Personal',
  },
  {
    href: '/register-academy',
    role: 'Academia',
    description: 'Gerencie a equipe, os alunos e a operação da unidade.',
    action: 'Cadastrar academia',
  },
  {
    href: '/register-aluno',
    role: 'Aluno',
    description: 'O cadastro de aluno é feito pelo app no celular.',
    action: 'Continuar como Aluno',
  },
];

export default function RegistrationChoicePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className="auth-kicker">Criar conta</p>
        <h1>Como você vai usar o MH Personal?</h1>
        <p className={styles.intro}>Escolha seu perfil para abrir o cadastro certo.</p>
      </header>

      <nav className={styles.choices} aria-label="Escolha do tipo de conta">
        {accountTypes.map((account) => (
          <Link className={styles.choice} href={account.href} key={account.role}>
            <span className={styles.role}>{account.role}</span>
            <span className={styles.description}>{account.description}</span>
            <span className={styles.action}>{account.action}<span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </nav>

      <p className={styles.existingAccount}>
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </div>
  );
}
