import Image from 'next/image';
import type { CSSProperties } from 'react';
import styles from './BrandLockup.module.css';

type BrandLockupProps = {
  className?: string;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  priority?: boolean;
  surface?: 'theme' | 'light' | 'dark';
};

export default function BrandLockup({
  className,
  width = 184,
  height = 52,
  priority = false,
  surface = 'theme',
}: BrandLockupProps) {
  return (
    <span
      className={[styles.frame, className].filter(Boolean).join(' ')}
      data-brand-surface={surface}
      style={{ width, height }}
    >
      <Image
        className={styles.image}
        src="/brand/PT_transparente.png"
        alt="MH Personal Trainer"
        width={8378}
        height={3333}
        unoptimized
        priority={priority}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '158%',
          maxWidth: 'none',
          height: 'auto',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </span>
  );
}
