import fc from 'fast-check';

export const legacyPathArbitrary = fc.constantFrom(
  'index.html',
  'primeiros-passos.html',
  'plataformas.html',
  'playbook.html',
  'css/styles.css',
  'js/main.js',
);

export const stackPathArbitrary = fc.oneof(
  fc.constantFrom('apps/web/src/app.tsx', 'apps/web/package.json'),
  fc.constantFrom('apps/api/src/main.ts', 'apps/api/package.json'),
  fc.constantFrom('packages/standards/src/core/types.ts', 'packages/config/tsconfig.base.json'),
  fc.constantFrom('packages/contracts/src/error-format.ts', 'packages/contracts/python/x.py'),
  fc.constantFrom('docs/README.md', '.kiro/steering/always/rules.md'),
  fc.stringMatching(/^services\/ai\/[a-z][a-z0-9-]*\/src\/[a-z0-9_-]+\.py$/),
);

export const changedPathsArbitrary = fc.array(fc.oneof(legacyPathArbitrary, stackPathArbitrary), {
  minLength: 0,
  maxLength: 20,
});
