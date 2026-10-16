import type { ChecklistItem } from '@nuagehub/contracts';

export const CHECKLIST_KEY = 'nuagehub-checklist';
export type ChecklistState = Record<string, boolean>;

export function readChecklist(storage: Storage | null): ChecklistState {
  if (!storage) return {};
  try {
    const parsed: unknown = JSON.parse(storage.getItem(CHECKLIST_KEY) ?? '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === 'boolean'));
  } catch {
    return {};
  }
}

export function writeChecklist(storage: Storage | null, state: ChecklistState): boolean {
  if (!storage) return false;
  try {
    storage.setItem(CHECKLIST_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function effectiveState(
  items: Pick<ChecklistItem, 'id' | 'defaultDone'>[],
  stored: ChecklistState,
): ChecklistState {
  return Object.fromEntries(
    items.map((item) => {
      const storedValue = stored[item.id];
      return [item.id, typeof storedValue === 'boolean' ? storedValue : item.defaultDone];
    }),
  ) as ChecklistState;
}
