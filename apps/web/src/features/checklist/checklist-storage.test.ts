import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CHECKLIST_KEY, effectiveState, readChecklist, writeChecklist } from './checklist-storage';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number {
    return this.values.size;
  }
  clear(): void {
    this.values.clear();
  }
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const items = [
  { id: 'setup', defaultDone: true },
  { id: 'plataformas', defaultDone: false },
  { id: 'playbook', defaultDone: false },
];

describe('armazenamento do checklist', () => {
  // Feature: legacy-migration, Property 4: Checklist persistido igual ao exibido
  it('preserva o estado exibido após qualquer sequência de ativações', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...items.map((item) => item.id)), { maxLength: 40 }), (sequence) => {
        const storage = new MemoryStorage();
        let state = effectiveState(items, readChecklist(storage));
        writeChecklist(storage, state);
        for (const id of sequence) {
          state = { ...state, [id]: !state[id] };
          expect(writeChecklist(storage, state)).toBe(true);
        }
        expect(readChecklist(storage)).toEqual(state);
        expect(effectiveState(items, readChecklist(storage))).toEqual(state);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: legacy-migration, Property 5: Leitura tolerante do checklist
  it('ignora JSON inválido e valores que não são booleanos', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.array(fc.anything()),
          fc.dictionary(fc.string(), fc.anything()),
        ),
        (value) => {
          const storage = new MemoryStorage();
          storage.setItem(CHECKLIST_KEY, typeof value === 'string' ? value : JSON.stringify(value));
          const state = effectiveState(items, readChecklist(storage));
          for (const item of items) expect(typeof state[item.id]).toBe('boolean');
        },
      ),
      { numRuns: 100 },
    );
    const unavailable: Storage = {
      getItem: () => {
        throw new Error('indisponível');
      },
      setItem: () => {
        throw new Error('indisponível');
      },
      length: 0,
      clear() {},
      key() {
        return null;
      },
      removeItem() {},
    };
    expect(() => readChecklist(unavailable)).not.toThrow();
    expect(effectiveState(items, readChecklist(unavailable))).toEqual({
      setup: true,
      plataformas: false,
      playbook: false,
    });
  });
});
