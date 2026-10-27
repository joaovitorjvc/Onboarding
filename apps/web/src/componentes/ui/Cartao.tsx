import { useId, type ReactNode } from 'react';

export interface CartaoProps {
  tom?: 'claro' | 'invertido';
  /** Rótulo visual acima do título. Decorativo: o título real é o `h2`/`h3`. */
  sobretitulo?: string;
  titulo?: string;
  nivel?: 2 | 3;
  children: ReactNode;
}

/** Superfície semântica de conteúdo: borda neutra e raio grande, sem sombra pesada. */
export function Cartao({ tom = 'claro', sobretitulo, titulo, nivel = 2, children }: CartaoProps): ReactNode {
  const idTitulo = useId();
  const Titulo = nivel === 2 ? 'h2' : 'h3';
  const classe = tom === 'invertido' ? 'nuage-cartao nuage-cartao--invertido' : 'nuage-cartao';

  return (
    <section className={classe} aria-labelledby={titulo ? idTitulo : undefined}>
      {sobretitulo ? (
        <p className="nuage-sobretitulo" aria-hidden="true">
          {sobretitulo}
        </p>
      ) : null}
      {titulo ? (
        <Titulo id={idTitulo} className="nuage-cartao-titulo">
          {titulo}
        </Titulo>
      ) : null}
      {children}
    </section>
  );
}
