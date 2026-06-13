import { useCallback, useEffect, useState } from 'react';

import { storageGetItem, storageRemoveItem, storageSetItem } from '@/services/app-storage';

const DRAFT_PREFIX = 'coffeeshop_draft_';

export function useFormDraft<T extends Record<string, unknown>>(key: string, initial: T) {
  const [values, setValuesState] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const storageKey = `${DRAFT_PREFIX}${key}`;

  useEffect(() => {
    let active = true;

    storageGetItem(storageKey)
      .then((raw) => {
        if (!active || !raw) {
          return;
        }

        try {
          setValuesState({ ...initial, ...JSON.parse(raw) });
        } catch {
          // Ignore invalid draft payloads.
        }
      })
      .finally(() => {
        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, [storageKey]);

  const persist = useCallback(
    (next: T) => {
      setValuesState(next);
      storageSetItem(storageKey, JSON.stringify(next)).catch(() => undefined);
    },
    [storageKey]
  );

  const setField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => {
        const next = { ...prev, [field]: value };
        storageSetItem(storageKey, JSON.stringify(next)).catch(() => undefined);
        return next;
      });
    },
    [storageKey]
  );

  const setValues = useCallback(
    (patch: Partial<T> | ((prev: T) => T)) => {
      setValuesState((prev) => {
        const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
        storageSetItem(storageKey, JSON.stringify(next)).catch(() => undefined);
        return next;
      });
    },
    [storageKey]
  );

  const clearDraft = useCallback(async () => {
    await storageRemoveItem(storageKey).catch(() => undefined);
    setValuesState(initial);
  }, [initial, storageKey]);

  return { values, setValues, setField, persist, clearDraft, ready };
}
