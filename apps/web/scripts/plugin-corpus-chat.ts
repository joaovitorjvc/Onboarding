import type { Plugin } from 'vite';
import { GLOSSARIO } from '../src/conteudo/glossario.ts';
import { REFERENCIAS } from '../src/conteudo/referencias.ts';
import { TRILHA } from '../src/conteudo/trilha.ts';
import { validarTrilha } from '../src/dominio/conteudo/validar.ts';
import { verificarCorrespondencia } from '../src/dominio/referencias/coletar.ts';
import { avaliarCorpus, montarCorpus } from '../src/servicos/corpus.ts';
import { validarCorpus } from '../src/servicos/validar-corpus.ts';

/**
 * Valida o conteúdo, aplica o orçamento do corpus e publica `conteudo-chat.json` junto ao build.
 * Por rodar dentro do Vite, a geração acontece depois da limpeza de `dist/` sem precisar de outra ferramenta.
 */
export function pluginCorpusChat(): Plugin {
  return {
    name: 'onboarding-corpus-chat',
    apply: 'build',
    generateBundle() {
      const erros = [...validarTrilha(TRILHA), ...verificarCorrespondencia(TRILHA, REFERENCIAS)];
      if (erros.length > 0) this.error(`Conteúdo inválido:\n${erros.join('\n')}`);

      const corpus = montarCorpus(TRILHA, GLOSSARIO, new Date().toISOString());
      const validacao = validarCorpus(corpus);
      if (!validacao.ok) this.error(`Corpus inválido:\n${validacao.erros.join('\n')}`);

      const relatorio = avaliarCorpus(corpus);
      if (relatorio.erros.length > 0) this.error(`Corpus reprovado:\n${relatorio.erros.join('\n')}`);

      this.emitFile({ type: 'asset', fileName: 'conteudo-chat.json', source: JSON.stringify(corpus, null, 2) });
    },
  };
}
