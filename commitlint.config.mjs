export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['web', 'api', 'ai', 'contracts', 'standards', 'config', 'ci', 'docs', 'deps']],
    'scope-empty': [2, 'never'],
  },
  helpUrl:
    'Formato obrigatório: tipo(escopo): descrição. Escopos aceitos: web, api, ai, contracts, standards, config, ci, docs e deps.',
};
