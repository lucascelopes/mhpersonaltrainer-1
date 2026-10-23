import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMarketingMetadata } from '@/lib/seo';
import MobileAwareLink from '@/components/MobileAwareLink';
import styles from './page.module.css';

export const metadata: Metadata = buildMarketingMetadata({
  title: 'Equipe',
  description: 'Conheça a equipe por trás do MH Personal Trainer e o foco em produto, suporte e resultado.',
  path: '/equipe',
  keywords: [
    'equipe mh personal trainer',
    'time fitness tech',
    'suporte personal trainer'
  ],
});
const team = [
  {
    name: 'Produto',
    role: 'Experiência de uso',
    bio: 'Traduz a rotina do personal em fluxos simples e claros.',
  },
  {
    name: 'Tecnologia',
    role: 'Web e mobile',
    bio: 'Integra web e mobile com foco em performance.',
  },
  {
    name: 'Treinamento',
    role: 'Rotina de treino',
    bio: 'Ajusta treinos, metas e indicadores de resultado.',
  },
  {
    name: 'Atendimento',
    role: 'Suporte',
    bio: 'Onboarding, suporte humano e acompanhamento diário.',
  },
];

const values = [
  {
    title: 'Clareza',
    text: 'Interfaces que ajudam o aluno a treinar e o personal a acompanhar.',
  },
  {
    title: 'Resultado',
    text: 'Tudo o que medimos vira decisão para o personal e para a academia.',
  },
  {
    title: 'Parceria',
    text: 'Acompanhamos cada etapa da implantação e evolução do sistema.',
  },
];

export default function EquipePage() {
  return (
    <div className={`marketing-page ${styles.page}`}>
      <section className="marketing-hero marketing-hero--compact">
        <div className="container marketing-hero-grid">
          <div className="marketing-hero-copy">
            <span className="marketing-eyebrow">Nossa equipe</span>
            <h1>Gente que entende sua rotina.</h1>
            <p className="marketing-lead">
              Produto, tecnologia e suporte para tornar o trabalho de personais e academias mais simples e o treino
              dos alunos mais consistente.
            </p>
            <div className="marketing-cta-row">
              <Link href="/cadastro" className="marketing-button">
                Criar conta
              </Link>
              <Link href="/beneficios" className="marketing-button ghost">
                Ver benefícios
              </Link>
            </div>
          </div>
          <div className="marketing-hero-panel">
            <div className="marketing-hero-panel-card">
              <span className="marketing-panel-title">Suporte humano</span>
              <p>Onboarding guiado, respostas rápidas e acompanhamento contínuo.</p>
            </div>
            <div className="marketing-hero-panel-card">
              <span className="marketing-panel-title">Produto evolutivo</span>
              <p>Melhorias contínuas na web e no Android. Versão para iOS em breve.</p>
            </div>
            <div className="marketing-hero-panel-card">
              <span className="marketing-panel-title">Resultados claros</span>
              <p>Indicadores que ajudam academia e personal a decidir.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section">
        <div className="container">
          <div className="marketing-section-head">
            <span className="marketing-eyebrow">Nosso jeito de trabalhar</span>
            <h2>Valores que orientam cada entrega</h2>
            <p>O que fazemos é sempre pensado para reduzir atrito na operação.</p>
          </div>
          <div className="marketing-feature-grid">
            {values.map((value) => (
              <div key={value.title} className="marketing-feature-card">
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-surface">
        <div className="container">
          <div className="marketing-section-head">
            <span className="marketing-eyebrow">Áreas de atuação</span>
            <h2>Produto, treino e experiência digital no mesmo fluxo</h2>
            <p>Conheça as frentes que ajudam a evoluir a experiência de alunos, personais e academias.</p>
          </div>
          <div className="marketing-team-grid">
            {team.map((member) => (
              <div key={member.name} className="marketing-team-card">
                <span className="marketing-team-role">{member.role}</span>
                <h3>{member.name}</h3>
                <p>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-cta">
        <div className="container marketing-cta-inner">
          <div>
            <span className="marketing-eyebrow">Vamos conversar</span>
            <h2>Pronto para levar o MH para sua operação?</h2>
            <p>Crie sua conta e tenha a equipe ao seu lado desde o primeiro dia.</p>
          </div>
          <div className="marketing-cta-row">
            <Link href="/cadastro" className="marketing-button">
              Criar conta
            </Link>
            <MobileAwareLink href="/login" mobilePath="/login" className="marketing-button ghost">
              Entrar
            </MobileAwareLink>
          </div>
        </div>
      </section>
    </div>
  );
}


