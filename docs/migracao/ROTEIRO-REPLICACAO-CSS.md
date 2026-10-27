# Roteiro de replicação do CSS da página

> **Fonte analisada:** aplicação React em `src/` do repositório `onboarding-solutions`.
>
> **Objetivo:** reproduzir a aparência e o comportamento visual da Plataforma de Onboarding da NuageIT sem inventar tokens, cores, raios, formas ou padrões de interação.
>
> **Implementação visual canônica:** `src/estilos/` + tokens computáveis em `src/estilos/tokens.ts` + estilos inline derivados desses tokens nos componentes React.
>
> **Protótipo paralelo:** `Onboarding/styles.css` é documentado no apêndice e não deve ser misturado à SPA React sem uma decisão de produto.

---

## 1. Decisão de escopo

Existem duas implementações visuais no repositório:

| Implementação      | Arquivos                                                      | Característica                                                                                      | Uso neste roteiro      |
| ------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------- |
| SPA React canônica | `src/estilos/*.css`, `src/estilos/tokens.ts` e `src/**/*.tsx` | Barra lateral escura, conteúdo claro, Design System NuageIT, chat flutuante, foco e acessibilidade. | **Replicar primeiro.** |
| Protótipo estático | `Onboarding/*.html` e `Onboarding/styles.css`                 | Portal escuro `NuageHub`, navegação horizontal, cards SDR e Lucide via CDN.                         | Apêndice separado.     |

A réplica descrita pelo README, pelos requisitos e pelo steering é a SPA React. O CSS do protótipo estático possui outra paleta, outros nomes, outro conteúdo e outra arquitetura de navegação.

### 1.1 Regra de precedência

1. `src/dominio/estilo/contraste.ts` é a fonte de verdade dos valores de cor.
2. `src/estilos/tokens.css` expõe os valores como custom properties.
3. `src/estilos/tokens.ts` espelha os mesmos valores para os estilos computáveis dos componentes.
4. `testes/unidade/tokens-espelho.test.ts` confere CSS e TypeScript.
5. O Brandbook define identidade: cores de marca, tipografia e grafismos.
6. O Design System NuageIT define aplicação: superfícies, barra lateral, densidade, escala de raios e enquadramento.
7. Estilos inline dos componentes não devem usar valores arbitrários: devem derivar de `tokens.ts`.

---

## 2. Arquivos que formam o CSS efetivo

### 2.1 CSS canônico

| Ordem | Arquivo                       | Responsabilidade                                                                    |
| ----: | ----------------------------- | ----------------------------------------------------------------------------------- |
|     1 | `src/estilos/tokens.css`      | Paleta, papéis semânticos, fontes, escalas, raios, sombras, foco e geometria.       |
|     2 | `src/estilos/base.css`        | Reset, tipografia global, links, foco e redução de movimento. Importa `tokens.css`. |
|     3 | `src/estilos/formas.css`      | Hexágono, triângulo, selo, paralelogramo e seta por `clip-path`.                    |
|     4 | `src/estilos/componentes.css` | Barra lateral, cartões, indicadores, tabelas, links, botões, expansíveis e chat.    |
|     5 | `src/estilos/composicao.css`  | Ritmo, largura, listas, formulários, navegação e breakpoints.                       |

A ordem de importação em `src/App.tsx` é:

```tsx
import './estilos/base.css';
import './estilos/formas.css';
import './estilos/componentes.css';
import './estilos/composicao.css';
```

Como `base.css` importa `tokens.css`, a cadeia final é:

```text
tokens.css → base.css → formas.css → componentes.css → composicao.css
```

Não trocar essa ordem sem revisar a cascata.

### 2.2 Fontes de estilo TypeScript

Os arquivos CSS não descrevem sozinhos a página. Também fazem parte da aparência efetiva:

```text
src/estilos/tokens.ts
src/dominio/estilo/contraste.ts
src/componentes/modulo/comuns.ts
src/componentes/ui/Botao.tsx
src/componentes/ui/Cartao.tsx
src/componentes/ui/Selo.tsx
src/componentes/ui/Hexagono.tsx
src/componentes/ui/Barra.tsx
src/componentes/ui/Indicador.tsx
src/componentes/ui/IndicadorProgresso.tsx
src/componentes/ui/Expansivel.tsx
src/componentes/ui/ValorConteudo.tsx
src/componentes/layout/BarraLateral.tsx
src/componentes/layout/PainelChat.tsx
src/paginas/*.tsx
```

A estratégia atual é deliberada: classes CSS cuidam de layout, pseudoestados e enquadramento; estilos inline computáveis cuidam de valores dependentes de props, tom, estado, progresso e conteúdo.

---

## 3. Anatomia visual da página

A estrutura visual da SPA é:

```text
.nuage-aplicacao
├─ .nuage-atalho
├─ .nuage-barra-lateral
│  ├─ marca NuageIT
│  ├─ grupos de navegação
│  └─ cartão de progresso da Trilha
├─ .nuage-area-conteudo
│  ├─ main#conteudo-principal.nuage-corpo.nuage-prosa
│  │  └─ página corrente
│  └─ footer
└─ .nuage-chat-ancora
   ├─ .nuage-chat-painel (quando aberto)
   └─ .nuage-chat-gatilho
```

### 3.1 Sensação visual desejada

- navegação escura, fixa e persistente;
- conteúdo claro em fundo cinza-azulado muito suave;
- cartões brancos com borda neutra, não com sombra pesada;
- títulos em Montserrat e corpo em Inter;
- traço pink antes do sobretítulo;
- hexágonos para marcadores de posição;
- barra/segmentos para progresso, nunca anel circular;
- chat como sobreposição flutuante, não como coluna da página;
- leitura densa, com largura máxima e separação por divisórias;
- foco de teclado reto, pink e visível em qualquer fundo.

---

## 4. Etapa 1 — Criar os tokens

Comece pelos tokens. Nenhum componente deve começar com cor ou espaçamento escolhido “no olho”.

### 4.1 Cores de marca

```css
:root {
  --nuage-pink: #ff0073;
  --nuage-deep-blue: #000a80;
  --nuage-blue: #003fb4;
  --nuage-purple: #7c1475;
  --nuage-black: #0c0c0c;
  --nuage-white: #fbfbfb;

  /* Somente para fundo ativo com texto branco. */
  --nuage-pink-deep: #e30068;
}
```

Papéis:

| Token               | Valor     | Uso                                                   |
| ------------------- | --------- | ----------------------------------------------------- |
| `--nuage-pink`      | `#ff0073` | Acento, sobretítulo, foco, detalhe e barra invertida. |
| `--nuage-deep-blue` | `#000a80` | Início do gradiente principal.                        |
| `--nuage-blue`      | `#003fb4` | Links, borda ativa e ação secundária.                 |
| `--nuage-purple`    | `#7c1475` | Ação primária, fim do gradiente e pendência.          |
| `--nuage-pink-deep` | `#e30068` | Fundo do item ativo com texto branco.                 |

### 4.2 Famílias funcionais

```css
:root {
  --nuage-navy-900: #070b28;
  --nuage-navy-800: #0d1338;
  --nuage-navy-700: #1a2150;

  --nuage-surface: #ffffff;
  --nuage-neutral-50: #f7f8fa;
  --nuage-neutral-100: #eef0f4;
  --nuage-neutral-200: #e2e5ec;

  --nuage-ink-900: #141a35;
  --nuage-ink-700: #2a3149;
  --nuage-neutral-600: #5b6478;
  --nuage-neutral-400: #98a0b3;

  --nuage-pink-soft: #ffe4ef;
  --nuage-purple-soft: #f4e9f3;
  --nuage-blue-soft: #e7eefb;
}
```

### 4.3 Papéis semânticos

Não aplicar `--nuage-ink-700` diretamente se o componente precisa semanticamente de “texto”. Preferir:

```css
:root {
  --nuage-fundo: var(--nuage-neutral-50);
  --nuage-superficie: var(--nuage-surface);
  --nuage-superficie-sutil: var(--nuage-neutral-50);

  --nuage-fundo-navegacao: var(--nuage-navy-900);
  --nuage-superficie-navegacao: var(--nuage-navy-800);
  --nuage-borda-navegacao: var(--nuage-navy-700);

  --nuage-titulo: var(--nuage-ink-900);
  --nuage-texto: var(--nuage-ink-700);
  --nuage-texto-secundario: var(--nuage-neutral-600);
  --nuage-texto-invertido: var(--nuage-surface);
  --nuage-texto-invertido-secundario: var(--nuage-neutral-400);

  --nuage-borda: var(--nuage-neutral-200);
  --nuage-divisoria: var(--nuage-neutral-100);
  --nuage-borda-ativa: var(--nuage-blue);

  --nuage-destaque: var(--nuage-pink);
  --nuage-selecionado: var(--nuage-pink-deep);
  --nuage-acao-primaria: var(--nuage-purple);
  --nuage-acao-secundaria: var(--nuage-blue);
  --nuage-pendencia: var(--nuage-purple);
}
```

### 4.4 Gradientes

```css
:root {
  --nuage-gradient-main: linear-gradient(135deg, var(--nuage-deep-blue) 0%, var(--nuage-purple) 100%);

  --nuage-gradient-selected: var(--nuage-pink-deep);

  --nuage-gradient-nav: linear-gradient(180deg, var(--nuage-navy-900) 0%, var(--nuage-navy-800) 100%);
}
```

O estado selecionado é sólido, não o gradiente principal. O motivo é contraste: o pink puro sobre branco não é autorizado como rótulo pequeno.

### 4.5 Tipografia

```css
:root {
  --nuage-fonte-titulo: 'Montserrat', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --nuage-fonte-subtitulo: 'Montserrat', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --nuage-fonte-corpo: 'Inter', 'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --nuage-fonte-mono: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace;

  --nuage-peso-titulo: 700;
  --nuage-peso-subtitulo: 600;
  --nuage-peso-medio: 500;
  --nuage-peso-corpo: 400;
}
```

Escala:

| Papel        | Token                      | Valor       |
| ------------ | -------------------------- | ----------- |
| H1           | `--nuage-escala-titulo-1`  | `2.25rem`   |
| H2           | `--nuage-escala-titulo-2`  | `1.5rem`    |
| H3           | `--nuage-escala-titulo-3`  | `1.125rem`  |
| Subtítulo    | `--nuage-escala-subtitulo` | `1rem`      |
| Corpo        | `--nuage-escala-corpo`     | `0.9375rem` |
| Apoio        | `--nuage-escala-apoio`     | `0.8125rem` |
| Micro/rótulo | `--nuage-escala-micro`     | `0.6875rem` |
| Número       | `--nuage-escala-numero`    | `2rem`      |

Não trocar os valores para pixel fixo. A escala em `rem` permite ampliação até 200%.

### 4.6 Raios, bordas, sombras e espaçamento

```css
:root {
  --nuage-raio-nenhum: 0px;
  --nuage-raio-pequeno: 6px;
  --nuage-raio-medio: 8px;
  --nuage-raio-grande: 12px;
  --nuage-raio-pilula: 999px;

  --nuage-espessura-borda: 1px;
  --nuage-sombra-sutil: 0 1px 2px #070b2814;
  --nuage-sombra-flutuante: 0 12px 32px #070b2824;

  --nuage-espaco-1: 0.25rem;
  --nuage-espaco-2: 0.5rem;
  --nuage-espaco-3: 1rem;
  --nuage-espaco-4: 1.5rem;
  --nuage-espaco-5: 2rem;
  --nuage-espaco-6: 3rem;

  --nuage-largura-barra-lateral: 16rem;
  --nuage-largura-barra-lateral-recolhida: 4.5rem;
}
```

Uso:

- `0px`: grafismos, divisórias e elementos sob `clip-path`;
- `6px`: item compacto e badge pequeno;
- `8px`: botão, campo, moldura de ícone e controles;
- `12px`: cartão e painel;
- `999px`: pílula, trilho e preenchimento da barra.

Não usar `3px`, `10px`, `16px` ou outro valor fora da escala.

---

## 5. Etapa 2 — Aplicar reset e tipografia global

Em `base.css`:

```css
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
  border-radius: var(--nuage-raio-nenhum);
}

* {
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  min-height: 100vh;
  background-color: var(--nuage-fundo);
  color: var(--nuage-texto);
  font-family: var(--nuage-fonte-corpo);
  font-size: var(--nuage-escala-corpo);
  font-weight: var(--nuage-peso-corpo);
  line-height: 1.6;
  overflow-wrap: break-word;
}
```

Aplicar as regras gerais:

- mídia com `display: block`, `max-width: 100%` e altura automática;
- SVG com `stroke: currentColor`, nunca com cor própria;
- controles herdando fonte e cor;
- tabelas com `border-collapse: collapse` e largura total;
- parágrafos limitados a `72ch`;
- `code`, `kbd`, `samp` e `pre` em fonte mono;
- links azuis, sublinhados e com `text-underline-offset`.

### 5.1 Hierarquia

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--nuage-fonte-titulo);
  font-weight: var(--nuage-peso-subtitulo);
  line-height: 1.2;
  color: var(--nuage-titulo);
  text-wrap: balance;
}

h1 {
  font-size: var(--nuage-escala-titulo-1);
  font-weight: var(--nuage-peso-titulo);
  letter-spacing: -0.015em;
}

h2 {
  font-size: var(--nuage-escala-titulo-2);
}
h3 {
  font-size: var(--nuage-escala-titulo-3);
}

p,
li,
dd,
dt,
td,
th,
label {
  font-family: var(--nuage-fonte-corpo);
  font-size: var(--nuage-escala-corpo);
  line-height: 1.6;
}
```

### 5.2 Foco global

A réplica deve ter uma única política de foco:

```css
:focus-visible {
  outline: var(--nuage-foco-espessura) solid var(--nuage-foco-cor);
  outline-offset: var(--nuage-foco-deslocamento);
}

:focus:not(:focus-visible) {
  outline: none;
}
```

Não remover o foco nos componentes nem arredondar o contorno para acompanhar cartões.

### 5.3 Movimento reduzido

Preservar:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. Etapa 3 — Reproduzir as formas de marca

Em `formas.css`, declarar os polígonos com raio zero:

```css
.nuage-hexagono {
  clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
  border-radius: var(--nuage-raio-nenhum);
}

.nuage-hexagono-vertical {
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
  border-radius: var(--nuage-raio-nenhum);
}

.nuage-triangulo {
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  border-radius: var(--nuage-raio-nenhum);
}

.nuage-triangulo-canto {
  clip-path: polygon(100% 0, 100% 100%, 0 0);
  border-radius: var(--nuage-raio-nenhum);
}
```

Também replicar:

- `.nuage-selo`: corte de 45° na extremidade direita;
- `.nuage-paralelogramo`: segmento inclinado de progresso;
- `.nuage-seta`: seta reta horizontal.

### 6.1 Regra de geometria

A proibição de círculo vale para grafismo de identidade. Componentes podem ter canto suavizado quando usam um raio autorizado. Não converter hexágono em círculo, não usar avatar circular e não substituir o progresso segmentado por um anel.

---

## 7. Etapa 4 — Montar o enquadramento da aplicação

### 7.1 Aplicação e barra lateral

```css
.nuage-aplicacao {
  min-height: 100vh;
  background-color: var(--nuage-fundo);
}

.nuage-barra-lateral {
  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
  z-index: 20;
  width: var(--nuage-largura-barra-lateral);
  display: flex;
  flex-direction: column;
  background: var(--nuage-gradient-nav);
  background-color: var(--nuage-fundo-navegacao);
  color: var(--nuage-texto-invertido);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.nuage-area-conteudo {
  min-height: 100vh;
  padding-inline-start: var(--nuage-largura-barra-lateral);
  display: flex;
  flex-direction: column;
}
```

A barra é fixa em desktop e o conteúdo compensa com `padding-inline-start`. O documento inteiro não deve criar uma segunda coluna para o chat.

### 7.2 Área de leitura

```css
.nuage-container {
  width: 100%;
  max-width: 80rem;
  margin-inline: auto;
  padding-inline: var(--nuage-espaco-5);
}

.nuage-corpo {
  flex: 1 1 auto;
  width: 100%;
  max-width: 80rem;
  margin-inline: auto;
  padding: var(--nuage-espaco-6) var(--nuage-espaco-5);
}

.nuage-prosa p {
  max-width: 68ch;
}
```

O rodapé recebe espaço à direita para não ficar coberto pelo gatilho do chat:

```css
.nuage-area-conteudo > footer {
  padding-inline-end: 14rem;
}
```

### 7.3 Atalho de conteúdo

O primeiro elemento focável fica fora da tela até receber foco:

```css
.nuage-atalho {
  position: absolute;
  left: -100vw;
  top: 0;
  z-index: 30;
  padding: var(--nuage-espaco-2) var(--nuage-espaco-3);
  background-color: var(--nuage-fundo-navegacao);
  color: var(--nuage-texto-invertido);
  border-radius: var(--nuage-raio-medio);
}

.nuage-atalho:focus,
.nuage-atalho:focus-visible {
  left: var(--nuage-espaco-3);
  top: var(--nuage-espaco-2);
}
```

---

## 8. Etapa 5 — Reproduzir a barra lateral

### 8.1 Marca e grupos

```css
.nuage-marca {
  font-family: var(--nuage-fonte-titulo);
  font-weight: var(--nuage-peso-titulo);
  font-size: var(--nuage-escala-titulo-3);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--nuage-texto-invertido);
}

.nuage-grupo-nav {
  font-family: var(--nuage-fonte-subtitulo);
  font-size: var(--nuage-escala-micro);
  font-weight: var(--nuage-peso-subtitulo);
  letter-spacing: var(--nuage-letra-sobretitulo);
  text-transform: uppercase;
  color: var(--nuage-texto-invertido-secundario);
}
```

### 8.2 Item normal, hover e ativo

```css
.nuage-item-nav {
  display: flex;
  align-items: center;
  gap: var(--nuage-espaco-3);
  width: 100%;
  padding: var(--nuage-espaco-2) var(--nuage-espaco-3);
  border-radius: var(--nuage-raio-pequeno);
  color: var(--nuage-texto-invertido);
  text-decoration: none;
  font-size: var(--nuage-escala-corpo);
  font-weight: var(--nuage-peso-medio);
  text-align: start;
  transition: background-color 120ms ease;
}

.nuage-item-nav:hover {
  background-color: var(--nuage-superficie-navegacao);
}

.nuage-item-nav[aria-current='page'] {
  background: var(--nuage-gradient-selected);
  background-color: var(--nuage-selecionado);
  font-weight: var(--nuage-peso-subtitulo);
}

.nuage-item-nav[aria-current='page']:hover {
  background: var(--nuage-gradient-selected);
  background-color: var(--nuage-selecionado);
}
```

O estado ativo precisa ser expresso simultaneamente por `aria-current="page"` e por estilo visível. Não usar somente cor.

### 8.3 Cartão de progresso da barra

`.nuage-cartao-usuario` é o nome histórico da classe, mas o conteúdo atual é progresso da Trilha, não usuário autenticado:

```css
.nuage-cartao-usuario {
  display: flex;
  align-items: center;
  gap: var(--nuage-espaco-3);
  padding: var(--nuage-espaco-3);
  border-radius: var(--nuage-raio-medio);
  background-color: var(--nuage-superficie-navegacao);
  border: var(--nuage-espessura-borda) solid var(--nuage-borda-navegacao);
}
```

---

## 9. Etapa 6 — Reproduzir a composição de páginas

### 9.1 Ritmo

```css
.nuage-pagina {
  display: flex;
  flex-direction: column;
  gap: var(--nuage-espaco-6);
}

.nuage-pagina-cabecalho {
  display: flex;
  flex-direction: column;
  gap: var(--nuage-espaco-2);
  padding-block-end: var(--nuage-espaco-4);
  border-bottom: var(--nuage-espessura-borda) solid var(--nuage-divisoria);
}

.nuage-pagina-cabecalho h1 {
  max-width: 18ch;
}

.nuage-pagina-cabecalho p {
  max-width: 72ch;
  color: var(--nuage-texto-secundario);
}
```

Blocos sucessivos usam divisória e preenchimento inicial:

```css
.nuage-bloco-pagina {
  display: flex;
  flex-direction: column;
  gap: var(--nuage-espaco-3);
}

.nuage-bloco-pagina + .nuage-bloco-pagina {
  padding-block-start: var(--nuage-espaco-5);
  border-top: var(--nuage-espessura-borda) solid var(--nuage-divisoria);
}
```

### 9.2 Sobretítulo

O sobretítulo é um rótulo visual, não um novo nível semântico:

```css
.nuage-sobretitulo {
  display: flex;
  align-items: center;
  gap: var(--nuage-espaco-2);
  font-family: var(--nuage-fonte-subtitulo);
  font-size: var(--nuage-escala-micro);
  font-weight: var(--nuage-peso-subtitulo);
  letter-spacing: var(--nuage-letra-sobretitulo);
  text-transform: uppercase;
  color: var(--nuage-texto-secundario);
}

.nuage-sobretitulo::before {
  content: '';
  display: block;
  width: 1.75rem;
  height: 2px;
  background-color: var(--nuage-destaque);
}
```

O componente React deve manter `aria-hidden="true"` no sobretítulo e fornecer o título real em `h2`/`h3`.

### 9.3 Status e avisos

```css
.nuage-status {
  max-width: none;
  padding: var(--nuage-espaco-3);
  border: var(--nuage-espessura-borda) solid var(--nuage-borda);
  border-inline-start: 3px solid var(--nuage-destaque);
  border-radius: var(--nuage-raio-medio);
  background-color: var(--nuage-superficie);
  color: var(--nuage-texto);
}
```

A página inicial usa `.nuage-faixa` para avisos, com a mesma faixa pink na borda esquerda.

---

## 10. Etapa 7 — Reproduzir superfícies, cartões e indicadores

### 10.1 Cartão

```css
.nuage-cartao {
  background-color: var(--nuage-superficie);
  border: var(--nuage-espessura-borda) solid var(--nuage-borda);
  border-radius: var(--nuage-raio-grande);
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.nuage-cartao-navegavel:hover {
  border-color: var(--nuage-borda-ativa);
  box-shadow: var(--nuage-sombra-sutil);
}
```

No componente `Cartao`:

- superfície clara por padrão;
- tom invertido opcional para superfície escura;
- padding padrão `1.5rem`;
- `position: relative`;
- título semântico configurável;
- sobretítulo com `aria-hidden`;
- sombra somente quando o cartão é navegável e recebe hover.

Não usar sombra como separador padrão. A separação normal é feita por fundo e borda.

### 10.2 Faixa de indicadores

```css
.nuage-faixa-indicadores {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  background-color: var(--nuage-superficie);
  border-block: var(--nuage-espessura-borda) solid var(--nuage-borda);
}

.nuage-indicador {
  display: flex;
  align-items: flex-start;
  gap: var(--nuage-espaco-3);
  padding: var(--nuage-espaco-4);
}

.nuage-indicador + .nuage-indicador {
  border-inline-start: var(--nuage-espessura-borda) solid var(--nuage-divisoria);
}

.nuage-moldura-icone {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--nuage-raio-medio);
  border: var(--nuage-espessura-borda) solid var(--nuage-borda);
}
```

O número grande é inline, com `2rem`, peso 700 e fonte de título. O qualificador usa fonte mono.

### 10.3 Progresso

A barra horizontal usa trilho neutro e preenchimento em gradiente:

```css
/* Estrutura computada pelo componente Barra */
.trilho {
  width: 100%;
  height: 0.5rem;
  background: var(--nuage-neutral-200);
  border-radius: var(--nuage-raio-pilula);
  overflow: hidden;
}

.preenchimento {
  height: 100%;
  background: var(--nuage-gradient-main);
  border-radius: var(--nuage-raio-pilula);
}
```

`IndicadorProgresso` acrescenta 11 segmentos flexíveis, um por Modulo. Segmentos concluídos usam roxo na superfície clara e pink no tom invertido; segmentos pendentes usam `neutral-200` ou `navy-700`.

---

## 11. Etapa 8 — Reproduzir links, botões e campos

### 11.1 Links

```css
.nuage-link {
  color: var(--nuage-acao-secundaria);
  text-decoration: underline;
  text-underline-offset: 0.25em;
  text-decoration-thickness: 1px;
}

.nuage-link:hover {
  color: var(--nuage-acao-primaria);
  text-decoration-color: var(--nuage-destaque);
}
```

Links que navegam continuam sendo `<a>`/React Router `Link`, mesmo quando visualmente parecem botões.

### 11.2 Botões

O `Botao.tsx` deriva o estilo dos tokens:

```css
.nuage-botao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--nuage-espaco-2);
  border-radius: var(--nuage-raio-medio);
  font-family: var(--nuage-fonte-subtitulo);
  font-weight: var(--nuage-peso-subtitulo);
  letter-spacing: var(--nuage-letra-rotulo);
  transition:
    filter 120ms ease,
    border-color 120ms ease,
    background-color 120ms ease;
}

.nuage-botao:not([disabled]):not([aria-disabled='true']):hover {
  filter: brightness(1.1);
}

.nuage-botao-secundario:not([disabled]):not([aria-disabled='true']):hover {
  border-color: var(--nuage-borda-ativa);
  background-color: var(--nuage-superficie-sutil);
  filter: none;
}
```

Valores inline do botão:

- padding: `0.5rem 1.5rem`;
- fonte corpo: `0.9375rem`;
- primário: roxo + texto branco + borda roxa;
- secundário: superfície branca + borda neutra + texto escuro;
- desabilitado: `opacity: 0.6`, `cursor: not-allowed`;
- não alterar a cor do texto desabilitado, para não quebrar contraste.

### 11.3 Campos

```css
.nuage-campo,
.nuage-formulario input,
.nuage-formulario select,
.nuage-formulario textarea {
  width: 100%;
  min-height: 2.75rem;
  padding: var(--nuage-espaco-2) var(--nuage-espaco-3);
  border: var(--nuage-espessura-borda) solid var(--nuage-borda);
  border-radius: var(--nuage-raio-medio);
  background-color: var(--nuage-superficie);
  color: var(--nuage-texto);
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.nuage-campo:hover,
.nuage-formulario input:hover,
.nuage-formulario select:hover,
.nuage-formulario textarea:hover {
  border-color: var(--nuage-borda-ativa);
}

.nuage-campo:focus,
.nuage-formulario input:focus,
.nuage-formulario select:focus,
.nuage-formulario textarea:focus {
  border-color: var(--nuage-borda-ativa);
}
```

A triagem, busca, Glossário e chat aplicam parte desses valores inline por usarem componentes ainda não padronizados com `.nuage-formulario`. Ao migrar para uma réplica, manter o mesmo resultado computado ou centralizar sem alterar a aparência.

### 11.4 Formulário de página

```css
.nuage-formulario {
  display: flex;
  flex-direction: column;
  gap: var(--nuage-espaco-3);
  width: min(100%, 38rem);
  padding: var(--nuage-espaco-4);
  border: var(--nuage-espessura-borda) solid var(--nuage-borda);
  border-radius: var(--nuage-raio-grande);
  background-color: var(--nuage-superficie);
}

.nuage-campo-grupo {
  display: flex;
  flex-direction: column;
  gap: var(--nuage-espaco-1);
}
```

---

## 12. Etapa 9 — Reproduzir selos e pendências

### 12.1 Selo

O componente `Selo.tsx` usa:

- `display: inline-flex`;
- `align-self: flex-start`;
- padding `0.25rem 1rem`;
- fonte de apoio, peso 600;
- `line-height: 1.4`;
- `white-space: nowrap`;
- raio pílula `999px`.

Tons:

| Tom         | Fundo         | Texto           |
| ----------- | ------------- | --------------- |
| neutro      | `neutral-100` | `tinta700`      |
| informativo | `azul-suave`  | `azul`          |
| pendência   | `roxo-suave`  | `roxo`          |
| confirmado  | `azul-suave`  | `azul-profundo` |

### 12.2 Pendência de conteúdo

`MarcacaoPendencia.tsx` é um bloco visual que substitui o valor pendente:

```css
.marcacao-pendencia {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--nuage-espaco-2);
  padding: var(--nuage-espaco-3);
  background-color: var(--nuage-purple-soft);
  border: 1px solid var(--nuage-purple);
  border-radius: var(--nuage-raio-medio);
  color: var(--nuage-ink-900);
}
```

Não renderizar o valor confirmado ao lado da marcação. `ValorConteudo.tsx` garante a exclusão mútua.

---

## 13. Etapa 10 — Reproduzir variantes de conteúdo

As seções compartilham os estilos computáveis de `src/componentes/modulo/comuns.ts`:

```ts
export const ESTILO_SECAO = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: ESPACO.n3,
  marginTop: ESPACO.n6,
  paddingTop: ESPACO.n4,
  borderTop: `1px solid ${PAPEL_COR.divisoria}`,
};

export const ESTILO_TITULO_SECAO = {
  fontFamily: FONTE.titulo,
  fontWeight: PESO.titulo,
  fontSize: ESCALA.titulo3,
  color: PAPEL_COR.titulo,
};

export const ESTILO_TEXTO = {
  fontFamily: FONTE.corpo,
  fontSize: ESCALA.corpo,
  color: PAPEL_COR.texto,
};

export const ESTILO_APOIO = {
  fontFamily: FONTE.corpo,
  fontSize: ESCALA.apoio,
  color: PAPEL_COR.texto,
};
```

A réplica visual precisa reproduzir:

- filete superior e espaçamento entre seções;
- título h2 da seção em tinta escura;
- parágrafo em corpo escuro;
- apoio em tamanho menor;
- listas sem marcador padrão e com gap de `0.5rem`;
- origem do conteúdo em selo + rótulo mono.

### 13.1 Comparativas

Usar tabela nativa, cabeçalho com `scope="col"`, borda neutra, células com padding `0.5rem` e rolagem horizontal:

```css
.nuage-tabela {
  width: 100%;
  border-collapse: collapse;
}

.nuage-tabela thead th {
  background-color: var(--nuage-superficie-sutil);
  color: var(--nuage-texto-secundario);
  padding: var(--nuage-espaco-3);
  border-bottom: var(--nuage-espessura-borda) solid var(--nuage-borda);
}

.nuage-tabela tbody td {
  padding: var(--nuage-espaco-3);
  border-bottom: var(--nuage-espessura-borda) solid var(--nuage-divisoria);
  vertical-align: top;
}
```

A implementação atual também define estilos de célula inline em `SecaoComparativa.tsx`. O estilo computado final deve permanecer equivalente.

### 13.2 Checklist

Cada item usa superfície branca, borda neutra, padding `1rem`, raio médio e checkbox nativo. Em modo somente leitura:

- checkbox permanece visível;
- checkbox fica desabilitado;
- texto explica que as marcações não serão preservadas;
- o contraste do conteúdo não deve ser reduzido artificialmente.

### 13.3 Banco de Perguntas

Os controles de Pilar e iniciativa usam:

- `select` nativo;
- borda neutra;
- fundo branco;
- padding `0.5rem`;
- raio médio;
- labels em fonte de apoio/subtítulo;
- perguntas dentro de `<details>`.

`Expansivel.tsx` usa `.nuage-expansivel`, `.nuage-expansivel-resumo` e `.nuage-expansivel-seta`:

```css
.nuage-expansivel-resumo::-webkit-details-marker {
  display: none;
}

.nuage-expansivel-resumo {
  list-style: none;
}

.nuage-expansivel-seta {
  display: inline-flex;
  transition: transform 120ms ease;
}

.nuage-expansivel[open] .nuage-expansivel-seta {
  transform: rotate(90deg);
}
```

Não substituir `<details>` por `div` com `onClick`.

### 13.4 Fórmulas

Fórmulas são apenas texto:

- expressão em fonte mono;
- superfície sutil;
- borda neutra;
- padding `1rem`;
- raio médio;
- sem input;
- sem botão de cálculo.

### 13.5 Modelo de prompt

Blocos literais usam `<pre>` e duas variantes:

| Formato    | `white-space` | Overflow                                           |
| ---------- | ------------- | -------------------------------------------------- |
| `diagrama` | `pre`         | `overflow-x: auto`, fonte micro, não quebra linha. |
| `prompt`   | `pre-wrap`    | quebra como prosa, fonte de apoio.                 |

O `<pre>` do diagrama recebe `tabIndex={0}` para permitir acesso por teclado.

---

## 14. Etapa 11 — Reproduzir o chat flutuante

```css
.nuage-chat-ancora {
  position: fixed;
  inset-block-end: var(--nuage-espaco-4);
  inset-inline-end: var(--nuage-espaco-4);
  z-index: 25;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--nuage-espaco-3);
}

.nuage-chat-gatilho {
  display: inline-flex;
  align-items: center;
  gap: var(--nuage-espaco-2);
  padding: var(--nuage-espaco-3) var(--nuage-espaco-4);
  border-radius: var(--nuage-raio-medio);
  background: var(--nuage-gradient-main);
  background-color: var(--nuage-fundo-navegacao);
  color: var(--nuage-texto-invertido);
  font-family: var(--nuage-fonte-subtitulo);
  font-weight: var(--nuage-peso-subtitulo);
  font-size: var(--nuage-escala-apoio);
  box-shadow: var(--nuage-sombra-flutuante);
}

.nuage-chat-painel {
  width: min(24rem, calc(100vw - var(--nuage-espaco-5)));
  max-height: min(34rem, calc(100vh - var(--nuage-espaco-6)));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--nuage-superficie);
  border: var(--nuage-espessura-borda) solid var(--nuage-borda);
  border-radius: var(--nuage-raio-grande);
  box-shadow: var(--nuage-sombra-flutuante);
}

.nuage-chat-mensagens {
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

Composição adicional em `composicao.css`:

```css
.nuage-chat-painel header {
  background-color: var(--nuage-superficie-sutil);
}

.nuage-chat-painel textarea {
  resize: vertical;
  min-height: 5.5rem;
}

.nuage-chat-painel .nuage-botao {
  width: 100%;
}
```

O painel deve:

- ficar disponível em todas as rotas;
- preservar o histórico quando fechado;
- fechar com Escape;
- devolver foco ao gatilho;
- manter mensagens em uma região `role="log"`;
- mostrar estados de erro sem remover mensagens anteriores.

---

## 15. Etapa 12 — Rodapé e navegação de continuidade

Rodapé:

- superfície branca;
- borda superior neutra;
- padding vertical de `1.5rem`;
- texto de apoio em `0.8125rem`;
- texto limitado pelo container de `80rem`.

Navegação entre Modulos/seções:

```css
.nuage-navegacao-vizinhos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--nuage-espaco-3);
  padding-block-start: var(--nuage-espaco-4);
  border-top: var(--nuage-espessura-borda) solid var(--nuage-divisoria);
}

.nuage-navegacao-vizinhos > :empty {
  min-width: 8rem;
}
```

A rota de seção possui cabeçalho sticky com fundo do conteúdo, padding vertical de `1rem` e borda inferior de divisória.

---

## 16. Etapa 13 — Responsividade

### 16.1 Breakpoint da barra lateral

Abaixo de `64rem`:

```css
@media (max-width: 63.999rem) {
  .nuage-barra-lateral {
    position: static;
    width: 100%;
    max-height: none;
  }

  .nuage-area-conteudo {
    padding-inline-start: 0;
  }
}
```

A navegação não vira gaveta: continua disponível na faixa superior.

### 16.2 Breakpoint de composição

Abaixo de `48rem`:

```css
@media (max-width: 48rem) {
  .nuage-corpo {
    padding: var(--nuage-espaco-5) var(--nuage-espaco-3);
  }

  .nuage-pagina {
    gap: var(--nuage-espaco-5);
  }

  .nuage-pagina-cabecalho h1 {
    max-width: none;
  }

  .nuage-cartao-modulo {
    grid-template-columns: 1fr;
  }

  .nuage-navegacao-vizinhos > :empty {
    display: none;
  }
}
```

### 16.3 Regras de verificação visual

Testar no mínimo em:

- viewport larga: barra lateral fixa e cartões completos;
- viewport intermediária: barra lateral no topo e conteúdo sem padding lateral;
- viewport estreita: listas e navegação quebrando sem overflow horizontal;
- zoom do navegador em 200%;
- preferência `prefers-reduced-motion: reduce`;
- teclado sem mouse;
- painel de chat aberto próximo ao rodapé.

---

## 17. Estilos inline que precisam ser preservados

A SPA atual usa inline styles para valores dependentes de props e estado. Ao portar para outro framework, converter esses estilos para classes equivalentes apenas se o resultado computado permanecer igual.

### 17.1 Primitivos

| Componente      | Estilos dinâmicos principais                          |
| --------------- | ----------------------------------------------------- |
| `Botao`         | Tom primário/secundário, disabled, largura total.     |
| `Cartao`        | Tom claro/invertido, título, apoio, padding opcional. |
| `Selo`          | Tom de fundo/texto e `align-self: flex-start`.        |
| `Hexagono`      | Tom, tamanho e alternativa textual.                   |
| `Barra`         | Percentual, tom, altura e modo decorativo.            |
| `Indicador`     | Valor, rótulo, detalhe mono e ícone.                  |
| `Expansivel`    | Estado aberto e conteúdo.                             |
| `ValorConteudo` | Ramo confirmado ou marcação pendente.                 |

### 17.2 Seções

`src/componentes/modulo/comuns.ts` centraliza:

- `ESTILO_SECAO`;
- `ESTILO_TITULO_SECAO`;
- `ESTILO_TEXTO`;
- `ESTILO_APOIO`;
- `ESTILO_LISTA`.

Não duplicar esses valores por seção. A réplica deve ter uma única escala de gap e uma única regra para título, apoio e texto.

### 17.3 Páginas

Páginas como `Inicio.tsx`, `Triagem.tsx`, `Busca.tsx`, `Glossario.tsx`, `Modulo.tsx` e `Secao.tsx` também compõem flexbox e aplicam cor/tipografia inline. Durante a migração:

1. manter a hierarquia semântica;
2. substituir gradualmente estilos repetidos por classes;
3. comparar o estilo computado antes e depois;
4. não criar uma segunda paleta para “facilitar” a migração.

---

## 18. Estados visuais a replicar

| Estado              | Elemento          | Aparência esperada                                                     |
| ------------------- | ----------------- | ---------------------------------------------------------------------- |
| Normal              | item da barra     | Texto branco, fundo transparente.                                      |
| Hover               | item da barra     | Superfície navy-800, texto preservado.                                 |
| Ativo               | item da barra     | Fundo `pink-deep`, texto branco, `aria-current`.                       |
| Hover navegável     | cartão            | Borda azul ativa e sombra sutil.                                       |
| Primário            | botão             | Roxo, texto branco.                                                    |
| Secundário          | botão             | Branco, borda neutra, texto escuro.                                    |
| Desabilitado        | botão/checkbox    | Opacidade reduzida, texto ainda legível, controle nativo desabilitado. |
| Foco                | qualquer controle | Outline pink de 3px, offset de 2px.                                    |
| Aberto              | expansível        | Seta rotacionada 90°.                                                  |
| Confirmado          | selo              | Tinta suave + cor forte correspondente.                                |
| Pendente            | bloco             | Fundo roxo suave, borda roxa, texto escuro.                            |
| Progresso concluído | barra             | Roxo/gradiente em tom claro ou pink em tom invertido.                  |
| Progresso pendente  | barra             | Neutral-200 ou navy-700.                                               |
| Chat aberto         | painel            | Painel branco flutuante, borda e sombra flutuante.                     |
| Chat processando    | envio             | Botão bloqueado e mensagem de processamento.                           |
| Erro de chat        | alerta            | Mensagens preservadas, alerta e nova tentativa disponíveis.            |

Não usar somente hover para transmitir informação. Estado selecionado precisa de semântica acessível.

---

## 19. Classes declaradas, mas que exigem conferência de uso

Antes de considerar a réplica completa, conferir se o markup realmente aplica cada classe:

- `.nuage-tabela` existe em `componentes.css`, mas `SecaoComparativa.tsx` também aplica estilos diretamente à tabela;
- `.nuage-bloco-pagina`, `.nuage-lista-modulos`, `.nuage-lista-cartoes` e `.nuage-lista-resultados` são classes de composição disponíveis, mas várias páginas atuais montam o mesmo layout com inline styles;
- `.nuage-formulario` e `.nuage-campo` possuem uma API CSS central, enquanto algumas páginas ainda aplicam campos inline;
- `.nuage-pagina-inicio` identifica a página inicial, mas a maior parte do seu ritmo vem de `.nuage-pagina` e inline styles;
- `.nuage-item-nav-filho` está preparado para navegação filha, mesmo que a barra atual use os destinos principais.

A regra é comparar a árvore renderizada e o estilo computado, não apenas contar seletores no CSS.

---

## 20. Roteiro de implementação executável

### Fase A — Fundação

- [ ] Criar `tokens.css` com todos os tokens `--nuage-*`.
- [ ] Criar `tokens.ts` como espelho sem redigitar cores.
- [ ] Configurar `contraste.ts` e catálogo de pares permitidos.
- [ ] Importar `tokens.css` por `base.css`.
- [ ] Aplicar reset global e escala tipográfica.
- [ ] Aplicar foco global e reduced motion.

### Fase B — Geometria

- [ ] Criar `formas.css`.
- [ ] Adicionar os seis polígonos.
- [ ] Garantir `border-radius: 0` onde houver `clip-path`.
- [ ] Implementar `Hexagono`, `Barra` e `IndicadorProgresso`.

### Fase C — Enquadramento

- [ ] Criar `.nuage-aplicacao`.
- [ ] Criar barra lateral fixa de `16rem`.
- [ ] Compensar o conteúdo com `padding-inline-start`.
- [ ] Criar container de `80rem`.
- [ ] Criar conteúdo com padding `3rem 2rem`.
- [ ] Criar atalho de teclado.
- [ ] Criar rodapé com folga para o chat.

### Fase D — Componentes

- [ ] Navegação e estado `aria-current`.
- [ ] Sobretítulo com pseudo-elemento pink.
- [ ] Cartão claro/invertido.
- [ ] Indicadores e divisórias.
- [ ] Links e botões.
- [ ] Campos e formulários.
- [ ] Selos e pendências.
- [ ] Tabelas e expansíveis.

### Fase E — Páginas

- [ ] Início.
- [ ] Trilha.
- [ ] Índice de Modulo.
- [ ] Página de seção.
- [ ] Triagem.
- [ ] Busca.
- [ ] Glossário.
- [ ] Referências.
- [ ] Pendências.
- [ ] Página não encontrada.

### Fase F — Chat

- [ ] Gatilho fixo no canto inferior direito.
- [ ] Painel com largura máxima de `24rem`.
- [ ] Altura máxima de `34rem`.
- [ ] Mensagens com rolagem interna.
- [ ] Textarea redimensionável verticalmente.
- [ ] Botão ocupando toda a largura do formulário.
- [ ] Foco devolvido ao gatilho ao fechar.

### Fase G — Responsividade e revisão

- [ ] Breakpoint de `64rem` para barra lateral.
- [ ] Breakpoint de `48rem` para composição.
- [ ] Testar conteúdo longo.
- [ ] Testar tabelas e diagramas com overflow.
- [ ] Testar ampliação em 200%.
- [ ] Testar teclado e reduced motion.
- [ ] Comparar screenshots somente como apoio; a validação final é pelo DOM, tokens e estilo computado.

---

## 21. Checklist de validação visual e técnica

### Tokens

- [ ] Todas as cores vêm de `PALETA_SISTEMA`.
- [ ] `tokens.css` e `tokens.ts` têm os mesmos valores.
- [ ] Não existe cor hexadecimal nova em componente.
- [ ] Não existe gradiente fora dos três gradientes definidos.
- [ ] Não existe raio fora de `0`, `6px`, `8px`, `12px` e `999px`.
- [ ] Nenhum `font-size` de interface foi fixado em pixel.

### Layout

- [ ] Barra lateral fixa no desktop.
- [ ] Conteúdo com compensação lateral.
- [ ] Barra lateral vira faixa no topo abaixo de `64rem`.
- [ ] Conteúdo se adapta abaixo de `48rem`.
- [ ] Chat não ocupa uma coluna permanente.
- [ ] Rodapé não fica escondido pelo chat.

### Componentes

- [ ] Cartões têm borda neutra e raio grande.
- [ ] Sombras aparecem somente em elementos navegáveis/flutuantes.
- [ ] Sobretítulos têm traço pink e `aria-hidden`.
- [ ] Botão primário é roxo.
- [ ] Botão secundário é branco com borda.
- [ ] Selo não estica para a largura total.
- [ ] Hexágono não tem raio arredondado.
- [ ] Progresso não é circular.
- [ ] Tabela tem cabeçalho acessível.
- [ ] Expansível usa `<details>`.

### Estados

- [ ] Hover não reduz contraste.
- [ ] Estado ativo tem `aria-current`.
- [ ] Foco tem outline de 3px pink.
- [ ] Disabled não usa texto ilegível.
- [ ] Pendência substitui conteúdo.
- [ ] Chat aberto e fechado preservam layout e foco.
- [ ] Reduced motion desativa transições longas.

### Comandos

```bash
npm run typecheck
npm run test:run
npm run build
```

A suíte esperada inclui:

- teste de espelho dos tokens;
- teste de estilos Brandbook;
- Property 34 de conformidade visual;
- Property 35 de contraste;
- Property 36 de teclado/foco;
- Property 37 de alternativas textuais;
- auditoria `axe` das páginas e variantes de seção.

---

## 22. Verificações específicas recomendadas

### 22.1 Contraste

Para qualquer novo par, validar matematicamente e no catálogo:

```ts
atendeContrasteMinimo(frente, fundo, uso);
parPermitidoParaUso(frente, fundo, uso);
```

Não basta a razão matemática. O par também precisa estar autorizado para o uso de projeto.

Recortes importantes:

- pink puro sobre claro: apenas foco, borda, ícone e texto grande;
- pink profundo sobre branco: texto de estado selecionado;
- `neutral-400`: apoio sobre navy, não texto em fundo claro;
- texto de corpo sobre branco: `tinta900`, `tinta700` ou `neutral600` conforme papel;
- texto em tinta suave: `tinta900`.

### 22.2 Estilo computado

Em testes de componente, verificar o estilo computado depois da montagem, porque `var(--nuage-*)` pode não estar resolvido fora do navegador:

```ts
const elemento = screen.getByRole('button', {
  name: 'Enviar pergunta',
});

expect(getComputedStyle(elemento).borderRadius).toBe('8px');
```

A Property 34 deve continuar proibindo:

- cores fora da paleta;
- raios fora da escala;
- círculos de identidade;
- formas orgânicas.

### 22.3 Acessibilidade

- consultar controles por papel e nome acessível;
- verificar labels de `input`, `select` e `textarea`;
- verificar `aria-current` na navegação;
- verificar alternativa textual de hexágonos, barras e ícones informativos;
- verificar elementos decorativos com `aria-hidden`;
- verificar foco visível;
- executar `axe` com `color-contrast` desabilitado no jsdom, pois contraste é validado pelo catálogo próprio.

---

## 23. O que não copiar do protótipo `Onboarding/` para a SPA

O protótipo estático usa outra identidade visual. Seus tokens principais são:

```css
--bg-main: #020617;
--bg-card: rgba(15, 23, 42, 0.7);
--border-color: rgba(51, 65, 85, 0.8);
--text-main: #f8fafc;
--text-muted: #94a3b8;
--primary: #4f46e5;
--primary-hover: #4338ca;
--primary-light: #818cf8;
--success: #34d399;
```

Ele também usa:

- `.header` sticky horizontal de `68px`;
- `.nav-bar` horizontal;
- `.logo-icon` arredondado;
- `.cards-grid` de três colunas a partir de `768px`;
- glow radial índigo;
- cards com raio de `16px`;
- checklist com raio de `12px`;
- Lucide carregado por CDN;
- `font-family: Inter` diretamente no CSS;
- conteúdo de SDR, e não a Trilha de 11 Modulos.

Esses valores não pertencem ao Design System NuageIT da SPA. Eles devem ser replicados somente se o objetivo for reconstruir o protótipo `NuageHub` como site estático independente.

### 23.1 Roteiro separado do protótipo

Se a réplica desejada for o protótipo estático:

1. usar `Onboarding/styles.css` como folha principal;
2. manter os quatro HTMLs e seus estilos inline editoriais;
3. manter `lucide@latest` ou substituir por SVG local sem alterar o layout;
4. reproduzir `.header`, `.nav-bar`, `.hero`, `.cards-grid`, `.checklist-panel` e `.article-wrap`;
5. testar breakpoints de `640px`, `768px` e `min-width: 768px`;
6. não usar os tokens `--nuage-*` sem uma decisão de unificação visual.

---

## 24. Resultado esperado

Ao concluir o roteiro, a página deve apresentar:

- uma barra lateral escura persistente;
- marca NuageIT e navegação agrupada;
- conteúdo claro com largura limitada;
- títulos e corpo na hierarquia Montserrat/Inter;
- cartões brancos com borda e raio de `12px`;
- sobretítulos com traço pink;
- indicadores com divisórias verticais;
- hexágonos e outros polígonos como grafismos;
- progresso horizontal/segmentado;
- links azuis e ações roxas;
- campos brancos com borda neutra;
- selos em tintas suaves;
- pendências visualmente substitutivas;
- chat flutuante com sombra própria;
- layout adaptado a `64rem` e `48rem`;
- foco pink visível e comportamento preservado em teclado;
- nenhum valor visual fora dos tokens autorizados.

A réplica só deve ser considerada concluída depois que o estilo computado, os estados, a responsividade e os testes de acessibilidade confirmarem o mesmo sistema visual — não apenas depois de uma comparação superficial de cores.
