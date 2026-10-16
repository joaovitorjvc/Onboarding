import fc from 'fast-check';
import type {
  Action,
  Block,
  Card,
  ChecklistItem,
  Hero,
  IconName,
  PageContent,
  RichText,
  Route,
} from '../generated/page-content';
import { ICON_NAMES, ROUTES } from '../page-content';

const nonEmpty = <T>(arbitrary: fc.Arbitrary<T>): fc.Arbitrary<[T, ...T[]]> =>
  fc.array(arbitrary, { minLength: 1 }).map((items) => [items[0]!, ...items.slice(1)] as [T, ...T[]]);

const textArbitrary: fc.Arbitrary<string> = fc.oneof(
  fc.constantFrom('Ação com acentos: integração, início e prospecção.'),
  fc.constantFrom('<script>alert("conteúdo")</script>'),
  fc.string({ minLength: 1, maxLength: 80 }),
);

const hrefArbitrary: fc.Arbitrary<string> = fc.constantFrom(
  'https://nuagehub.example.com/recursos',
  'https://exemplo.com/ação?origem=onboarding',
  'https://docs.example.com/<script>',
);

const iconArbitrary: fc.Arbitrary<IconName> = fc.constantFrom(...ICON_NAMES);
const routeArbitrary: fc.Arbitrary<Route> = fc.constantFrom(...ROUTES);
const styleArbitrary: fc.Arbitrary<Action['style']> = fc.constantFrom('primary', 'secondary', 'card');

const spanArbitrary = fc.oneof(
  fc.record({
    text: textArbitrary,
    strong: fc.boolean(),
    emphasis: fc.boolean(),
  }),
  fc.record({
    text: textArbitrary,
    strong: fc.boolean(),
    emphasis: fc.boolean(),
    href: hrefArbitrary,
  }),
);
const richTextArbitrary: fc.Arbitrary<RichText> = nonEmpty(spanArbitrary);

const internalActionArbitrary: fc.Arbitrary<Action> = fc.record({
  label: textArbitrary,
  to: routeArbitrary,
  icon: iconArbitrary,
  style: styleArbitrary,
});
const externalActionArbitrary: fc.Arbitrary<Action> = fc.record({
  label: textArbitrary,
  href: hrefArbitrary,
  icon: iconArbitrary,
  style: styleArbitrary,
});
const actionArbitrary: fc.Arbitrary<Action> = fc.oneof(internalActionArbitrary, externalActionArbitrary);

const linkItemArbitrary = fc.oneof(
  fc.record({
    title: textArbitrary,
    description: textArbitrary,
  }),
  fc.record({
    title: textArbitrary,
    description: textArbitrary,
    href: hrefArbitrary,
  }),
);

const checklistItemArbitrary = (id: string): fc.Arbitrary<ChecklistItem> =>
  fc.record({
    id: fc.constant(id),
    day: textArbitrary,
    title: textArbitrary,
    description: textArbitrary,
    defaultDone: fc.boolean(),
  });

const cardArbitrary: fc.Arbitrary<Card> = fc.record({
  icon: iconArbitrary,
  accent: fc.constantFrom('blue', 'purple', 'teal'),
  tag: textArbitrary,
  title: textArbitrary,
  subtitle: textArbitrary,
  description: richTextArbitrary,
  action: actionArbitrary,
});

const heroArbitrary: fc.Arbitrary<Hero> = fc.record({
  variant: fc.constantFrom('home', 'page'),
  badge: fc.record({ icon: iconArbitrary, text: textArbitrary }),
  eyebrow: textArbitrary,
  title: nonEmpty(richTextArbitrary),
  description: richTextArbitrary,
  actions: fc.tuple(internalActionArbitrary, externalActionArbitrary),
});

const blocksArbitrary: fc.Arbitrary<Block[]> = fc
  .tuple(
    fc.record({ type: fc.constant('cards' as const), cards: nonEmpty(cardArbitrary) }),
    fc.record({
      type: fc.constant('checklist' as const),
      label: textArbitrary,
      title: textArbitrary,
      meta: fc.record({ icon: iconArbitrary, text: textArbitrary }),
      items: fc.tuple(checklistItemArbitrary('setup'), checklistItemArbitrary('plataformas')),
    }),
    fc.record({
      type: fc.constant('topic' as const),
      number: fc.stringMatching(/^[0-9]{2}$/u),
      title: textArbitrary,
      subtopics: fc.tuple(
        fc.record({
          title: textArbitrary,
          content: fc.tuple(
            fc.record({ type: fc.constant('paragraph' as const), text: richTextArbitrary }),
            fc.record({ type: fc.constant('bullets' as const), items: nonEmpty(richTextArbitrary) }),
            fc.record({ type: fc.constant('steps' as const), items: nonEmpty(richTextArbitrary) }),
            fc.record({ type: fc.constant('links' as const), items: nonEmpty(linkItemArbitrary) }),
            fc.record({
              type: fc.constant('cadence' as const),
              items: nonEmpty(
                fc.record({
                  day: textArbitrary,
                  action: textArbitrary,
                  detail: textArbitrary,
                }),
              ),
            }),
            fc.record({ type: fc.constant('script' as const), text: textArbitrary }),
            fc.record({ type: fc.constant('actions' as const), items: nonEmpty(actionArbitrary) }),
          ),
        }),
      ),
    }),
  )
  .map(([cards, checklist, topic]) => [cards, checklist, topic]);

/** Gerador de Conteudo_de_Pagina válido, cobrindo todos os blocos do schema. */
export const pageContentArbitrary: fc.Arbitrary<PageContent> = fc.record({
  slug: fc.constantFrom('inicio', 'primeiros-passos', 'plataformas', 'playbook'),
  documentTitle: textArbitrary,
  navLabel: textArbitrary,
  hero: heroArbitrary,
  blocks: blocksArbitrary,
});

type MutationName =
  | 'remove-required-key'
  | 'add-extra-key'
  | 'change-type'
  | 'empty-text'
  | 'unknown-icon'
  | 'http-href'
  | 'both-action-destinations'
  | 'empty-min-items-array';

const mutationNameArbitrary: fc.Arbitrary<MutationName> = fc.constantFrom(
  'remove-required-key',
  'add-extra-key',
  'change-type',
  'empty-text',
  'unknown-icon',
  'http-href',
  'both-action-destinations',
  'empty-min-items-array',
);

function clonePage(page: PageContent): Record<string, unknown> {
  return JSON.parse(JSON.stringify(page)) as Record<string, unknown>;
}

/** Aplica uma violação específica do schema a uma página válida. */
export function mutatePageContent(page: PageContent, mutation: MutationName): unknown {
  const mutated = clonePage(page);
  const hero = mutated.hero as Record<string, unknown>;
  const blocks = mutated.blocks as Array<Record<string, unknown>>;

  switch (mutation) {
    case 'remove-required-key':
      delete mutated.documentTitle;
      break;
    case 'add-extra-key':
      mutated.extra = true;
      break;
    case 'change-type':
      blocks[0]!.type = 'unknown';
      break;
    case 'empty-text':
      (hero.description as Array<Record<string, unknown>>)[0]!.text = '';
      break;
    case 'unknown-icon':
      (hero.badge as Record<string, unknown>).icon = 'unknown-icon';
      break;
    case 'http-href':
      (hero.description as Array<Record<string, unknown>>)[0]!.href = 'http://example.com/recurso';
      break;
    case 'both-action-destinations': {
      const actions = hero.actions as Array<Record<string, unknown>>;
      actions[0] = { ...actions[0], to: '/', href: 'https://example.com/recurso' };
      break;
    }
    case 'empty-min-items-array':
      hero.title = [];
      break;
  }

  return mutated;
}

/** Gerador de valores inválidos por cada mutação coberta pela tarefa 1.2. */
export const pageContentMutationArbitrary: fc.Arbitrary<unknown> = fc
  .tuple(pageContentArbitrary, mutationNameArbitrary)
  .map(([page, mutation]) => mutatePageContent(page, mutation));
