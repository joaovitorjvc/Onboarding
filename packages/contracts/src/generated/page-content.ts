/* eslint-disable */
/** Gerado por packages/contracts/scripts/generate.mts. */

export type PageSlug = 'inicio' | 'primeiros-passos' | 'plataformas' | 'playbook';
export type Text = string;
export type IconName =
  | 'arrow-right'
  | 'award'
  | 'book-open'
  | 'chevron-right'
  | 'circle-check'
  | 'clock'
  | 'compass'
  | 'external-link'
  | 'house'
  | 'layers'
  | 'receipt'
  | 'sparkles';
/**
 * @minItems 1
 */
export type RichText = [Span, ...Span[]];
export type Href = string;
export type Route = '/' | '/primeiros-passos' | '/plataformas' | '/playbook';
export type Block =
  | {
      type: 'cards';
      /**
       * @minItems 1
       */
      cards: [Card, ...Card[]];
    }
  | {
      type: 'checklist';
      label: Text;
      title: Text;
      meta: {
        icon: IconName;
        text: Text;
      };
      /**
       * @minItems 1
       */
      items: [ChecklistItem, ...ChecklistItem[]];
    }
  | {
      type: 'topic';
      number: string;
      title: Text;
      /**
       * @minItems 1
       */
      subtopics: [Subtopic, ...Subtopic[]];
    };
export type SubtopicItem =
  | {
      type: 'paragraph';
      text: RichText;
    }
  | {
      type: 'bullets' | 'steps';
      /**
       * @minItems 1
       */
      items: [RichText, ...RichText[]];
    }
  | {
      type: 'links';
      /**
       * @minItems 1
       */
      items: [LinkItem, ...LinkItem[]];
    }
  | {
      type: 'cadence';
      /**
       * @minItems 1
       */
      items: [CadenceItem, ...CadenceItem[]];
    }
  | {
      type: 'script';
      text: Text;
    }
  | {
      type: 'actions';
      /**
       * @minItems 1
       */
      items: [Action, ...Action[]];
    };

/**
 * Conteudo_de_Pagina do NuageHub (Spec legacy-migration, Req. 3). Texto rico nunca contém HTML.
 */
export interface PageContent {
  slug: PageSlug;
  documentTitle: Text;
  navLabel: Text;
  hero: Hero;
  blocks: Block[];
}
export interface Hero {
  variant: 'home' | 'page';
  badge?: {
    icon?: IconName;
    text: Text;
  };
  eyebrow?: Text;
  /**
   * @minItems 1
   */
  title: [RichText, ...RichText[]];
  description: RichText;
  actions?: Action[];
}
export interface Span {
  text: Text;
  strong?: boolean;
  emphasis?: boolean;
  href?: Href;
}
/**
 * Exatamente um destino: rota interna (to) ou link externo (href).
 */
export interface Action {
  label: Text;
  to?: Route;
  href?: Href;
  icon?: IconName;
  style: 'primary' | 'secondary' | 'card';
}
export interface Card {
  icon: IconName;
  accent: 'blue' | 'purple' | 'teal';
  tag: Text;
  title: Text;
  subtitle: Text;
  description: RichText;
  action: Action;
}
export interface ChecklistItem {
  id: string;
  day: Text;
  title: Text;
  description: Text;
  defaultDone: boolean;
}
export interface Subtopic {
  title: Text;
  /**
   * @minItems 1
   */
  content: [SubtopicItem, ...SubtopicItem[]];
}
export interface LinkItem {
  title: Text;
  description: Text;
  href?: Href;
}
export interface CadenceItem {
  day: Text;
  action: Text;
  detail: Text;
}
