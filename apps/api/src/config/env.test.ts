import fc from 'fast-check';
import { loadEnv } from './env';

const validEnvironment = {
  NODE_ENV: 'test',
  API_PORT: '3000',
  API_CORS_ORIGIN: 'http://localhost:5173',
  LOG_LEVEL: 'info',
};

const environmentVariables = ['NODE_ENV', 'API_PORT', 'API_CORS_ORIGIN', 'LOG_LEVEL'] as const;

// Feature: project-standards, Property 19: Validação de variáveis de ambiente
it('cita todas as variáveis removidas ou inválidas', () => {
  fc.assert(
    fc.property(
      fc.uniqueArray(fc.constantFrom(...environmentVariables), { minLength: 1, maxLength: 4 }),
      (invalidVariables) => {
        const source = { ...validEnvironment };
        for (const variable of invalidVariables) delete source[variable];
        expect(() => loadEnv(source)).toThrow(new RegExp(invalidVariables.join('|')));
        const error = (() => {
          try {
            loadEnv(source);
            return '';
          } catch (caught) {
            return caught instanceof Error ? caught.message : String(caught);
          }
        })();
        for (const variable of invalidVariables) expect(error).toContain(variable);
      },
    ),
    { numRuns: 100 },
  );
});

describe('loadEnv', () => {
  it('retorna configuração tipada para ambiente válido e usa max-age padrão', () => {
    expect(loadEnv(validEnvironment)).toEqual({
      NODE_ENV: 'test',
      API_PORT: 3000,
      API_CORS_ORIGIN: 'http://localhost:5173',
      LOG_LEVEL: 'info',
      CONTENT_CACHE_MAX_AGE_SECONDS: 300,
    });
  });

  it('cita uma variável com valor inválido', () => {
    expect(() => loadEnv({ ...validEnvironment, API_PORT: '65536' })).toThrow('API_PORT');
  });

  it('rejeita max-age fora do intervalo permitido', () => {
    expect(() => loadEnv({ ...validEnvironment, CONTENT_CACHE_MAX_AGE_SECONDS: '86401' })).toThrow(
      'CONTENT_CACHE_MAX_AGE_SECONDS',
    );
  });
});
