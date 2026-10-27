# Análise de linguagens, identidade visual e tecnologias

## Resumo executivo

O projeto é uma aplicação **front-end estática** de onboarding da NuageIT, implementada principalmente em **TypeScript/TSX com React 19**, empacotada pelo **Vite 8** e roteada por **React Router 7**. A aplicação monta a interface em `src/main.tsx`, usa `BrowserRouter` em `src/App.tsx` e compõe as rotas em `src/rotas.tsx`.

A identidade visual é o **Design System NuageIT**, com paleta hexadecimal centralizada em `src/dominio/estilo/contraste.ts` e espelhada em `src/estilos/tokens.ts` e `src/estilos/tokens.css`. Os estilos usam CSS global, custom properties, gradientes, `clip-path` para grafismos poligonais e estilos inline derivados dos tokens em alguns componentes. Não foram encontrados valores `rgb()` ou `hsl()` declarados como cores da interface; os valores encontrados são hexadecimais, inclusive os valores hexadecimais com alfa usados nas sombras.

A tipografia declarada usa **Montserrat** para títulos/subtítulos, **Inter** para corpo e uma pilha monoespaçada para identificadores, caminhos e rótulos técnicos. As fontes são carregadas por Google Fonts em `index.html`; não foram encontrados arquivos locais `.ttf`, `.otf`, `.woff` ou `.woff2`. Há fallback para fontes do sistema.

A validação inclui TypeScript estrito, Vitest em ambiente jsdom, Testing Library, `user-event`, `axe-core`/`vitest-axe` para acessibilidade e `fast-check` para testes de propriedades. O build valida `VITE_URL_SERVICO_CHAT`, verifica o orçamento do corpus, executa o build Vite e gera `dist/conteudo-chat.json`.

## Metodologia e escopo

- Foram lidos os documentos principais e configurações: `README.md`, `package.json`, `package-lock.json`, `index.html`, `.env.example`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts` e os arquivos de orientação em `.kiro/steering/`.
- Foram inspecionados os pontos de entrada, roteamento, cliente de chat, scripts de build, tokens visuais e o módulo de contraste.
- Foram feitas buscas por extensões de código, estilos, imagens e arquivos de fonte, além de buscas por famílias tipográficas, literais de cor e tecnologias.
- O relatório cobre os arquivos relevantes acessíveis no diretório, sem reproduzir o conteúdo integral dos módulos de dados e dos testes.
- `C:\onboarding-solutions-master\.prompt.md` não foi encontrado; existe `prompt.md` na raiz, mas sua leitura não foi necessária para identificar a stack da aplicação.
- Não há diretório `.git` reconhecido em `C:\onboarding-solutions-master`; portanto, não foi possível usar `git status` para uma comparação histórica. Durante esta análise, somente este relatório foi criado; nenhum arquivo de código, configuração ou documentação existente foi editado.

## 1. Linguagens e formatos utilizados

| Linguagem/formato    | Evidência e uso                                                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript           | Código de domínio, serviços, scripts e configurações: `src/**/*.ts`, `scripts/**/*.ts`, `vite.config.ts`, `vitest.config.ts`. O compilador está em `strict: true` e usa `noUncheckedIndexedAccess` em `tsconfig.json`. |
| TSX                  | Componentes e entrada React: `src/**/*.tsx`, com `src/main.tsx`, `src/App.tsx`, `src/rotas.tsx` e páginas/componentes. O JSX usa `react-jsx`.                                                                          |
| CSS                  | Estilos globais em `src/estilos/base.css`, `tokens.css`, `componentes.css` e `formas.css`.                                                                                                                             |
| HTML                 | Documento de entrada em `index.html`, idioma `pt-BR`, metadados de viewport, carregamento de fontes e ponto de montagem `#raiz`.                                                                                       |
| JSON                 | Manifesto e lockfile (`package.json`, `package-lock.json`), além de dados/configurações JSON produzidos ou consumidos pelo projeto.                                                                                    |
| Markdown             | Documentação em `README.md`, `prompt.md` e `.kiro/steering/*.md`; este relatório também é Markdown.                                                                                                                    |
| Expressões regulares | Usadas em `src/dominio/estilo/contraste.ts` para validar formatos hexadecimais e em outros módulos de validação. Não constituem uma linguagem de aplicação separada.                                                   |

Não foi identificada outra linguagem de backend neste diretório. O README informa que o Serviço de Chat vive em um repositório separado (`onboarding-solutions-back`).

## 2. Paleta de cores

### 2.1 Fonte de verdade e espelhamento

A fonte declarada pelo projeto é `src/dominio/estilo/contraste.ts`, em `PALETA_BRANDBOOK` e `PALETA_SISTEMA`. O mesmo conjunto é exposto para uso computável em `src/estilos/tokens.ts` (`COR` e `PAPEL_COR`) e para CSS em `src/estilos/tokens.css` (`:root` e custom properties). Os comentários do código informam que `testes/unidade/tokens-espelho.test.ts` verifica a correspondência entre os tokens.

### 2.2 Cores hexadecimais encontradas

| Token/variável                       | Valor     | Papel/local de definição                                                                           |
| ------------------------------------ | --------- | -------------------------------------------------------------------------------------------------- |
| `pink` / `--nuage-pink`              | `#ff0073` | Acento de marca, sobretítulo, foco e detalhes; `contraste.ts`, `tokens.ts`, `tokens.css`.          |
| `azulProfundo` / `--nuage-deep-blue` | `#000a80` | Início do gradiente principal; marca e ações visuais.                                              |
| `azul` / `--nuage-blue`              | `#003fb4` | Ação secundária, links e borda ativa.                                                              |
| `roxo` / `--nuage-purple`            | `#7c1475` | Ação primária, pendência e fim do gradiente principal.                                             |
| `preto` / `--nuage-black`            | `#0c0c0c` | Cor de marca para o par sobre off-white.                                                           |
| `offWhite` / `--nuage-white`         | `#fbfbfb` | Cor clara de marca/texto invertido.                                                                |
| `pinkProfundo` / `--nuage-pink-deep` | `#e30068` | Fundo sólido do estado selecionado; escolhido para texto branco em contraste aproximado de 4,70:1. |
| `navy900` / `--nuage-navy-900`       | `#070b28` | Fundo da barra lateral.                                                                            |
| `navy800` / `--nuage-navy-800`       | `#0d1338` | Superfície elevada da barra lateral, cartão do usuário e hover.                                    |
| `navy700` / `--nuage-navy-700`       | `#1a2150` | Borda/divisória da navegação.                                                                      |
| `branco` / `--nuage-surface`         | `#ffffff` | Superfície de cartões e conteúdo.                                                                  |
| `neutro50` / `--nuage-neutral-50`    | `#f7f8fa` | Fundo da aplicação e superfícies sutis.                                                            |
| `neutro100` / `--nuage-neutral-100`  | `#eef0f4` | Divisórias suaves.                                                                                 |
| `neutro200` / `--nuage-neutral-200`  | `#e2e5ec` | Bordas de cartões e campos.                                                                        |
| `tinta900` / `--nuage-ink-900`       | `#141a35` | Títulos.                                                                                           |
| `tinta700` / `--nuage-ink-700`       | `#2a3149` | Texto principal/corpo.                                                                             |
| `neutro600` / `--nuage-neutral-600`  | `#5b6478` | Texto secundário e rótulos de apoio.                                                               |
| `neutro400` / `--nuage-neutral-400`  | `#98a0b3` | Texto de apoio sobre superfícies escuras.                                                          |
| `pinkSuave` / `--nuage-pink-soft`    | `#ffe4ef` | Tinta de badge e moldura de ícone.                                                                 |
| `roxoSuave` / `--nuage-purple-soft`  | `#f4e9f3` | Tinta roxa suave de badge/moldura.                                                                 |
| `azulSuave` / `--nuage-blue-soft`    | `#e7eefb` | Tinta azul suave de badge/moldura.                                                                 |

Além dessas cores de primeiro plano e fundo, `tokens.css` usa os valores com alfa `#070b2814` e `#070b2824` nas sombras `--nuage-sombra-sutil` e `--nuage-sombra-flutuante`. Eles representam sombras com transparência derivada do navy-900, não uma cor independente da paleta.

### 2.3 Gradientes e papéis semânticos

- `--nuage-gradient-main`: gradiente `135deg` de `#000a80` para `#7c1475`, também exposto como `GRADIENTE_PRINCIPAL` em `tokens.ts`.
- `--nuage-gradient-nav`: gradiente vertical de `#070b28` para `#0d1338`, usado na barra lateral.
- `--nuage-gradient-selected`: não é gradiente efetivo; resolve para `#e30068` para preservar contraste do item selecionado.
- Os papéis semânticos (`--nuage-fundo`, `--nuage-titulo`, `--nuage-texto`, `--nuage-acao-primaria`, `--nuage-acao-secundaria` etc.) evitam que os componentes escolham cores diretamente.

### 2.4 Contraste e acessibilidade visual

`src/dominio/estilo/contraste.ts` implementa luminância relativa e razão de contraste segundo WCAG 2.1, além do catálogo `PARES_DE_COR_PERMITIDOS`. O código registra, entre outros valores, aproximadamente: tinta900/branco `17,1:1`, tinta700/branco `12,9:1`, neutro600/branco `5,9:1`, azul/branco `8,9:1`, roxo/branco `9,5:1`, pink/branco `3,8:1`, branco/pinkProfundo `4,7:1` e branco/navy900 `19,3:1`.

O catálogo exige `4,5:1` para corpo de texto e `3:1` para texto grande, bordas de controle, ícones informativos e indicador de foco. `base.css` declara o foco global com contorno de `3px` em `--nuage-pink` e `outline-offset` de `2px`.

### 2.5 Cores não identificadas

Não foram encontrados valores de cor `rgb()` ou `hsl()` usados para a interface. A busca encontrou apenas os hexadecimais acima, além de exemplos de conversão em testes (`testes/propriedades/apoioEstilo.ts`) e casos de teste. Não foram identificadas imagens raster ou SVG que pudessem introduzir uma paleta visual externa.

## 3. Fontes e tipografia

### 3.1 Famílias declaradas

| Uso                  | Pilha declarada                                                                       | Evidência                                                                              |
| -------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Títulos              | `"Montserrat", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif`             | `src/estilos/tokens.css`, `src/estilos/tokens.ts`; aplicada a `h1`–`h3` em `base.css`. |
| Subtítulos e rótulos | `"Montserrat", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif`             | Tokens `fonte-subtitulo`/`FONTE.subtitulo`; usada em navegação, tabelas e botões.      |
| Corpo                | `"Inter", "Montserrat", system-ui, -apple-system, "Segoe UI", sans-serif`             | Tokens `fonte-corpo`/`FONTE.corpo`; aplicada ao `body` e elementos textuais.           |
| Monoespaçada         | `ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Menlo, Consolas, monospace` | `tokens.css` e `tokens.ts`; usada para identificadores, caminhos e rótulos técnicos.   |

`index.html` carrega Montserrat nos pesos 500/600/700 e Inter nos pesos 400/500/600/700 a partir de `https://fonts.googleapis.com`, com `preconnect` para os domínios do Google Fonts. O fallback permite operar com a fonte do sistema sem arquivo local.

### 3.2 Escala, pesos e comportamento

- Pesos declarados: corpo `400`, médio `500`, subtítulo `600`, título `700`.
- Escala relativa em `rem`: título 1 `2.25rem`, título 2 `1.5rem`, título 3 `1.125rem`, subtítulo `1rem`, corpo `0.9375rem`, apoio `0.8125rem`, micro `0.6875rem` e número `2rem`.
- `base.css` usa `line-height` de `1.2` para títulos e `1.6` para corpo.
- Não há `font-size` base fixado em pixels; o projeto declara suporte à ampliação de texto até 200%.
- Os comentários de `tokens.ts` e do steering registram que `Nagoda` e `Museo Slab` foram considerados, mas não entram na aplicação por não haver arquivo web licenciado confirmado.

### 3.3 Arquivos de fonte

Não foram encontrados arquivos `.ttf`, `.otf`, `.woff`, `.woff2` ou equivalentes dentro do projeto. Logo, as fontes efetivas Montserrat/Inter dependem do carregamento remoto do Google Fonts ou dos fallbacks do sistema.

## 4. Tecnologias, frameworks e bibliotecas

### 4.1 Runtime e aplicação

- **React 19.2.8** e **React DOM 19.2.8**: renderização em `src/main.tsx` com `StrictMode` e `createRoot`.
- **TypeScript 5.9.3**: linguagem e verificação estrita do código.
- **React Router DOM 7.18.3**: `BrowserRouter`, `Routes` e `Route` em `src/App.tsx` e `src/rotas.tsx`.
- **Fetch API**: transporte HTTP do `src/servicos/clienteChat.ts` para `POST /api/chat` e `GET /api/saude`, com `AbortController` e timeout do cliente.
- **Web Storage/localStorage**: o README e o steering descrevem o Registro de Progresso como armazenamento local do navegador; a lógica de progresso fica no domínio/hooks.
- **CSS nativo**: custom properties, media queries, pseudo-classes de foco/hover, `clip-path`, gradientes e estilos inline derivados dos tokens. Não há biblioteca de estilos, ícones ou estado global.

### 4.2 Build e desenvolvimento

- **Vite 8.2.2** com `@vitejs/plugin-react` 6.1.1, configuração em `vite.config.ts`, saída em `dist` e sourcemaps habilitados.
- **vite-node** para executar scripts TypeScript sem etapa de compilação separada.
- Plugin próprio `scripts/pluginValidarAmbiente.ts`: interrompe o build se `VITE_URL_SERVICO_CHAT` estiver ausente, vazia ou não for uma URL absoluta HTTP/HTTPS.
- `scripts/verificar-orcamento-corpus.ts`: verifica o orçamento estimado de tokens do corpus antes do Vite.
- `scripts/gerar-conteudo-chat.ts`: gera `dist/conteudo-chat.json` depois do build.
- Publicação descrita no README: artefato estático na **Vercel**.

### 4.3 Testes e qualidade

- **Vitest 5.0.0**, configurado em `vitest.config.ts`, com ambiente `jsdom`, `setupFiles` em `testes/configurar.ts`, CSS habilitado e inclusão de testes em `testes/**/*.test.{ts,tsx}` e `src/**/*.test.{ts,tsx}`.
- **Testing Library**: `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.1, `@testing-library/jest-dom` 7.0.1 e `@testing-library/user-event` 14.6.7.
- **fast-check 4.9.0** para testes de propriedades.
- **axe-core 4.13.0** e **vitest-axe 0.1.0** para auditoria automatizada de acessibilidade.
- `testes/configurar.ts` limpa o DOM entre testes e substitui `window.scrollTo` para compatibilidade com jsdom.

### 4.4 Configuração de ambiente

- `.env.example` define `VITE_URL_SERVICO_CHAT=http://localhost:3333`.
- `src/servicos/clienteChat.ts` é documentado como o único módulo do front que lê `import.meta.env.VITE_URL_SERVICO_CHAT`.
- O build não fixa o endereço do serviço em código; o plugin de Vite valida a variável e impede a geração de artefato em caso inválido.

## 5. Arquitetura e padrões identificados

- Fluxo de dependência documentado: `conteudo → dominio → servicos → hooks → componentes → paginas`.
- `src/conteudo/` contém dados tipados da Trilha, glossário e referências.
- `src/dominio/` contém funções puras de progresso, triagem, busca, pendências, validação, estilo e contratos de conteúdo.
- `src/servicos/` concentra o cliente HTTP do chat e contratos entre repositórios.
- `src/hooks/` faz a ponte entre domínio e React.
- `src/componentes/` contém layout, UI, módulo e chat.
- `src/paginas/` compõe a aplicação por rota.
- `src/estilos/` contém tokens, reset, enquadramento e formas.
- A interface usa barra lateral fixa em telas largas, faixa superior abaixo de `63.999rem`, conteúdo em cartões e painel de chat flutuante no canto inferior direito (`src/estilos/componentes.css`).
- `src/estilos/formas.css` usa polígonos `clip-path` (hexágono, triângulo, selo, paralelogramo e seta), sem formas circulares de marca.
- O código publicado evita `any`, usa `unknown` com validação explícita e representa resultados com uniões discriminadas, conforme `.kiro/steering/padroes-de-codigo.md`.

## 6. Scripts e comandos do projeto

| Comando                      | Resultado                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                | Inicia servidor Vite de desenvolvimento.                                                                               |
| `npm run build`              | Executa `tsc --noEmit`, orçamento do corpus, `vite build` e geração do corpus de chat. Requer `VITE_URL_SERVICO_CHAT`. |
| `npm run preview`            | Serve o artefato gerado pelo Vite.                                                                                     |
| `npm test`                   | Vitest interativo.                                                                                                     |
| `npm run test:run`           | Suíte Vitest uma vez.                                                                                                  |
| `npm run typecheck`          | `tsc --noEmit`.                                                                                                        |
| `npm run conteudo:orcamento` | Executa apenas a verificação do orçamento do corpus.                                                                   |
| `npm run conteudo:chat`      | Gera `dist/conteudo-chat.json` sem reconstruir o front.                                                                |

## 7. Itens não identificados e recomendações

### Não identificados

1. Não foram encontrados arquivos locais de fonte; a aplicação depende de Google Fonts e fallbacks do sistema.
2. Não foram encontrados arquivos `.svg`, `.png` ou outros assets de imagem relevantes na busca realizada.
3. Não foi encontrado ESLint, Prettier ou outra configuração explícita de lint/formatter (`.eslintrc`, `eslint.config.*`, `.prettierrc` etc.). A qualidade é sustentada principalmente por TypeScript estrito, testes e regras documentadas.
4. Não foi identificado backend neste diretório; o Serviço de Chat é externo e fica em repositório separado.
5. Não foi possível verificar histórico de alterações via Git porque a pasta não é reconhecida como um repositório Git (`git -C C:\onboarding-solutions-master status --short` retornou que não há repositório).

### Recomendações

- Se a aplicação precisar funcionar sem rede com tipografia visualmente determinística, avaliar a inclusão de arquivos de fonte licenciados em `public/fontes/`; isso deve ser decidido com verificação de licença e impacto de distribuição.
- Se a equipe necessitar de uma política automática de formatação/lint, adicionar ferramentas e scripts somente após definir a convenção do projeto; atualmente não há configuração identificável.
- Manter `src/dominio/estilo/contraste.ts`, `src/estilos/tokens.ts` e `src/estilos/tokens.css` sincronizados, pois o próprio projeto os trata como fonte, espelho tipado e declaração CSS.
- Manter `.env.example` atualizado sempre que o contrato de ambiente mudar, pois o build depende da variável `VITE_URL_SERVICO_CHAT`.

## 8. Referências de arquivos

- `README.md`
- `package.json`
- `package-lock.json`
- `index.html`
- `.env.example`
- `tsconfig.json`
- `vite.config.ts`
- `vitest.config.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/rotas.tsx`
- `src/servicos/clienteChat.ts`
- `src/dominio/estilo/contraste.ts`
- `src/estilos/tokens.ts`
- `src/estilos/tokens.css`
- `src/estilos/base.css`
- `src/estilos/componentes.css`
- `src/estilos/formas.css`
- `scripts/pluginValidarAmbiente.ts`
- `scripts/verificar-orcamento-corpus.ts`
- `scripts/gerar-conteudo-chat.ts`
- `.kiro/steering/stack-tecnica.md`
- `.kiro/steering/aplicacao-do-brandbook.md`
- `.kiro/steering/padroes-de-codigo.md`
- `.kiro/steering/produto.md`
- `.kiro/steering/construcao-de-novas-funcionalidades.md`
- `.kiro/steering/padrao-de-conteudo-dos-modulos.md`
