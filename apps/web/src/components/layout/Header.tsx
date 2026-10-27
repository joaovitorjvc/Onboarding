import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { BookOpen, Compass, House, Layers, Sparkles } from 'lucide-react';
import type { IconName } from '@nuagehub/contracts';
import styles from './Header.module.css';

const navigation: ReadonlyArray<{
  to: '/' | '/primeiros-passos' | '/plataformas' | '/playbook';
  label: string;
  icon: IconName;
}> = [
  { to: '/', label: 'Página Inicial', icon: 'house' },
  { to: '/primeiros-passos', label: 'Primeiros passos', icon: 'compass' },
  { to: '/plataformas', label: 'Plataformas', icon: 'layers' },
  { to: '/playbook', label: 'Playbook', icon: 'book-open' },
];

const icons = { house: House, compass: Compass, layers: Layers, 'book-open': BookOpen };

export function Header(): ReactNode {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <NavLink className={styles.logo} to="/" aria-label="NuageHub - Página Inicial">
          <span className={styles.logoIcon}>
            <Sparkles aria-hidden="true" />
          </span>
          <span className={styles.logoText}>
            Nuage<span>Hub</span>
          </span>
        </NavLink>
        <nav className={styles.navBar} aria-label="Navegação principal">
          {navigation.map(({ to, label, icon }) => {
            const NavigationIcon = icons[icon as keyof typeof icons];
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `${styles.navButton} ${isActive ? styles.active : ''}`}
              >
                <NavigationIcon aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className={styles.userBadge}>Novo SDR</div>
      </div>
    </header>
  );
}
