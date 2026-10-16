import { useCallback, useState } from 'react';
import type { ChecklistItem } from '@nuagehub/contracts';
import { effectiveState, readChecklist, writeChecklist, type ChecklistState } from './checklist-storage';

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function useChecklist(items: ChecklistItem[]): { done: ChecklistState; toggle: (id: string) => void } {
  const [done, setDone] = useState(() => effectiveState(items, readChecklist(getStorage())));
  const toggle = useCallback((id: string) => {
    setDone((current) => {
      const next = { ...current, [id]: !current[id] };
      writeChecklist(getStorage(), next);
      return next;
    });
  }, []);
  return { done, toggle };
}
