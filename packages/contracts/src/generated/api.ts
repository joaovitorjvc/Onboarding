export interface paths {
  '/api/v1/content/pages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista as páginas de conteúdo na ordem de navegação. */
    get: operations['ContentController_list'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/content/pages/{slug}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Obtém uma página de conteúdo pelo slug. */
    get: operations['ContentController_get'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/health': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Verifica a disponibilidade da API. */
    get: operations['HealthController_getHealth'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Exatamente um destino: rota interna (to) ou link externo (href). */
    Action: {
      href?: components['schemas']['Href'];
      icon?: components['schemas']['IconName'];
      label: components['schemas']['Text'];
      /** @enum {string} */
      style: 'primary' | 'secondary' | 'card';
      to?: components['schemas']['Route'];
    };
    Block:
      | {
          cards: components['schemas']['Card'][];
          /** @constant */
          type: 'cards';
        }
      | {
          items: components['schemas']['ChecklistItem'][];
          label: components['schemas']['Text'];
          meta: {
            icon: components['schemas']['IconName'];
            text: components['schemas']['Text'];
          };
          title: components['schemas']['Text'];
          /** @constant */
          type: 'checklist';
        }
      | {
          number: string;
          subtopics: components['schemas']['Subtopic'][];
          title: components['schemas']['Text'];
          /** @constant */
          type: 'topic';
        };
    CadenceItem: {
      action: components['schemas']['Text'];
      day: components['schemas']['Text'];
      detail: components['schemas']['Text'];
    };
    Card: {
      /** @enum {string} */
      accent: 'blue' | 'purple' | 'teal';
      action: components['schemas']['Action'];
      description: components['schemas']['RichText'];
      icon: components['schemas']['IconName'];
      subtitle: components['schemas']['Text'];
      tag: components['schemas']['Text'];
      title: components['schemas']['Text'];
    };
    ChecklistItem: {
      day: components['schemas']['Text'];
      defaultDone: boolean;
      description: components['schemas']['Text'];
      id: string;
      title: components['schemas']['Text'];
    };
    /**
     * ErrorFormat
     * @description Formato_de_Erro padronizado do NuageHub (Req. 13.2). Definição única.
     */
    ErrorFormat: {
      /** @description Código estável do erro. */
      code: string;
      /**
       * Format: uuid
       * @description Identificador de correlação (x-correlation-id).
       */
      correlationId: string;
      /** @description Detalhes por campo (erros de validação). */
      details?: {
        field: string;
        issue: string;
      }[];
      /** @description Mensagem em pt-BR, sem stack trace. */
      message: string;
      /** @description Status HTTP. */
      status: number;
    };
    HealthResponseDto: {
      /**
       * @description Estado operacional da API.
       * @example ok
       * @enum {string}
       */
      status: 'ok';
    };
    Hero: {
      actions?: components['schemas']['Action'][];
      badge?: {
        icon?: components['schemas']['IconName'];
        text: components['schemas']['Text'];
      };
      description: components['schemas']['RichText'];
      eyebrow?: components['schemas']['Text'];
      title: components['schemas']['RichText'][];
      /** @enum {string} */
      variant: 'home' | 'page';
    };
    Href: string;
    /** @enum {string} */
    IconName:
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
    LinkItem: {
      description: components['schemas']['Text'];
      href?: components['schemas']['Href'];
      title: components['schemas']['Text'];
    };
    /**
     * PageContent
     * @description Conteudo_de_Pagina do NuageHub (Spec legacy-migration, Req. 3). Texto rico nunca contém HTML.
     */
    PageContent: {
      blocks: components['schemas']['Block'][];
      documentTitle: components['schemas']['Text'];
      hero: components['schemas']['Hero'];
      navLabel: components['schemas']['Text'];
      slug: components['schemas']['PageSlug'];
    };
    /** @enum {string} */
    PageSlug: 'inicio' | 'primeiros-passos' | 'plataformas' | 'playbook';
    RichText: components['schemas']['Span'][];
    /** @enum {string} */
    Route: '/' | '/primeiros-passos' | '/plataformas' | '/playbook';
    Span: {
      emphasis?: boolean;
      href?: components['schemas']['Href'];
      strong?: boolean;
      text: components['schemas']['Text'];
    };
    Subtopic: {
      content: components['schemas']['SubtopicItem'][];
      title: components['schemas']['Text'];
    };
    SubtopicItem:
      | {
          text: components['schemas']['RichText'];
          /** @constant */
          type: 'paragraph';
        }
      | {
          items: components['schemas']['RichText'][];
          /** @enum {unknown} */
          type: 'bullets' | 'steps';
        }
      | {
          items: components['schemas']['LinkItem'][];
          /** @constant */
          type: 'links';
        }
      | {
          items: components['schemas']['CadenceItem'][];
          /** @constant */
          type: 'cadence';
        }
      | {
          text: components['schemas']['Text'];
          /** @constant */
          type: 'script';
        }
      | {
          items: components['schemas']['Action'][];
          /** @constant */
          type: 'actions';
        };
    Text: string;
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  ContentController_list: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            documentTitle: string;
            navLabel: string;
            /** @enum {string} */
            slug: 'inicio' | 'primeiros-passos' | 'plataformas' | 'playbook';
          }[];
        };
      };
    };
  };
  ContentController_get: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PageContent'];
        };
      };
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorFormat'];
        };
      };
    };
  };
  HealthController_getHealth: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['HealthResponseDto'];
        };
      };
    };
  };
}
