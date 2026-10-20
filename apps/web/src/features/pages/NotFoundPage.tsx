import type { ReactNode } from 'react';
import { Link } from 'react-router';

export function NotFoundPage(): ReactNode {
  return (
    <main id="conteudo" className="not-found" aria-labelledby="not-found-title">
      <title>Página não encontrada - NuageHub</title>
      <h1 id="not-found-title" tabIndex={-1}>
        Página não encontrada
      </h1>
      <p>A página que você tentou acessar não existe.</p>
      <Link to="/">Voltar para o Início</Link>
    </main>
  );
}
