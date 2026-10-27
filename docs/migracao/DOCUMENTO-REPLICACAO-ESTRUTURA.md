# Documento de replicação da estrutura do site — Onboarding Solutions

> **Finalidade:** servir como especificação técnica para reconstruir a estrutura, o comportamento, o conteúdo, a aparência e os critérios de validação da Plataforma de Onboarding da NuageIT.
>
> **Implementação canônica:** aplicação React em `src/`.
>
> **Implementação paralela registrada:** protótipo estático em `Onboarding/`. Ele é documentado no final deste arquivo, mas não deve ser combinado automaticamente com a aplicação React.
>
> **Idioma do produto e da documentação:** português brasileiro, preservando nomes oficiais e termos técnicos registrados no Glossário.

---

## 1. Visão geral

A Plataforma de Onboarding é um guia navegável do processo da área de Soluções da NuageIT. Ela conduz o Arquiteto por uma Trilha de exatamente 11 Modulos, do primeiro dia até a condução autônoma de uma oportunidade, e permanece disponível como base de consulta.

A plataforma:

- apresenta conteúdo estruturado e rastreável;
- registra a conclusão de Modulos e itens de checklist no `localStorage` do navegador;
- oferece triagem de escopo;
- permite busca textual client-side;
- apresenta glossário, referências e pendências;
- oferece um chat flutuante que responde somente com base no conteúdo publicado;
- publica um corpus estático para o Serviço de Chat.

A plataforma **não**:

- calcula precificação ou previsão de horas;
- gera `Proposal Doc` ou `Proposta Comercial`;
- lê o repositório Cog Solutions em build ou em tempo de execução;
- possui autenticação, perfil ou banco de dados;
- salva progresso em servidor;
- executa o processo de trabalho fora do navegador.

O trabalho real continua sendo executado na Plataforma NuageIT, no ClickUp e no Kiro com o repositório Cog Solutions. A aplicação apenas ensina o processo e aponta os ambientes corretos.

### 1.1 Fontes de verdade

| Assunto                           | Fonte no projeto                                            |
| --------------------------------- | ----------------------------------------------------------- |
| Requisitos funcionais             | `.kiro/specs/onboarding-solutions-platform/requirements.md` |
| Decisões arquiteturais            | `.kiro/specs/onboarding-solutions-platform/design.md`       |
| Ordem de implementação            | `.kiro/specs/onboarding-solutions-platform/tasks.md`        |
| Produto                           | `.kiro/steering/produto.md`                                 |
| Stack e arquitetura de diretórios | `.kiro/steering/stack-tecnica.md`                           |
| Padrões de código                 | `.kiro/steering/padroes-de-codigo.md`                       |
| Conteúdo dos Modulos              | `.kiro/steering/padrao-de-conteudo-dos-modulos.md`          |
| Aplicação visual                  | `.kiro/steering/aplicacao-do-brandbook.md`                  |
| Evolução da solução               | `.kiro/steering/construcao-de-novas-funcionalidades.md`     |
| Dados publicados                  | `src/conteudo/`                                             |
| Cores e contraste                 | `src/dominio/estilo/contraste.ts`                           |
| Tokens computáveis                | `src/estilos/tokens.ts`                                     |
| Tokens CSS                        | `src/estilos/tokens.css`                                    |
| Comportamento verificável         | `testes/`                                                   |

Em caso de divergência, o Brandbook prevalece sobre identidade visual; o Design System NuageIT prevalece sobre aplicação em interface, densidade, enquadramento e raios de componentes.

---

## 2. Stack e versões

As versões abaixo são as declaradas em `package.json` e devem ser preservadas na réplica, salvo decisão explícita de atualização:

### Produção

- React `19.2.8`;
- React DOM `19.2.8`;
- React Router DOM `7.18.3`;
- TypeScript `5.9.3` em modo estrito;
- Vite `8.2.2`;
- `vite-node` para scripts TypeScript;
- publicação estática na Vercel.

### Desenvolvimento e testes

- Vitest `5.0.0`;
- `fast-check` `4.9.0`;
- Testing Library React `16.3.3`;
- Testing Library DOM `10.4.1`;
- Testing Library User Event `14.6.7`;
- `axe-core` `4.13.0`;
- `vitest-axe` `0.1.0`;
- `jsdom` `30.0.1`;
- `@testing-library/jest-dom` `7.0.1`.

### Restrições técnicas

- `strict: true`;
- `noUncheckedIndexedAccess: true`;
- `noImplicitOverride: true`;
- `noUnusedLocals: true`;
- `noUnusedParameters: true`;
- `noFallthroughCasesInSwitch: true`;
- `forceConsistentCasingInFileNames: true`;
- nenhum `any` no código publicado;
- domínio sem React, DOM ou efeitos colaterais;
- sem biblioteca de estado global, formulários, estilos, ícones ou busca;
- ícones desenhados no próprio projeto;
- componentes consultados nos testes por papel e texto acessível, nunca por classe ou `data-testid`.

---

## 3. Como executar

### 3.1 Pré-requisitos

- Node.js compatível com a versão usada pelo Vite instalado;
- npm;
- dependências instaladas com `npm install`;
- variável `VITE_URL_SERVICO_CHAT` configurada.

O arquivo `.env` local é ignorado pelo Git. A réplica deve partir de `.env.example`:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Conteúdo esperado do exemplo:

```dotenv
VITE_URL_SERVICO_CHAT=http://localhost:3333
```

O plugin `scripts/pluginValidarAmbiente.ts` interrompe o build quando a variável está ausente, vazia, apenas com espaços, ou não é uma URL absoluta com esquema `http` ou `https`.

### 3.2 Comandos

| Comando                      | Resultado                                                               |
| ---------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`                | Inicia o Vite em desenvolvimento, normalmente na porta `5173`.          |
| `npm run build`              | Executa typecheck, guarda de orçamento, build Vite e geração do corpus. |
| `npm run preview`            | Serve o conteúdo de `dist/`.                                            |
| `npm test`                   | Vitest interativo.                                                      |
| `npm run test:run`           | Executa toda a suíte uma vez.                                           |
| `npm run typecheck`          | Executa `tsc --noEmit`.                                                 |
| `npm run conteudo:orcamento` | Monta e estima o corpus de grounding.                                   |
| `npm run conteudo:chat`      | Gera `dist/conteudo-chat.json` sem refazer o build.                     |

A ordem do build é obrigatória:

```text
npm run typecheck
  -> vite-node scripts/verificar-orcamento-corpus.ts
  -> vite build
  -> vite-node scripts/gerar-conteudo-chat.ts
```

A geração do corpus ocorre depois de `vite build`, porque o Vite limpa `dist/` ao iniciar.

---

## 4. Árvore do repositório

A árvore abaixo separa código-fonte replicável de dependências e artefatos gerados.

```text
onboarding-solutions/
├─ .env.example
├─ .gitignore
├─ index.html
├─ package.json
├─ package-lock.json
├─ README.md
├─ prompt.md
├─ tsconfig.json
├─ vite.config.ts
├─ vitest.config.ts
├─ vitest-baseline.json
├─ .agents/
│  └─ tasks/
│     ├─ analise-tecnologias-projeto.md
│     └─ diagnostico-erro-jsx-inicio.md
├─ .kiro/
│  ├─ specs/onboarding-solutions-platform/
│  │  ├─ .config.kiro
│  │  ├─ design.md
│  │  ├─ requirements.md
│  │  ├─ tasks.md
│  │  └─ tasks.meta.json
│  └─ steering/
│     ├─ aplicacao-do-brandbook.md
│     ├─ construcao-de-novas-funcionalidades.md
│     ├─ padrao-de-conteudo-dos-modulos.md
│     ├─ padroes-de-codigo.md
│     ├─ produto.md
│     └─ stack-tecnica.md
├─ public/
│  └─ fontes/
│     └─ .gitkeep
├─ scripts/
│  ├─ .gitkeep
│  ├─ gerar-conteudo-chat.ts
│  ├─ gerarConteudoChat.ts
│  ├─ orcamentoCorpus.ts
│  ├─ pluginValidarAmbiente.ts
│  └─ verificar-orcamento-corpus.ts
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ rotas.tsx
│  ├─ componentes/
│  ├─ conteudo/
│  ├─ dominio/
│  ├─ estilos/
│  ├─ hooks/
│  ├─ paginas/
│  └─ servicos/
├─ testes/
│  ├─ acessibilidade/
│  ├─ propriedades/
│  ├─ unidade/
│  ├─ configurar.ts
│  └─ trilhaExemplo.ts
└─ Onboarding/
   ├─ index.html
   ├─ primeiros-passos.html
   ├─ plataformas.html
   ├─ playbook.html
   └─ styles.css
```

Não replicar como código-fonte:

- `node_modules/`: dependências instaladas;
- `dist/`: artefato gerado pelo build;
- `.env`: configuração local;
- arquivos de log e relatórios locais cobertos por `.gitignore`.

O documento atual (`DOCUMENTO-REPLICACAO-ESTRUTURA.md`) é documentação de apoio e deve ser mantido junto ao projeto se a réplica for entregue como repositório.

---

## 5. Arquivos de entrada e configuração

### `index.html`

- declara `lang="pt-BR"`;
- define viewport responsivo;
- pré-conecta ao Google Fonts;
- importa `Inter` e `Montserrat`;
- define o título `Onboarding Solutions — NuageIT`;
- fornece `<div id="raiz"></div>`;
- carrega `/src/main.tsx`.

### `src/main.tsx`

1. procura `#raiz`;
2. falha explicitamente se o elemento não existir;
3. monta `<App />` em `StrictMode` com `createRoot`.

### `src/App.tsx`

Importa as folhas globais na ordem:

```text
base.css
formas.css
componentes.css
composicao.css
```

Em seguida envolve `<Rotas />` em `BrowserRouter`.

### `src/rotas.tsx`

`Rotas` aceita uma `Trilha` e opções injetáveis para testes. Todas as páginas ficam sob um único `LayoutRaiz`, que mantém o progresso, a barra lateral, o rodapé, a restauração de rolagem e o chat persistentes durante a navegação.

### `vite.config.ts`

- plugin React;
- plugin `pluginValidarAmbiente()`;
- saída em `dist`;
- sourcemap habilitado;
- servidor local na porta `5173`.

### `vitest.config.ts`

- deriva da configuração Vite;
- ambiente `jsdom`;
- `setupFiles: ./testes/configurar.ts`;
- inclui `testes/**/*.test.{ts,tsx}` e `src/**/*.test.{ts,tsx}`;
- habilita CSS;
- timeout de teste de 30 segundos para propriedades que montam componentes.

### `tsconfig.json`

Inclui `src`, `testes`, `scripts`, `vite.config.ts` e `vitest.config.ts`, com `noEmit: true` e as restrições estritas listadas na seção de stack.

---

## 6. Arquitetura de camadas

A direção de dependência é única:

```text
conteudo -> dominio -> servicos -> hooks -> componentes -> paginas
```

`src/dominio/` não importa React, não acessa DOM, não faz entrada/saída e devolve erros como valores tipados. `src/conteudo/` contém dados tipados e construtores, não regra de negócio.

```text
main.tsx
  -> App.tsx
     -> BrowserRouter
        -> Rotas
           -> LayoutRaiz
              ├─ ProvedorProgresso
              ├─ BarraLateral
              ├─ RestauracaoDeRolagem
              ├─ Outlet / página atual
              ├─ Rodape
              └─ PainelChat
```

### 6.1 Responsabilidade de cada camada

| Diretório                 | Responsabilidade                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/conteudo/`           | Trilha, 11 Modulos, Glossário, Banco de Perguntas e referências.                                              |
| `src/dominio/`            | Tipos e funções puras de conteúdo, progresso, triagem, busca, pendências, referências, glossário e contraste. |
| `src/servicos/`           | Contratos do chat/corpus, validação do corpus e cliente HTTP.                                                 |
| `src/hooks/`              | Ponte entre o domínio/serviço e o estado React.                                                               |
| `src/componentes/layout/` | Moldura persistente, barra, chat, progresso e rolagem.                                                        |
| `src/componentes/ui/`     | Primitivos visuais e acessíveis.                                                                              |
| `src/componentes/modulo/` | Renderizadores das variantes de seção.                                                                        |
| `src/componentes/chat/`   | Campo, mensagens e referências do chat.                                                                       |
| `src/paginas/`            | Composição das rotas.                                                                                         |
| `src/estilos/`            | Tokens, reset, foco, formas, componentes e composição responsiva.                                             |

---

## 7. Rotas e telas

| Rota                               | Componente          | Função                                                                |
| ---------------------------------- | ------------------- | --------------------------------------------------------------------- |
| `/`                                | `Inicio.tsx`        | Percentual, indicadores, próximo Modulo, modo de consulta e reinício. |
| `/trilha`                          | `Trilha.tsx`        | Lista dos 11 Modulos na ordem canônica.                               |
| `/trilha/:idModulo`                | `Modulo.tsx`        | Índice do Modulo, resumo, origem, conclusão e lista de seções.        |
| `/trilha/:idModulo/secao/:idSecao` | `Secao.tsx`         | Conteúdo completo de uma única seção, com navegação anterior/próxima. |
| `/triagem`                         | `Triagem.tsx`       | Provider + natureza de migração e decisão de escopo.                  |
| `/busca`                           | `Busca.tsx`         | Busca normalizada com links diretos para seções.                      |
| `/glossario`                       | `Glossario.tsx`     | Glossário ordenado, filtrável por categoria.                          |
| `/referencias`                     | `Referencias.tsx`   | Referências textuais do Cog Solutions agrupadas por caminho.          |
| `/pendencias`                      | `Pendencias.tsx`    | Projeção derivada de todos os nós de conteúdo pendentes.              |
| `*`                                | `NaoEncontrada.tsx` | Tratamento de rota inválida.                                          |

### 7.1 Navegação lateral

Definida em `src/componentes/layout/BarraLateral.tsx`, agrupada em:

- **Jornada:** Início, Trilha;
- **Decisão:** Triagem de escopo;
- **Entrevista:** Banco de Perguntas, Pesquisa prévia;
- **Consulta:** Busca, Glossário, Referências, Pendências.

A rota ativa recebe `aria-current="page"` e fundo de estado selecionado. O rodapé da barra mostra o progresso da Trilha, não um perfil de usuário.

### 7.2 Layout raiz

`LayoutRaiz.tsx` deve preservar:

- atalho de teclado “Ir para o conteúdo principal”;
- barra lateral fixa à esquerda em telas largas;
- conteúdo à direita sobre fundo neutro;
- `main#conteudo-principal` com `tabIndex={-1}`;
- rodapé declarando as fronteiras da plataforma;
- chat flutuante no canto inferior direito;
- uma única instância do contexto de progresso.

Em viewport inferior a `64rem`, a barra lateral torna-se uma faixa no topo. O chat continua flutuante; ele não vira coluna fixa.

---

## 8. Modelo de conteúdo

O arquivo central é `src/dominio/conteudo/tipos.ts`.

### 8.1 Estado confirmado ou pendente

```ts
type Conteudo<T> =
  | {
      estado: 'confirmado';
      valor: T;
      origem: { tipo: 'confirmacao-gestor'; referencia: string } | { tipo: 'material-cog-solutions'; caminho: string };
    }
  | {
      estado: 'pendente';
      pendencia: {
        id: string;
        descricao: string;
        requisito: string;
      };
    };
```

Não existe terceiro estado. Os construtores estão em `src/conteudo/apoio.ts`:

- `confirmado(valor, referencia)`;
- `confirmadoDoCog(valor, caminho)`;
- `pendente(id, descricao, requisito)`;
- `origemGestor(referencia)`;
- `origemCogSolutions(caminho)`.

Quando um nó está pendente, a marcação substitui o valor. O rótulo do item permanece visível, mas o conteúdo especulativo não é exibido nem indexado como conteúdo confirmado.

### 8.2 Modulo e Trilha

- `IdModulo` é uma união fechada de 11 IDs;
- `PosicaoModulo` aceita apenas `1` a `11`;
- `Trilha` é uma tupla `readonly` com exatamente 11 posições;
- cada `Modulo` possui `id`, `posicao`, `titulo`, `resumo`, `requisitos`, `origem` e `secoes`;
- os IDs das seções são estáveis e formam as âncoras e links publicados.

### 8.3 Variantes de seção

A união discriminada `Secao` possui nove variantes:

| `tipo`             | Renderizador              | Uso                                            |
| ------------------ | ------------------------- | ---------------------------------------------- |
| `texto`            | `SecaoTexto.tsx`          | Parágrafos.                                    |
| `lista`            | `SecaoLista.tsx`          | Rótulo + descrição por item.                   |
| `passos`           | `SecaoPassos.tsx`         | Sequência ordenada e numerada.                 |
| `comparativa`      | `SecaoComparativa.tsx`    | Tabela de colunas e linhas.                    |
| `checklist`        | `SecaoChecklist.tsx`      | Itens persistidos no Registro de Progresso.    |
| `banco-perguntas`  | `SecaoBancoPerguntas.tsx` | Pilar, iniciativa e perguntas expansíveis.     |
| `referencias`      | `SecaoReferencias.tsx`    | Caminhos textuais do Cog Solutions.            |
| `formula`          | `SecaoFormula.tsx`        | Fórmulas apresentadas como texto, sem cálculo. |
| `modelo-de-prompt` | `SecaoModeloDePrompt.tsx` | Blocos literais copiáveis em `<pre>`.          |

O despacho exaustivo fica em `SecaoDoModulo.tsx`. Adicionar um novo `tipo` exige atualizar os tipos, o despacho, o conteúdo, os testes e o steering.

### 8.4 Banco de Perguntas

`BancoPerguntas` é um `Record` fechado:

```text
7 Pilares × 2 conjuntos autorados = 14 conjuntos
```

Pilares:

1. Aplicação (`aplicacao`);
2. GenAI (`genai`);
3. FinOps (`finops`);
4. Cloud (`cloud`);
5. Cloud Native (`cloud-native`);
6. Security (`security`);
7. Data & Analytics (`data-analytics`).

Conjuntos:

- `poc`;
- `mvp`, sempre entendido como perguntas adicionais do MVP.

Situações de exibição, compostas em `src/dominio/banco-perguntas/selecionar.ts`:

| Seleção        | Conjuntos exibidos       |
| -------------- | ------------------------ |
| `poc`          | PoC                      |
| `mvp-apos-poc` | Apenas adicionais de MVP |
| `mvp-direto`   | PoC + adicionais de MVP  |

A seleção que não foi escolhida não deve ser renderizada escondida por CSS.

---

## 9. Inventário da Trilha

A ordem de `src/conteudo/trilha.ts` é a ordem oficial e não pode ser alterada por conveniência visual.

| Pos. | ID                            | Título                                | Arquivo                             | Seções principais                                                                                                      |
| ---: | ----------------------------- | ------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
|    1 | `visao-da-area`               | Visão da área                         | `01-visao-da-area.ts`               | `escopo-de-atuacao`, `os-sete-pilares`, `papeis-do-processo`, `triagem-de-escopo`                                      |
|    2 | `acessos-iniciais`            | Acessos iniciais                      | `02-acessos-iniciais.ts`            | `origem-do-proposal-doc`, `checklist-de-acessos`                                                                       |
|    3 | `fila-technical-validation`   | Fila Technical Validation             | `03-fila-technical-validation.ts`   | `condicao-de-entrada`, `etapas-fora-da-area`, `prazo-de-permanencia`, `contagem-do-prazo`, `condicoes-de-saida`        |
|    4 | `entrevista-tecnica`          | Entrevista técnica                    | `04-entrevista-tecnica.ts`          | `sequencia-da-etapa`, `bant`, `roteiro-de-pesquisa-previa`, `conjuntos-por-situacao`, `banco-de-perguntas`             |
|    5 | `construcao-da-solucao`       | Construção da solução                 | `05-construcao-da-solucao.ts`       | Proposal Doc, Proposta Comercial, arquitetura, prompt literal, calculadora AWS, segurança, multi-account e referências |
|    6 | `precificacao-e-horas`        | Precificação e previsão de horas      | `06-precificacao-e-horas.ts`        | fórmulas, margem, valor hora, Fator de Produtividade de IA, perfis, acréscimos, prazo e referências                    |
|    7 | `apresentacao-e-formalizacao` | Apresentação, formalização e desfecho | `07-apresentacao-e-formalizacao.ts` | sequência, dois desfechos, remuneração/contrato e prazo de acompanhamento                                              |
|    8 | `registro-clickup`            | Registro no ClickUp                   | `08-registro-clickup.ts`            | lista, campos, anexo, desfechos de validação, kickoffs e ausência de desfecho                                          |
|    9 | `kickoffs`                    | Kickoffs                              | `09-kickoffs.ts`                    | quando agendar, comparativo interno/externo, conteúdo, ordem, indisponibilidade e referências                          |
|   10 | `handover-delivery`           | Handover para Delivery                | `10-handover-delivery.ts`           | fim da responsabilidade, acompanhamento opcional e delimitação do handover                                             |
|   11 | `semana-shadow`               | Semana Shadow                         | `11-semana-shadow.ts`               | posição na Trilha, primeira ação, ausência de roteiro único e roteiro por perfil                                       |

### 9.1 IDs completos dos Modulos extensos

#### Modulo 5 — Construção da solução

```text
proposal-doc-fonte-da-verdade
ordem-dos-documentos
estrutura-do-proposal-doc
relacao-com-a-proposta-comercial
terminologia-oficial
onde-cada-documento-e-gerado
geracao-da-imagem-da-arquitetura
prompt-da-imagem-da-arquitetura
boas-praticas-da-calculadora-aws
minimos-cloudwatch-na-calculadora
estimativa-de-tokens-de-ia-na-calculadora
servicos-de-seguranca-na-composicao
cenarios-de-multi-account
referencias-da-construcao
```

Os dois blocos internos do modelo de prompt são `prompt-base` e `esqueleto-ascii`.

#### Modulo 6 — Precificação e previsão de horas

```text
onde-o-calculo-acontece
formula-de-custo
formula-de-valor-de-venda
margem-de-contribuicao
formula-de-valor-hora
limites-de-esforco
fator-produtividade-ia
perfis-do-fator-produtividade
acrescimos-de-precificacao
perfis-de-recurso
prazo-e-artefatos
referencias-da-precificacao
```

A réplica deve manter as fórmulas como texto. Não adicionar campos de entrada, botão de cálculo, calculadora ou chamada para o agente de precificação.

---

## 10. Regras de domínio e comportamento

### 10.1 Registro de Progresso

Arquivos:

- `src/dominio/progresso/tipos.ts`;
- `src/dominio/progresso/esquema.ts`;
- `src/dominio/progresso/armazenamento.ts`;
- `src/dominio/progresso/calculo.ts`;
- `src/hooks/useProgresso.ts`;
- `src/componentes/layout/ContextoProgresso.tsx`.

Chave:

```text
onboarding-solutions:progresso:v1
```

Formato conceitual:

```json
{
  "versaoSchema": 1,
  "modulos": {
    "visao-da-area": {
      "concluido": true,
      "atualizadoEm": "2026-01-01T00:00:00.000Z"
    }
  },
  "checklists": {
    "acessos-iniciais": {
      "clickup": true
    }
  },
  "atualizadoEm": "2026-01-01T00:00:00.000Z"
}
```

Regras obrigatórias:

- leitura tolerante nunca lança;
- JSON inválido descarta o documento inteiro;
- versão desconhecida descarta o documento inteiro;
- ID de Modulo desconhecido descarta apenas a entrada;
- tipo inválido de item descarta apenas o item;
- Modulo ausente significa não concluído;
- toda gravação usa leitura-modificação-escrita do documento inteiro;
- falha de gravação devolve o estado anterior;
- o hook adota o progresso devolvido pela gravação;
- navegação não grava;
- armazenamento indisponível coloca a interface em somente leitura, com progresso exibido como vazio;
- reinício exige confirmação explícita;
- cancelamento do reinício não chama o armazenamento.

### 10.2 Cálculo de progresso

`resumirProgresso` calcula:

```text
percentual = round(Modulos concluídos / total de Modulos × 100)
```

O valor é limitado a `0..100`. `proximoModulo` é o primeiro Modulo não concluído na ordem canônica ou `null` quando todos estão concluídos.

### 10.3 Busca

Arquivos:

- `src/dominio/busca/normalizar.ts`;
- `src/dominio/busca/indice.ts`;
- `src/dominio/busca/buscar.ts`;
- `src/hooks/useBusca.ts`;
- `src/paginas/Busca.tsx`.

Regras:

- normalização NFD;
- remoção de diacríticos;
- comparação sem diferença de caixa;
- termo mínimo: 2 caracteres;
- termo máximo: 100 caracteres;
- no máximo 50 entradas, cada uma sendo par Modulo + seção;
- índice pré-computado e memoizado por referência de `Trilha`;
- varredura linear;
- conteúdo pendente não entra como conteúdo confirmado do índice;
- resultado aponta para `/trilha/:idModulo/secao/:idSecao`;
- termo curto preserva a lista anterior;
- busca sem resultado limpa a lista e informa o termo submetido;
- o termo digitado permanece no campo.

### 10.4 Triagem

Arquivos:

- `src/dominio/triagem/tipos.ts`;
- `src/dominio/triagem/decidir.ts`;
- `src/hooks/useTriagem.ts`;
- `src/paginas/Triagem.tsx`.

Tabela:

| Provider                   | Migração? | Resultado                                                      |
| -------------------------- | --------- | -------------------------------------------------------------- |
| AWS                        | qualquer  | Conduzida pelo Arquiteto; encaminha para `entrevista-tecnica`. |
| GCP                        | não       | Devolvida ao Account Manager para acionamento da CAVA.         |
| GCP                        | sim       | Pendência do Gestor; não inferir decisão.                      |
| Azure, on-premise ou outro | qualquer  | Pendência do Gestor.                                           |
| campo ausente              | qualquer  | Nomeia os campos ausentes e preserva o que já foi informado.   |

A triagem não persiste nada.

### 10.5 Pendências

`src/dominio/pendencias/coletar.ts` percorre a árvore de conteúdo e deriva a lista da página `/pendencias`. Não existe lista de pendências mantida manualmente.

Ao trocar um nó de `pendente` para `confirmado`, ele desaparece da projeção automaticamente. Cada item leva:

- ID estável;
- descrição;
- requisito de origem;
- Modulo;
- seção;
- caminho estrutural.

### 10.6 Glossário

Arquivos:

- `src/conteudo/glossario.ts`;
- `src/dominio/glossario/ordenar.ts`;
- `src/paginas/Glossario.tsx`.

A ordenação é alfabética estável sobre termo normalizado, sem diacríticos, sem duplicatas, com definição e origem obrigatórias. Categorias:

- Papéis do processo;
- Jornada e etapas;
- Filas e listas do ClickUp;
- Documentos e artefatos;
- Escopo e classificação;
- Ferramentas e ambientes;
- Esta plataforma.

### 10.7 Referências

Arquivos:

- `src/conteudo/referencias.ts`;
- `src/dominio/referencias/coletar.ts`;
- `src/paginas/Referencias.tsx`;
- `src/componentes/modulo/SecaoReferencias.tsx`.

Os caminhos do Cog Solutions são texto, não links e não são lidos pelo código. `verificarCorrespondencia` compara os dois sentidos:

1. toda citação confirmada na Trilha deve aparecer em `REFERENCIAS`;
2. toda entrada de `REFERENCIAS` deve possuir citação de origem;
3. o Modulo citante deve existir;
4. a espécie deve ser compatível;
5. duplicatas são reprovadas.

### 10.8 Dados sensíveis

`detectarDadosSensiveis` é usado na Trilha e na geração do corpus. O conteúdo não pode publicar:

- valor monetário junto a perfil de recurso;
- tabela ou faixa salarial;
- nome próprio junto a papel;
- CPF, e-mail, telefone, matrícula ou dado pessoal de colaborador.

A identificação do papel do processo é permitida.

---

## 11. Serviço de Chat e contratos entre repositórios

O back-end não está neste repositório. Ele vive no projeto separado `onboarding-solutions-back`. O front possui cópias versionadas dos contratos em:

- `src/servicos/contratoChat.ts`;
- `src/servicos/contratoCorpus.ts`.

### 11.1 Cliente HTTP

`src/servicos/clienteChat.ts` é o único módulo que lê `import.meta.env.VITE_URL_SERVICO_CHAT`.

Endpoints:

```text
POST /api/chat
GET  /api/saude
```

Limites:

```text
mensagem: até 1.000 caracteres
histórico enviado: últimas 10 mensagens
timeout do provedor: 20.000 ms
aborto do cliente: 25.000 ms
```

O cliente:

- recorta o histórico antes de enviar;
- valida e classifica respostas em runtime;
- usa `AbortController`;
- nunca expõe credencial ou mensagem bruta de provedor;
- traduz falhas para português brasileiro;
- retorna união discriminada `ok: true | false`;
- permite nova tentativa quando a falha é recuperável;
- não lança em falhas esperadas.

Payload de requisição:

```json
{
  "mensagem": "Pergunta do Arquiteto",
  "historico": [
    { "papel": "arquiteto", "texto": "Pergunta anterior" },
    { "papel": "assistente", "texto": "Resposta anterior" }
  ]
}
```

Resposta de sucesso:

```json
{
  "resposta": "Texto restrito ao corpus publicado.",
  "encontrouConteudo": true,
  "modulosOrigem": [
    {
      "idModulo": "entrevista-tecnica",
      "tituloModulo": "Entrevista técnica",
      "idSecao": "bant",
      "tituloSecao": "O BANT entregue pelo Account Manager"
    }
  ],
  "versaoConteudo": "hash-do-corpus"
}
```

Códigos de erro do contrato:

```text
MENSAGEM_VAZIA
MENSAGEM_MUITO_LONGA
CORPO_INVALIDO
ORIGEM_NAO_PERMITIDA
LIMITE_TAXA
CONTEUDO_INDISPONIVEL
PROVEDOR_INDISPONIVEL
TEMPO_LIMITE
RESPOSTA_INVALIDA
ERRO_INTERNO
```

`useChat.ts` mantém o histórico apenas em memória, permite no máximo uma requisição em voo, repõe a pergunta após falha e sugere até três Modulos relacionados pela busca local.

### 11.2 Corpus publicado

O pipeline usa:

- `scripts/gerarConteudoChat.ts`: montagem pura + escrita;
- `scripts/gerar-conteudo-chat.ts`: ponto de entrada;
- `src/servicos/contratoCorpus.ts`: schema;
- `src/servicos/validarCorpus.ts`: validador total;
- `scripts/orcamentoCorpus.ts`: estimativa;
- `scripts/verificar-orcamento-corpus.ts`: guarda de build.

Artefato:

```text
dist/conteudo-chat.json
```

Estrutura:

```json
{
  "versaoCorpus": 1,
  "versaoConteudo": "hash-de-16-caracteres",
  "geradoEm": "2026-01-01T00:00:00.000Z",
  "modulos": [
    {
      "id": "visao-da-area",
      "posicao": 1,
      "titulo": "Visão da área",
      "secoes": [
        {
          "id": "escopo-de-atuacao",
          "titulo": "Escopo de atuação da área",
          "texto": "Texto achatado da seção",
          "pendente": false
        }
      ]
    }
  ],
  "glossario": [
    {
      "termo": "Trilha",
      "definicao": "Sequência ordenada de Modulos."
    }
  ]
}
```

O corpus:

- inclui todas as seções e o Glossário;
- inclui a descrição da pendência, marcada com prefixo explícito, quando necessário;
- passa por detecção de dados sensíveis;
- passa por validação de schema;
- calcula `versaoConteudo` por hash do conteúdo, sem incluir `geradoEm`;
- deve caber no teto de `60.000` tokens estimados;
- usa estimativa conservadora de quatro caracteres por token.

---

## 12. Design System e estilos

### 12.1 Paleta

A fonte de verdade é `src/dominio/estilo/contraste.ts`. `tokens.ts` e `tokens.css` são espelhos conferidos por `testes/unidade/tokens-espelho.test.ts`.

| Família    | Valores principais                                               | Uso                                         |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------- |
| Marca      | `#ff0073`, `#000a80`, `#003fb4`, `#7c1475`, `#0c0c0c`, `#fbfbfb` | Acento, gradiente, ações e texto invertido. |
| Seleção    | `#e30068`                                                        | Item ativo da navegação com texto branco.   |
| Navy       | `#070b28`, `#0d1338`, `#1a2150`                                  | Barra lateral e superfícies escuras.        |
| Superfície | `#ffffff`, `#f7f8fa`, `#eef0f4`, `#e2e5ec`                       | Fundo, cartões e divisórias.                |
| Texto      | `#141a35`, `#2a3149`, `#5b6478`, `#98a0b3`                       | Título, corpo, apoio e invertido.           |
| Tintas     | `#ffe4ef`, `#f4e9f3`, `#e7eefb`                                  | Selos e molduras.                           |

Nenhuma cor fora de `PALETA_SISTEMA` deve entrar em fundo, texto, borda, ícone ou estado.

### 12.2 Tipografia

- títulos e subtítulos: `Montserrat`, `Inter`, `system-ui`;
- corpo: `Inter`, `Montserrat`, `system-ui`;
- dados técnicos, caminhos e rótulos: pilha monoespaçada;
- tamanhos em `rem`, nunca em pixel fixo;
- `Nagoda` e `Museo Slab` não entram sem arquivo/licença web confirmada.

### 12.3 Geometria

Raios autorizados:

```text
0px
6px
8px
12px
999px
```

O reset define `border-radius: 0` globalmente. Cada componente que precisa de canto arredondado declara um valor da escala. Grafismos de marca usam `clip-path` com raio zero:

- hexágono;
- triângulo;
- selo cortado;
- paralelogramo;
- seta.

Não utilizar círculo como elemento de identidade. O indicador de progresso é segmentado/barra, nunca anel circular.

### 12.4 Foco e acessibilidade visual

`base.css` define a única regra global de foco:

```css
:focus-visible {
  outline: 3px solid var(--nuage-pink);
  outline-offset: 2px;
}
```

Não remover nem reimplementar o foco nos componentes.

Elementos nativos obrigatórios:

- `<button>` para ações;
- `<a>`/`Link` para navegação;
- `<input>`, `<select>`, `<textarea>` para campos;
- `<details>/<summary>` para conteúdo expansível;
- `<table>` com `scope="col"` para comparativas.

Ícones acompanhados de texto recebem `aria-hidden`. Ícones, hexágonos, barras e blocos literais que transmitem informação recebem alternativa textual em português.

### 12.5 Arquivos de estilo

| Arquivo           | Responsabilidade                                                               |
| ----------------- | ------------------------------------------------------------------------------ |
| `tokens.css`      | Custom properties da paleta, tipografia, raios, foco, espaçamento e geometria. |
| `base.css`        | Reset, tipografia global, links, foco e `prefers-reduced-motion`.              |
| `formas.css`      | Polígonos de marca com `clip-path`.                                            |
| `componentes.css` | Barra lateral, cartões, indicadores, tabelas, controles, expansível e chat.    |
| `composicao.css`  | Ritmo de páginas, formulários, navegação, responsividade e agrupamentos.       |

---

## 13. Inventário de componentes

### 13.1 UI (`src/componentes/ui/`)

- `Barra.tsx`: barra de progresso acessível ou decorativa;
- `Botao.tsx`: botão primário/secundário;
- `CabecalhoSecao.tsx`: sobretítulo e título;
- `Cartao.tsx`: superfície semântica de conteúdo;
- `Expansivel.tsx`: `<details>` nativo;
- `Hexagono.tsx`: marcador poligonal;
- `Icone.tsx`: conjunto fechado de 14 ícones SVG;
- `Indicador.tsx`: indicador numérico e faixa de indicadores;
- `IndicadorProgresso.tsx`: 11 segmentos, um por Modulo;
- `LinkBotao.tsx`: link com aparência de botão;
- `MarcacaoPendencia.tsx`: substituto visual de conteúdo pendente;
- `Selo.tsx`: selo neutro, informativo, pendência ou confirmado;
- `SeloOrigem.tsx`: origem Gestor/Cog Solutions;
- `ValorConteudo.tsx`: único ponto de despacho confirmado/pendente;
- `index.ts`: barrel de exportações.

### 13.2 Layout (`src/componentes/layout/`)

- `LayoutRaiz.tsx`;
- `BarraLateral.tsx`;
- `ContextoProgresso.tsx`;
- `PainelChat.tsx`;
- `RestauracaoDeRolagem.tsx`;
- `Rodape.tsx`;
- `index.ts`.

### 13.3 Modulos (`src/componentes/modulo/`)

- `SecaoDoModulo.tsx`;
- `SecaoTexto.tsx`;
- `SecaoLista.tsx`;
- `SecaoPassos.tsx`;
- `SecaoComparativa.tsx`;
- `SecaoChecklist.tsx`;
- `SecaoBancoPerguntas.tsx`;
- `SecaoReferencias.tsx`;
- `SecaoFormula.tsx`;
- `SecaoModeloDePrompt.tsx`;
- `comuns.ts`;
- `index.ts`.

### 13.4 Chat (`src/componentes/chat/`)

- `EntradaMensagem.tsx`;
- `ListaMensagens.tsx`;
- `ReferenciaModulo.tsx`;
- `index.ts`.

---

## 14. Inventário completo de código TypeScript/TSX

### Raiz de `src/`

```text
src/App.tsx
src/main.tsx
src/rotas.tsx
```

### `src/conteudo/`

```text
src/conteudo/apoio.ts
src/conteudo/glossario.ts
src/conteudo/referencias.ts
src/conteudo/trilha.ts
src/conteudo/banco-perguntas/index.ts
src/conteudo/banco-perguntas/nucleo.ts
src/conteudo/banco-perguntas/aplicacao.ts
src/conteudo/banco-perguntas/cloud.ts
src/conteudo/banco-perguntas/cloud-native.ts
src/conteudo/banco-perguntas/data-analytics.ts
src/conteudo/banco-perguntas/finops.ts
src/conteudo/banco-perguntas/genai.ts
src/conteudo/banco-perguntas/security.ts
src/conteudo/modulos/01-visao-da-area.ts
src/conteudo/modulos/02-acessos-iniciais.ts
src/conteudo/modulos/03-fila-technical-validation.ts
src/conteudo/modulos/04-entrevista-tecnica.ts
src/conteudo/modulos/05-construcao-da-solucao.ts
src/conteudo/modulos/06-precificacao-e-horas.ts
src/conteudo/modulos/07-apresentacao-e-formalizacao.ts
src/conteudo/modulos/08-registro-clickup.ts
src/conteudo/modulos/09-kickoffs.ts
src/conteudo/modulos/10-handover-delivery.ts
src/conteudo/modulos/11-semana-shadow.ts
```

### `src/dominio/`

```text
src/dominio/banco-perguntas/selecionar.ts
src/dominio/busca/buscar.ts
src/dominio/busca/indice.ts
src/dominio/busca/normalizar.ts
src/dominio/conteudo/achatar.ts
src/dominio/conteudo/dadosSensiveis.ts
src/dominio/conteudo/rotas.ts
src/dominio/conteudo/tipos.ts
src/dominio/conteudo/validar.ts
src/dominio/estilo/contraste.ts
src/dominio/glossario/ordenar.ts
src/dominio/pendencias/coletar.ts
src/dominio/progresso/armazenamento.ts
src/dominio/progresso/calculo.ts
src/dominio/progresso/esquema.ts
src/dominio/progresso/tipos.ts
src/dominio/referencias/coletar.ts
src/dominio/triagem/decidir.ts
src/dominio/triagem/tipos.ts
```

### `src/servicos/`

```text
src/servicos/clienteChat.ts
src/servicos/contratoChat.ts
src/servicos/contratoCorpus.ts
src/servicos/validarCorpus.ts
```

### `src/hooks/`

```text
src/hooks/useBusca.ts
src/hooks/useChat.ts
src/hooks/useProgresso.ts
src/hooks/useTriagem.ts
```

### `src/paginas/`

```text
src/paginas/Busca.tsx
src/paginas/Glossario.tsx
src/paginas/Inicio.tsx
src/paginas/Modulo.tsx
src/paginas/NaoEncontrada.tsx
src/paginas/Pendencias.tsx
src/paginas/Referencias.tsx
src/paginas/Secao.tsx
src/paginas/Trilha.tsx
src/paginas/Triagem.tsx
```

### `scripts/`

```text
scripts/gerar-conteudo-chat.ts
scripts/gerarConteudoChat.ts
scripts/orcamentoCorpus.ts
scripts/pluginValidarAmbiente.ts
scripts/verificar-orcamento-corpus.ts
```

---

## 15. Testes e critérios de qualidade

### 15.1 Configuração

`testes/configurar.ts` instala `jest-dom`, limpa o DOM após cada teste e neutraliza `window.scrollTo` no jsdom.

`testes/acessibilidade/paginas.test.tsx` executa `axe` sobre:

- início;
- Trilha;
- Modulo;
- triagem;
- busca;
- glossário;
- referências;
- pendências;
- cada variante de seção;
- checklist em modo somente leitura.

### 15.2 Testes unitários

```text
testes/unidade/apoioPaginas.tsx
testes/unidade/bancoPerguntasSelecionar.test.ts
testes/unidade/busca.test.ts
testes/unidade/clienteChat.test.ts
testes/unidade/componentesChat.test.tsx
testes/unidade/componentesUi.test.tsx
testes/unidade/contratoEntreRepositorios.test.ts
testes/unidade/contraste.test.ts
testes/unidade/conteudoModulo06.test.ts
testes/unidade/conteudoTrilha.test.ts
testes/unidade/dadosSensiveis.test.ts
testes/unidade/estilos-brandbook.test.ts
testes/unidade/gerarConteudoChat.test.ts
testes/unidade/layoutRaiz.test.tsx
testes/unidade/orcamentoCorpus.test.ts
testes/unidade/paginaInicio.test.tsx
testes/unidade/paginaTriagem.test.tsx
testes/unidade/paginasConsulta.test.tsx
testes/unidade/paginasTrilhaModulo.test.tsx
testes/unidade/paginasTrilhaSecao.test.tsx
testes/unidade/pluginValidarAmbiente.test.ts
testes/unidade/progresso-calculo.test.ts
testes/unidade/progressoArmazenamento.test.ts
testes/unidade/progressoEsquema.test.ts
testes/unidade/referencias-coletar.test.ts
testes/unidade/secaoModeloDePrompt.test.tsx
testes/unidade/tokens-espelho.test.ts
testes/unidade/toolchain.test.tsx
testes/unidade/triagem-decidir.test.ts
testes/unidade/useBusca.test.ts
testes/unidade/useChat.test.ts
testes/unidade/useProgresso.test.ts
testes/unidade/useTriagem.test.ts
testes/unidade/verificacoesEstruturaisFront.test.ts
```

### 15.3 Testes de propriedade

As propriedades usam `fast-check`, no mínimo 100 execuções, uma propriedade por teste, com a etiqueta `Feature: onboarding-solutions-platform`.

Coberturas principais:

```text
P1/P2  cálculo do percentual e próximo Modulo
P3/P4/P5 round-trip, idempotência e vizinhança do armazenamento
P6     descarte seletivo de estado inválido
P7     falha de gravação preserva estado anterior
P8     reinício, cancelamento e remoção do progresso
P9     navegação não altera o Registro de Progresso
P10/P11 triagem total e escopo AWS
P12/P13 busca invariável a caixa/acentuação e sanidade de resultados
P14    Glossário ordenado e completo
P15    correspondência bidirecional de referências
P16    integridade da árvore de conteúdo
P17    pendência substitui o conteúdo
P18/P19 projeção e remoção derivada de pendências
P20    ausência de dados sensíveis
P21    completude de tabelas comparativas
P22    integridade de sequências de passos
P23    Banco de Perguntas isola Pilar e conjunto selecionado
P24    listas pareadas e particionadas
P25    fórmulas não executam cálculo
P26    ausência de exposição de Proposal Doc
P31    uma requisição de chat em voo
P34    conformidade visual do Brandbook
P36    alcance e foco por teclado
P37    alternativa textual conforme função
P38    ausência de endereço fixado/segredos e separação front-back
P39    completude do Steering
P40    fidelidade de blocos literais
```

Arquivos auxiliares de propriedades:

```text
testes/propriedades/geradores.ts
testes/propriedades/portalEmMemoria.ts
testes/propriedades/paginasGeradas.ts
testes/propriedades/apoioArmazenamento.ts
testes/propriedades/apoioAlternativaTextual.ts
testes/propriedades/apoioEstilo.ts
testes/propriedades/apoioFontes.ts
testes/propriedades/apoioPendencias.ts
testes/propriedades/apoioSteering.ts
testes/propriedades/apoioTeclado.ts
```

### 15.4 Testes de conteúdo

`testes/unidade/conteudoTrilha.test.ts` confirma:

- 11 Modulos na ordem;
- IDs únicos;
- árvore válida;
- pendências esperadas;
- ausência de matriz RACI estática;
- Banco de Perguntas com 14 conjuntos;
- ausência de dados sensíveis;
- correspondência das referências;
- Glossário sem duplicatas e com definições.

---

## 16. Passo a passo para replicar

1. Criar um projeto Vite React TypeScript com as versões e scripts de `package.json`.
2. Criar `index.html`, `src/main.tsx`, `src/App.tsx` e `src/rotas.tsx`.
3. Configurar TypeScript estrito, Vitest/jsdom e setup de testes.
4. Criar os tokens em `src/dominio/estilo/contraste.ts`, `src/estilos/tokens.ts` e `src/estilos/tokens.css`.
5. Criar `base.css`, `formas.css`, `componentes.css` e `composicao.css`.
6. Implementar os tipos de conteúdo e o genérico `Conteudo<T>`.
7. Implementar validação de árvore, achatamento, pendências, dados sensíveis, contraste, busca, Glossário e referências.
8. Implementar o Registro de Progresso com parser tolerante e commit-then-render.
9. Implementar `decidirTriagem` e seu hook.
10. Implementar o cliente do chat e seus contratos sem adicionar código de back-end ao front.
11. Implementar hooks de progresso, busca e chat.
12. Implementar primitivos UI acessíveis.
13. Implementar renderizadores das nove variantes de seção.
14. Implementar LayoutRaiz, barra lateral, contexto de progresso, rodapé, restauração de rolagem e PainelChat.
15. Implementar as páginas e registrar as rotas.
16. Redigir a Trilha na ordem dos 11 arquivos, mantendo IDs estáveis e origem em cada bloco.
17. Redigir Glossário, Banco de Perguntas e referências.
18. Implementar geração, validação e orçamento do corpus.
19. Executar `npm run typecheck`.
20. Executar `npm run test:run`.
21. Executar `npm run build`.
22. Conferir `dist/index.html`, assets e `dist/conteudo-chat.json`.
23. Procurar padrões de credenciais em `dist/`.
24. Validar o comportamento em viewport larga, viewport estreita, teclado, leitor de tela e modo de armazenamento indisponível.

---

## 17. Checklist de aceite da réplica

### Estrutura e execução

- [ ] `npm install` funciona.
- [ ] `npm run dev` inicia na porta 5173.
- [ ] O build falha sem `VITE_URL_SERVICO_CHAT`.
- [ ] O build falha com URL inválida.
- [ ] O build executa a guarda de orçamento antes do Vite.
- [ ] O corpus é gerado depois do Vite.
- [ ] O build publica `dist/conteudo-chat.json`.

### Conteúdo

- [ ] Existem exatamente 11 Modulos.
- [ ] IDs e posições estão na ordem canônica.
- [ ] Existem sete Pilares.
- [ ] Existem cinco papéis do processo.
- [ ] O Banco de Perguntas possui 14 conjuntos.
- [ ] Cada bloco possui origem ou pendência.
- [ ] Pendência substitui valor, sem texto especulativo.
- [ ] Referências têm correspondência nos dois sentidos.
- [ ] Não há dados pessoais, tabela salarial ou valores de perfis de recurso.

### Interface

- [ ] Barra lateral escura fixa em telas largas.
- [ ] Conteúdo em superfície clara sobre fundo neutro.
- [ ] Sobretítulo com traço pink.
- [ ] Indicadores com número grande e rótulo auxiliar.
- [ ] Hexágono/polígonos no lugar de elementos circulares de identidade.
- [ ] Foco global de 3px visível.
- [ ] Tamanhos em `rem`.
- [ ] Chat flutuante disponível em qualquer rota.
- [ ] Layout responsivo abaixo de `64rem`.

### Comportamento

- [ ] Acesso direto a qualquer Modulo não grava progresso.
- [ ] Checklist grava individualmente.
- [ ] Falha de gravação preserva estado anterior.
- [ ] Armazenamento indisponível deixa a interface em somente leitura.
- [ ] Reinício exige confirmação.
- [ ] Busca ignora caixa e acentuação.
- [ ] Termo curto mantém resultados anteriores.
- [ ] Triagem cobre AWS, GCP e providers sem regra.
- [ ] Fórmulas não calculam.
- [ ] Blocos literais podem ser copiados ou copiados manualmente.
- [ ] Chat preserva histórico somente durante a sessão.
- [ ] Chat permite no máximo uma requisição em voo.

### Validação

- [ ] `npm run typecheck` passa.
- [ ] `npm run test:run` passa.
- [ ] auditoria `axe` passa nas páginas e variantes.
- [ ] `npm run build` passa.
- [ ] `dist/` não contém padrões de credencial.

---

## 18. Implementação estática paralela em `Onboarding/`

A pasta `Onboarding/` contém outro site, independente da SPA React. Ela não é importada por `src/`, não participa do build Vite e não usa o modelo de conteúdo, o Registro de Progresso ou as rotas React.

### Arquivos

```text
Onboarding/index.html
Onboarding/primeiros-passos.html
Onboarding/plataformas.html
Onboarding/playbook.html
Onboarding/styles.css
```

### Estrutura visual

- marca `NuageHub`;
- cabeçalho sticky horizontal;
- quatro links: Página Inicial, Primeiros passos, Plataformas e Playbook;
- badge `Novo SDR`;
- fundo escuro com glow radial;
- fonte Inter via Google Fonts;
- ícones Lucide carregados por CDN;
- rodapé `© 2026 NuageIT`;
- layout editorial com largura máxima de aproximadamente `820px` nas páginas internas.

### `Onboarding/index.html`

Página inicial estática com:

- hero de boas-vindas;
- título “Sua jornada de sucesso começa aqui e agora”;
- botões para Primeiros Passos e Playbook;
- três cards: Primeiros Passos, Plataformas e Playbook;
- checklist visual com três cards clicáveis;
- função JavaScript `toggleCheck(card)` que alterna a classe `done`;
- navegação complementar por `switchTab`, embora as páginas também possuam links HTML separados.

### `Onboarding/primeiros-passos.html`

Página editorial contendo:

- apresentação da NuageIT;
- competências AWS;
- papel do SDR;
- acessos a ClickUp, Plataforma Nuage, Zoho e e-mail;
- obrigações iniciais;
- links importantes;
- instruções de pagamento PJ.

### `Onboarding/plataformas.html`

Página editorial com instruções sobre:

- Plataforma NuageIT;
- ClickUp;
- Zoho CRM;
- e-mail corporativo e canais;
- passos numerados e links externos.

### `Onboarding/playbook.html`

Página editorial com:

- missão e ICP do SDR;
- cadência outbound de 10 dias;
- scripts e pitch de cold call;
- quebra de objeções;
- qualificação e passagem para Account Manager.

### `Onboarding/styles.css`

Define:

- variáveis próprias diferentes dos tokens da aplicação React;
- fundo `#020617`;
- cards translúcidos;
- roxo/índigo como ação principal;
- glow radial;
- navegação horizontal;
- cards responsivos em três colunas;
- checklist visual;
- páginas editoriais e rodapé.

### Decisão para a réplica

Escolher uma destas abordagens antes da implementação:

1. **Replicar a SPA React:** usar `src/` como fonte canônica. Esta opção preserva requisitos, testes, conteúdo, progresso, busca, triagem e chat.
2. **Replicar o protótipo estático:** usar `Onboarding/` apenas como referência visual/conteúdo do portal NuageHub. Esta opção não entrega os comportamentos da Plataforma de Onboarding descritos nos requisitos.
3. **Unificar os dois:** somente mediante decisão de produto. Não copiar classes, paleta, nomes de usuário, fluxo SDR ou CDN Lucide para a SPA sem atualizar requisitos, conteúdo, tokens e testes.

Para reproduzir a Plataforma de Onboarding descrita no README, requisitos e steering, a opção correta é a primeira.

---

## 19. Arquivos de apoio e artefatos

- `README.md`: documentação resumida de produto, comandos, publicação e limites.
- `prompt.md`: prompt histórico de construção do steering; não é runtime.
- `.agents/tasks/analise-tecnologias-projeto.md`: análise auxiliar de tecnologias.
- `.agents/tasks/diagnostico-erro-jsx-inicio.md`: diagnóstico auxiliar de erro.
- `vitest-baseline.json`: baseline local de testes.
- `.kiro/specs/.../tasks.meta.json`: metadados do plano.
- `public/fontes/.gitkeep`: reserva para fontes licenciadas futuras.
- arquivos `.gitkeep`: preservam diretórios vazios no controle de versão.

---

## 20. Resultado da inspeção

A réplica fiel exige mais do que reproduzir a aparência. Os pontos que não podem ser omitidos são:

1. a Trilha tipada com 11 Modulos e IDs estáveis;
2. a união `confirmado | pendente` e a origem de todo conteúdo;
3. a separação de domínio puro, hooks, componentes e páginas;
4. a persistência local tolerante e com commit-then-render;
5. a página de pendências derivada da árvore;
6. a busca por seção com normalização de caixa/acentuação;
7. a triagem total e sem inferência quando não há regra;
8. o Banco de Perguntas com 7 × 2 conjuntos e três seleções de exibição;
9. o chat com contrato versionado e corpus estático;
10. a paleta/tipografia/geometria do Design System NuageIT;
11. a acessibilidade nativa e a auditoria automatizada;
12. o pipeline de typecheck, orçamento, build, corpus e varredura de credenciais.

Este arquivo deve acompanhar o código-fonte como guia de reconstrução. O código executável continua sendo a referência final para detalhes de implementação que não estejam explicitados aqui.
