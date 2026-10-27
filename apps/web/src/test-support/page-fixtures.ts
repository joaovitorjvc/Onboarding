import type { PageContent } from '@nuagehub/contracts';

export const pageFixture: PageContent = {
  slug: 'inicio',
  documentTitle: 'NuageHub - Portal de Onboarding',
  navLabel: 'Página Inicial',
  hero: {
    variant: 'home',
    badge: { icon: 'award', text: 'Boas-vindas ao time!' },
    title: [[{ text: 'Sua jornada de sucesso ' }], [{ text: 'começa aqui e agora.', strong: true }]],
    description: [{ text: 'Portal central de integração.' }],
    actions: [
      { label: 'Começar', to: '/primeiros-passos', icon: 'arrow-right', style: 'primary' },
      { label: 'Playbook', href: 'https://nuageit.com.br/', style: 'secondary' },
    ],
  },
  blocks: [
    {
      type: 'cards',
      cards: [
        {
          icon: 'compass',
          accent: 'blue',
          tag: 'Início rápido',
          title: 'Primeiros Passos',
          subtitle: 'Roteiro',
          description: [{ text: 'Conteúdo ', strong: true }, { text: 'guiado' }],
          action: { label: 'Acessar', to: '/primeiros-passos', style: 'card', icon: 'chevron-right' },
        },
      ],
    },
    {
      type: 'checklist',
      label: 'Cronograma',
      title: 'Checklist Inicial',
      meta: { icon: 'clock', text: 'Meta: 1ª Semana' },
      items: [{ id: 'setup', day: 'Dia 1', title: 'Setup', description: 'Configuração', defaultDone: true }],
    },
    {
      type: 'topic',
      number: '01',
      title: 'Tópico',
      subtopics: [
        {
          title: 'Subtópico',
          content: [
            { type: 'paragraph', text: [{ text: 'Parágrafo' }] },
            { type: 'bullets', items: [[{ text: 'Bullet', emphasis: true }]] },
            { type: 'steps', items: [[{ text: 'Step' }]] },
            {
              type: 'links',
              items: [
                { title: 'Link', description: 'Descrição', href: 'https://nuageit.com.br/' },
                { title: 'Indisponível', description: 'Em breve' },
              ],
            },
            { type: 'cadence', items: [{ day: 'Dia 1', action: 'Ação', detail: 'Detalhe' }] },
            { type: 'script', text: 'Script' },
            {
              type: 'actions',
              items: [{ label: 'Enviar', href: 'https://nuageit.com.br/', style: 'primary', icon: 'external-link' }],
            },
          ],
        },
      ],
    },
  ],
};

export const checklistItems = pageFixture.blocks.find((block) => block.type === 'checklist')!.items;
