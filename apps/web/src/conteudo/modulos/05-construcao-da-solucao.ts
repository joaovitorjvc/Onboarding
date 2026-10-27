import { criarModulo, secaoPendente } from '../apoio.ts';

export const moduloConstrucaoDaSolucao = criarModulo('construcao-da-solucao', 5, 'Construção da solução', [
  secaoPendente('texto', 'proposal-doc-fonte-da-verdade', 'Proposal Doc como fonte da verdade'),
  secaoPendente('passos', 'ordem-dos-documentos', 'Ordem dos documentos'),
  secaoPendente('lista', 'estrutura-do-proposal-doc', 'Estrutura do Proposal Doc'),
  secaoPendente('texto', 'relacao-com-a-proposta-comercial', 'Relação com a Proposta Comercial'),
  secaoPendente('lista', 'terminologia-oficial', 'Terminologia oficial'),
  secaoPendente('lista', 'onde-cada-documento-e-gerado', 'Onde cada documento é gerado'),
  secaoPendente('passos', 'geracao-da-imagem-da-arquitetura', 'Geração da imagem da arquitetura'),
  secaoPendente('modelo-de-prompt', 'prompt-da-imagem-da-arquitetura', 'Prompt da imagem da arquitetura'),
  secaoPendente('lista', 'boas-praticas-da-calculadora-aws', 'Boas práticas da calculadora AWS'),
  secaoPendente('lista', 'minimos-cloudwatch-na-calculadora', 'Mínimos de CloudWatch na calculadora'),
  secaoPendente('texto', 'estimativa-de-tokens-de-ia-na-calculadora', 'Estimativa de tokens de IA na calculadora'),
  secaoPendente('lista', 'servicos-de-seguranca-na-composicao', 'Serviços de segurança na composição'),
  secaoPendente('lista', 'cenarios-de-multi-account', 'Cenários de multi-account'),
  secaoPendente('referencias', 'referencias-da-construcao', 'Referências da construção'),
]);
