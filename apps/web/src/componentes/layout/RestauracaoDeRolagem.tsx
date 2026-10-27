import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router';

/** Ao trocar de rota, volta ao topo e move o foco para o conteúdo principal. */
export function RestauracaoDeRolagem(): ReactNode {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('conteudo-principal')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}
