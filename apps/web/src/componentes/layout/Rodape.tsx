import type { ReactNode } from 'react';

export function Rodape(): ReactNode {
  return (
    <footer className="nuage-rodape">
      <div className="nuage-container">
        <p>
          Esta plataforma ensina o processo da área de Soluções. Ela não calcula precificação nem previsão de horas, não
          gera Proposal Doc ou Proposta Comercial, não possui autenticação e salva o progresso apenas neste navegador. O
          trabalho real acontece na Plataforma NuageIT, no ClickUp e no Kiro.
        </p>
      </div>
    </footer>
  );
}
