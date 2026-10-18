import Link from 'next/link';
import BrandLockup from '@/components/BrandLockup';
import styles from './MarketingFooter.module.css';

const columns = [
  { title: 'Produto', links: [['Funcionalidades', '/#produto'], ['MH Assistente', '/#assistente'], ['Planos', '/#planos'], ['Para academias', '/academia']] },
  { title: 'Empresa', links: [['Sobre nós', '/equipe'], ['Blog', '/beneficios'], ['Carreiras', '/equipe'], ['Contato', '/help']] },
  { title: 'Suporte', links: [['Central de ajuda', '/help'], ['Fale conosco', '/support/ticket'], ['Tutoriais', '/help'], ['Status do sistema', '/help']] },
  { title: 'Legal', links: [['Termos de uso', '/terms'], ['Política de privacidade', '/privacy'], ['Cookies', '/privacy'], ['Exclusão de conta', '/account-deletion']] },
] as const;

export default function MarketingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brand}>
            <BrandLockup className={styles.logoFrame} width={139} height={43} surface="light" />
          </Link>
          <p>Tecnologia que potencializa pessoas.<br />Mais saúde. Mais histórias incríveis.</p>
        </div>

        <div className={styles.linksGrid}>
          {columns.map((column) => (
            <div key={column.title}>
              <strong>{column.title}</strong>
              {column.links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
            </div>
          ))}
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© 2026 MH Personal Trainer. Todos os direitos reservados.</span>
        <span>Desenvolvido por Nagazaki Software.</span>
      </div>
    </footer>
  );
}
