const PADROES: ReadonlyArray<{ motivo: string; padrao: RegExp }> = [
  { motivo: 'e-mail', padrao: /[\w.+-]{1,64}@[\w-]{1,63}(?:\.[\w-]{1,63})+/u },
  { motivo: 'CPF', padrao: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/u },
  { motivo: 'telefone', padrao: /(?:\+55\s?)?\(?\d{2}\)?\s?9?\d{4}-?\d{4}\b/u },
  { motivo: 'valor monetário', padrao: /R\$\s?\d/u },
  { motivo: 'matrícula', padrao: /\bmatr[ií]cula\s*[:#]?\s*\d+/iu },
  { motivo: 'faixa salarial', padrao: /\b(?:sal[aá]rio|faixa salarial)\b/iu },
];

/** Devolve os motivos pelos quais o texto não pode ser publicado. Lista vazia significa texto aceitável. */
export function detectarDadosSensiveis(texto: string): string[] {
  return PADROES.filter(({ padrao }) => padrao.test(texto)).map(({ motivo }) => motivo);
}
