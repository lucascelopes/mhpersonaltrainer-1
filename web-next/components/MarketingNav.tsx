import Link from 'next/link';
import MobileAwareLink from '@/components/MobileAwareLink';
import BrandLockup from '@/components/BrandLockup';
import styles from './MarketingNav.module.css';

const navItems = [
  { href: '/', label: 'Início' },
  { href: '/#produto', label: 'Funcionalidades' },
  { href: '/#planos', label: 'Planos' },
  { href: '/equipe', label: 'Sobre' },
];

export default function MarketingNav() {
  return (
    <header className={styles.navShell}>
      <div className={`container ${styles.navInner}`}>
        <Link href="/" className={styles.brand} aria-label="MH Personal Trainer - Início">
          <BrandLockup className={styles.logoFrame} width={139} height={43} surface="light" priority />
        </Link>

        <nav className={styles.navMenu} aria-label="Navegação principal">
          {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>

        <div className={styles.actions}>
          <MobileAwareLink href="/login" mobilePath="/login" className={styles.loginBtn}>Entrar</MobileAwareLink>
          <Link href="/cadastro" className={styles.ctaBtn}>
            Criar conta
          </Link>
        </div>

        <details className={styles.mobileMenu}>
          <summary>Explorar o site</summary>
          <nav aria-label="Navegação principal no celular">
            {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
            <Link href="/cadastro">Criar conta</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
