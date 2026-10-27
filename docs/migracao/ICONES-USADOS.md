# Códigos dos ícones usados

## 1. Ícones SVG da aplicação React

Os ícones da SPA React estão definidos em:

```text
src/componentes/ui/Icone.tsx
```

Eles são desenhados localmente, sem biblioteca externa de ícones.

### Configuração padrão do SVG

```tsx
<svg
  viewBox="0 0 24 24"
  width="1.125rem"
  height="1.125rem"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="CAMINHO_DO_ICONE" />
</svg>
```

Características:

- grade de desenho `24 x 24`;
- traço de `1.5`;
- extremidades e junções arredondadas;
- `fill="none"`;
- `stroke="currentColor"`, herdando a cor do elemento pai;
- tamanho padrão de `1.125rem`;
- ícones decorativos com `aria-hidden="true"`;
- ícones informativos com `role="img"` e `aria-label`.

---

## 2. Mapa completo de paths SVG

```ts
export const TRACADO = {
  inicio: 'M3 10.5 12 3l9 7.5M5.25 9.5V20h13.5V9.5',

  trilha: 'M9 4.5h11M9 12h11M9 19.5h11M4 4.5h.01M4 12h.01M4 19.5h.01',

  triagem: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',

  busca: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4.2-4.2',

  glossario: 'M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4ZM17 7h2v13H8',

  referencias:
    'M10 13a4 4 0 0 0 5.7.4l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 11a4 4 0 0 0-5.7-.4l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2',

  pendencias: 'M12 3.5 22 20H2L12 3.5ZM12 9.5v5M12 17h.01',

  perguntas: 'M9 9a3 3 0 1 1 3 3v2.5M12 18h.01M4 4h16v16H4V4Z',

  chat: 'M4 5h16v11H9l-5 4V5Z',

  fechar: 'M6 6l12 12M18 6 6 18',

  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',

  'seta-direita': 'M5 12h13M12.5 5.5 19 12l-6.5 6.5',

  sair: 'M15 4h4v16h-4M11 8l-4 4 4 4M7 12h10',
} as const;
```

> `sair` está definido no catálogo de ícones, mas não possui uso atual na interface React.

---

## 3. Lista de ícones efetivamente usados na SPA

| Nome           | Descrição               | Uso principal                         |
| -------------- | ----------------------- | ------------------------------------- |
| `inicio`       | Casa                    | Navegação para a página inicial       |
| `trilha`       | Lista com marcadores    | Navegação e progresso da Trilha       |
| `triagem`      | Funil                   | Triagem de escopo                     |
| `busca`        | Lupa                    | Busca e pesquisa prévia               |
| `glossario`    | Livro/documentação      | Glossário                             |
| `referencias`  | Elo/link                | Referências do Cog Solutions          |
| `pendencias`   | Triângulo de alerta     | Pendências e módulos restantes        |
| `perguntas`    | Quadro com interrogação | Banco de Perguntas                    |
| `chat`         | Balão de conversa       | Abertura do chat                      |
| `fechar`       | X                       | Fechamento do chat                    |
| `check`        | Marca de confirmação    | Módulos concluídos                    |
| `seta-direita` | Seta horizontal         | Próximo, voltar, expandir e navegação |

Total efetivamente usado na SPA: **12 ícones**.

---

## 4. Componente React completo

O componente atual pode ser reproduzido assim:

```tsx
import type { SVGProps } from 'react';

export type NomeIcone =
  | 'inicio'
  | 'trilha'
  | 'triagem'
  | 'busca'
  | 'glossario'
  | 'referencias'
  | 'pendencias'
  | 'perguntas'
  | 'chat'
  | 'fechar'
  | 'check'
  | 'seta-direita'
  | 'sair';

const TRACADO: Readonly<Record<NomeIcone, string>> = {
  inicio: 'M3 10.5 12 3l9 7.5M5.25 9.5V20h13.5V9.5',
  trilha: 'M9 4.5h11M9 12h11M9 19.5h11M4 4.5h.01M4 12h.01M4 19.5h.01',
  triagem: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  busca: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4.2-4.2',
  glossario: 'M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4ZM17 7h2v13H8',
  referencias:
    'M10 13a4 4 0 0 0 5.7.4l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 11a4 4 0 0 0-5.7-.4l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2',
  pendencias: 'M12 3.5 22 20H2L12 3.5ZM12 9.5v5M12 17h.01',
  perguntas: 'M9 9a3 3 0 1 1 3 3v2.5M12 18h.01M4 4h16v16H4V4Z',
  chat: 'M4 5h16v11H9l-5 4V5Z',
  fechar: 'M6 6l12 12M18 6 6 18',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  'seta-direita': 'M5 12h13M12.5 5.5 19 12l-6.5 6.5',
  sair: 'M15 4h4v16h-4M11 8l-4 4 4 4M7 12h10',
};

export interface PropsIcone extends Omit<SVGProps<SVGSVGElement>, 'children' | 'viewBox' | 'className'> {
  nome: NomeIcone;
  tamanho?: string;
  descricao?: string;
}

export function Icone({ nome, tamanho = '1.125rem', descricao, ...resto }: PropsIcone) {
  const informativo = descricao !== undefined && descricao.trim().length > 0;

  return (
    <svg
      {...resto}
      viewBox="0 0 24 24"
      width={tamanho}
      height={tamanho}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: '0 0 auto', ...resto.style }}
      {...(informativo ? { role: 'img', 'aria-label': descricao } : { 'aria-hidden': true, focusable: false })}
    >
      <path d={TRACADO[nome]} />
    </svg>
  );
}
```

---

## 5. Exemplos de uso

### Ícone decorativo acompanhado de texto

```tsx
<Icone nome="busca" />
<span>Busca</span>
```

Resultado esperado:

```html
<svg aria-hidden="true" focusable="false">
  <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4.2-4.2"></path>
</svg>
<span>Busca</span>
```

### Ícone informativo sem texto próximo

```tsx
<Icone nome="trilha" descricao="Progresso da Trilha" />
```

Resultado esperado:

```html
<svg role="img" aria-label="Progresso da Trilha">
  <path d="M9 4.5h11M9 12h11M9 19.5h11M4 4.5h.01M4 12h.01M4 19.5h.01"></path>
</svg>
```

### Alterar tamanho

```tsx
<Icone nome="seta-direita" tamanho="1rem" />
```

### Alterar cor pelo elemento pai

```tsx
<span style={{ color: 'var(--nuage-purple)' }}>
  <Icone nome="chat" />
</span>
```

Não definir uma cor fixa dentro do SVG. O uso de `currentColor` garante que o ícone permaneça no mesmo par de contraste do texto ou controle em que está inserido.

---

## 6. Onde os ícones React aparecem

### Barra lateral — `src/componentes/layout/BarraLateral.tsx`

```text
inicio       → /
trilha       → /trilha
triagem      → /triagem
perguntas    → Banco de Perguntas
busca        → Busca e Pesquisa prévia
glossario    → Glossário
referencias  → Referências
pendencias   → Pendências
```

### Indicadores da página inicial — `src/paginas/Inicio.tsx`

```text
trilha        → Conclusão da Trilha
check         → Módulos concluídos
pendencias    → Módulos restantes
seta-direita  → Próximo Módulo
```

### Chat — `src/componentes/layout/PainelChat.tsx`

```text
chat    → botão para abrir o painel
fechar  → botão para fechar o painel
```

### Outros usos

```text
seta-direita → blocos expansíveis e navegação entre seções
```

---

## 7. Ícones Lucide do protótipo estático

A implementação paralela em `Onboarding/` não usa `Icone.tsx`. Ela carrega Lucide por CDN:

```html
<script src="https://unpkg.com/lucide@latest"></script>
```

Os ícones são declarados assim:

```html
<i data-lucide="nome-do-icone"></i>
```

E inicializados com:

```js
lucide.createIcons();
```

### Nomes Lucide utilizados

```text
sparkles
home
compass
layers
book-open
award
arrow-right
chevron-right
clock
check-circle-2
external-link
receipt
```

### Uso dos ícones Lucide

| Ícone            | Uso                                      |
| ---------------- | ---------------------------------------- |
| `sparkles`       | Logo do NuageHub                         |
| `home`           | Página Inicial                           |
| `compass`        | Primeiros Passos                         |
| `layers`         | Plataformas                              |
| `book-open`      | Playbook                                 |
| `award`          | Badge de boas-vindas                     |
| `arrow-right`    | Ação principal do hero                   |
| `chevron-right`  | Acesso aos cards                         |
| `clock`          | Meta do checklist e Zoho em configuração |
| `check-circle-2` | Status dos itens do checklist            |
| `external-link`  | Links externos                           |
| `receipt`        | Formulário de nota fiscal                |

Total de nomes Lucide no protótipo: **12**.

---

## 8. Diferença entre os dois conjuntos

| SPA React                                       | Protótipo estático                                |
| ----------------------------------------------- | ------------------------------------------------- |
| SVGs próprios em `Icone.tsx`                    | Lucide via CDN                                    |
| `stroke="currentColor"`                         | SVG gerado por `lucide.createIcons()`             |
| Design System NuageIT                           | Visual escuro `NuageHub`                          |
| 12 ícones efetivamente usados                   | 12 nomes Lucide                                   |
| `sair` apenas no catálogo                       | Não possui esse catálogo fechado                  |
| Acessibilidade controlada pelo componente React | Acessibilidade depende do HTML gerado pelo Lucide |

Os conjuntos não devem ser misturados sem uma decisão explícita de unificação visual.
