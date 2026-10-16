import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

export function useFocusHeadingOnRouteChange(): void {
  const location = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const heading = document.querySelector<HTMLElement>('#conteudo h1, h1');
    heading?.focus();
  }, [location.pathname]);
}
