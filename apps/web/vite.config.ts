import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { pluginCorpusChat } from './scripts/plugin-corpus-chat.ts';
import { pluginValidarAmbiente } from './scripts/plugin-validar-ambiente.ts';

export default defineConfig({
  plugins: [react(), pluginValidarAmbiente(), pluginCorpusChat()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    // Evita timeout de inicialização dos workers (jsdom por arquivo) em máquinas Windows com poucos recursos.
    maxWorkers: 2,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      include: ['src/**/*.{ts,tsx}'],
    },
  },
});
