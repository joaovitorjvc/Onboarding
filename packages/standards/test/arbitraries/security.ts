import fc from 'fast-check';

export interface BlockingExample {
  category: 'hardcoded-secret' | 'sql-injection' | 'command-injection' | 'dynamic-eval' | 'unsafe-html';
  extension: 'ts' | 'js' | 'py' | 'tsx';
  snippet: string;
}

const secret = ['AK', 'IA', '1234567890ABCDEF'].join('');
const evalCall = ['ev', 'al('].join('') + 'input)';
const functionCall = ['new Fun', 'ction('].join('') + 'input)';

export const blockingExamples: readonly BlockingExample[] = [
  { category: 'hardcoded-secret', extension: 'ts', snippet: `const token = '${secret}';` },
  {
    category: 'sql-injection',
    extension: 'ts',
    snippet: 'const query = ' + '`' + ['SEL', 'ECT'].join('') + ' * FROM users WHERE id = ' + '${' + 'userId}`;',
  },
  {
    category: 'command-injection',
    extension: 'ts',
    snippet: ['exec', 'Sync('].join('') + '`ls ' + '${' + 'directory}`);',
  },
  { category: 'dynamic-eval', extension: 'ts', snippet: `const result = ${evalCall};` },
  {
    category: 'unsafe-html',
    extension: 'tsx',
    snippet: 'return <div ' + 'dangerouslySetInner' + 'HTML={{ __html: html }}' + ' />;',
  },
  { category: 'dynamic-eval', extension: 'ts', snippet: `const result = ${functionCall};` },
];

export const blockingExampleArbitrary = fc.constantFrom(...blockingExamples);

export const safeSnippetArbitrary = fc.constantFrom(
  'const numberValue = 42;',
  'function greet(name: string) { return `Olá ${name}`; }',
  'print("conteúdo seguro")',
  'const parsed = JSON.parse(input);',
  'const message = "sem risco";',
);

export const safeCorpusArbitrary = fc.array(safeSnippetArbitrary, { minLength: 0, maxLength: 8 });

export const findingCategoryArbitrary = fc.constantFrom<
  'hardcoded-secret' | 'sql-injection' | 'command-injection' | 'dynamic-eval' | 'unsafe-html'
>(...blockingExamples.map((example) => example.category));
