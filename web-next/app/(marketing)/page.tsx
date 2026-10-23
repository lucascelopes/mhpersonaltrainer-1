import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import DesktopExeLoginRedirect from '@/components/DesktopExeLoginRedirect';
import MobileAwareLink from '@/components/MobileAwareLink';
import { SITE_NAME, absoluteUrl, buildMarketingMetadata } from '@/lib/seo';
import heroPhoto from '@/assets/landing-hero-gym-v2.png';
import peoplePhoto from '@/assets/landing-comparison-v2.png';
import academyPhoto from '@/assets/landing-audience-trainer-v2.png';
import appShowcase from '@/assets/Design-sem-nome-50.webp';
import styles from './page.module.css';

export const metadata: Metadata = buildMarketingMetadata({
  title: 'Mais presença, evolução e controle para o personal',
  description: 'Treinos, avaliações, agenda, conversa e inteligência artificial em uma plataforma completa.',
  path: '/',
  keywords: ['personal trainer', 'gestão de alunos', 'treino com IA', 'software para academia'],
});

const steps = [
  ['01', 'Plano criado', 'Treinos personalizados e prontos para o aluno.'],
  ['02', 'Treino concluído', 'Seu aluno treina e você acompanha.'],
  ['03', 'Feedback enviado', 'Aluno envia percepções em tempo real.'],
  ['04', 'Evolução registrada', 'Resultados visíveis fortalecem o vínculo.'],
] as const;

const plans = [
  ['Mensal', 'R$ 30,00', 'por mês', 'Ideal para começar'],
  ['Bimestral', 'R$ 54,00', 'a cada 2 meses', 'Mais flexibilidade'],
  ['Semestral', 'R$ 150,00', 'a cada 6 meses', 'Mais economia'],
  ['Anual', 'R$ 300,00', 'por ano', 'Melhor custo-benefício'],
] as const;

const quotes = [
  ['A MH me deu mais tempo para estar com meus alunos e acompanhar cada evolução.', 'Carla Menezes', 'Personal Trainer · São Paulo'],
  ['A praticidade para criar e ajustar os treinos é incrível. Meus alunos estão mais engajados.', 'Rafael Lima', 'Personal Trainer · Belo Horizonte'],
  ['Padronizamos o atendimento sem perder o acompanhamento humano de cada aluno.', 'Juliana Costa', 'Gestora de Academia · Curitiba'],
] as const;

export default function MarketingHome() {
  const schema = { '@context': 'https://schema.org', '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/'), logo: absoluteUrl('/icon-512.png') };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <DesktopExeLoginRedirect />

      <section className={styles.hero}>
        <div className={styles.heroPhoto}>
          <Image src={heroPhoto} alt="Personal trainer acompanhando uma aluna" fill priority sizes="50vw" />
          <p className={styles.handNote}>Gente real.<br />Resultados reais.</p>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Tecnologia que potencializa pessoas</span>
            <h1>Mais presença.<br /><em>Mais evolução.</em><br />Menos operação.</h1>
            <p>A MH transforma rotina em acompanhamento de verdade — com treino, conversa, avaliação e IA no mesmo fluxo.</p>
            <div className={styles.actions}>
              <MobileAwareLink href="/register-personal" mobilePath="/register-personal" className={styles.primaryBtn}>Criar minha conta <span>→</span></MobileAwareLink>
              <a href="#produto" className={styles.secondaryBtn}>Ver o produto</a>
            </div>
            <small>Comece agora e leve um acompanhamento mais completo para seus alunos.</small>
          </div>
          <div className={styles.heroDashboard}><Image src={peoplePhoto} alt="Personal e aluna conferem o aplicativo durante o acompanhamento" fill priority sizes="50vw" /></div>
        </div>
      </section>

      <section className={styles.outcomes}>
        <div><strong>Mais alunos</strong><span>em evolução</span></div>
        <div><strong>Mais tempo</strong><span>para o que importa</span></div>
        <div><strong>Mais resultados</strong><span>para o seu negócio</span></div>
      </section>

      <section className={styles.journeySection}>
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>Do plano ao resultado</span>
          <h2>Do plano ao resultado,<br />tudo continua conectado.</h2>
          <p>Da criação do treino ao progresso do aluno, a MH mantém cada etapa no mesmo lugar.</p>
        </div>
        <div className={styles.journey}>{steps.map(([n, title, text]) => <article key={n} className={styles.journeyItem}><span className={styles.stepNumber}>{n}</span><div><strong>{title}</strong><p>{text}</p></div></article>)}</div>
      </section>

      <section className={styles.productSection} id="produto">
        <div className={styles.productCopy}>
          <span className={styles.eyebrowLight}>Sua rotina mais leve</span>
          <h2>Seus alunos mais acompanhados.</h2>
          <p>Veja treinos, avaliações, feedbacks e evolução dos seus alunos em um só lugar.</p>
          <ul><li>Acompanhamento em tempo real</li><li>Histórico completo de cada aluno</li><li>Mais organização e menos tarefas manuais</li><li>Resultados que fortalecem seu negócio</li></ul>
          <Link href="/beneficios" className={styles.primaryBtn}>Conhecer funcionalidades <span>→</span></Link>
        </div>
        <div className={styles.productVisual}><Image src={academyPhoto} alt="Profissional da equipe MH Personal em uma academia" fill sizes="58vw" /></div>
      </section>

      <section className={styles.comparisonSection}>
        <div className={styles.comparisonCopy}>
          <span className={styles.eyebrow}>Menos operação, mais impacto</span>
          <h2>Menos operação manual.<br /><em>Mais presença com os alunos.</em></h2>
          <p>Deixe as planilhas e mensagens soltas para trás. Ganhe tempo, organização e mais momentos de qualidade.</p>
          <div className={styles.comparisonLists}>
            <div className={styles.beforeList}><strong>Como era antes</strong><span>Planilhas e anotações soltas</span><span>Dificuldade para acompanhar evolução</span><span>Informações espalhadas</span></div>
            <div className={styles.afterList}><strong>Com a MH</strong><span>Tudo em um só lugar</span><span>Acompanhamento em tempo real</span><span>Histórico completo e organizado</span></div>
          </div>
        </div>
        <div className={styles.coachingPhoto}><Image src={peoplePhoto} alt="Personal e aluna analisando o aplicativo" fill sizes="48vw" /></div>
      </section>

      <section className={styles.assistantSection} id="assistente">
        <div className={styles.assistantCopy}>
          <span className={styles.eyebrowLight}>MH Assistente</span>
          <h2>Treinos inteligentes<br />com a sua supervisão.</h2>
          <p>O assistente cria treinos com base nos objetivos, nível e histórico do aluno. Você revisa, ajusta e aprova.</p>
          <Link href="/register-personal" className={styles.primaryBtn}>Testar o MH Assistente <span>→</span></Link>
        </div>
        <div className={styles.assistantDemo}>
          <Image src={appShowcase} alt="Personal apresenta o aplicativo MH Personal Trainer" fill sizes="(max-width: 780px) 92vw, 42vw" />
        </div>
      </section>

      <section className={styles.audienceSection} id="publicos">
        <div className={styles.audienceCopy}>
          <span className={styles.eyebrow}>Para cada momento do seu negócio</span>
          <h2>Feito para Personal Trainers e Academias.</h2>
          <div className={styles.audienceColumns}>
            <article><span className={styles.audienceTag}>Personal Trainer</span><p>Mais organização, mais alunos, mais resultados.</p><Link href="/register-personal">Quero ser Personal Trainer →</Link></article>
            <article><span className={styles.audienceTag}>Academia</span><p>Acompanhamento profissional em escala.</p><Link href="/academia">Quero para minha academia →</Link></article>
          </div>
        </div>
        <div className={styles.audiencePhoto}><Image src={academyPhoto} alt="Personal trainer apresentando o aplicativo" fill sizes="38vw" /></div>
      </section>

      <section className={styles.pricingSection} id="planos">
        <div className={styles.pricingHead}><span className={styles.eyebrow}>Escolha o plano ideal</span><h2>Comece hoje a transformar cada acompanhamento.</h2><p>Todos os planos incluem a operação completa do personal e o acompanhamento dos alunos.</p></div>
        <div className={styles.plansGrid}>{plans.map(([name, price, period, note], i) => <article key={name} className={`${styles.planCard} ${i === 3 ? styles.planFeatured : ''}`}>{i === 3 && <span className={styles.popular}>Mais popular</span>}<strong>{name}</strong><p className={styles.price}>{price}</p><small>{period}</small><span>{note}</span><Link href="/register-personal">Escolher plano</Link></article>)}</div>
        <div className={styles.testimonials}>
          <div className={styles.testimonialTitle}><span className={styles.eyebrow}>O que nossos usuários percebem</span><h3>Histórias reais de quem vive a transformação.</h3></div>
          <div className={styles.testimonialGrid}>{quotes.map(([quote, name, role]) => <figure key={name}><blockquote>“{quote}”</blockquote><figcaption><strong>{name}</strong><span>{role}</span></figcaption></figure>)}</div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div><span className={styles.eyebrowLight}>Tecnologia para potencializar pessoas</span><h2>Comece hoje a transformar<br />cada acompanhamento.</h2><p>Mais presença. Mais evolução. Menos operação.</p><MobileAwareLink href="/register-personal" mobilePath="/register-personal" className={styles.primaryBtn}>Criar minha conta <span>→</span></MobileAwareLink></div>
        <span className={styles.androidLink}>Aluno no Android. Personal no web e Windows.</span>
      </section>
    </main>
  );
}
