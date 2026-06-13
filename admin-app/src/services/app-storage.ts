import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memory = new Map<string, string>();

function isNativeMobile() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function readWebStorage(key: string): string | null {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeWebStorage(key: string, value: string) {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore quota / privacy mode errors.
  }
}

function deleteWebStorage(key: string) {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore cleanup failures.
  }
}

export async function storageGetItem(key: string): Promise<string | null> {
  const cached = memory.get(key);
  if (cached != null) {
    return cached;
  }

  if (isNativeMobile()) {
    try {
      const secure = await SecureStore.getItemAsync(key);
      if (secure != null) {
        memory.set(key, secure);
        return secure;
      }
    } catch {
      return null;
    }

    return null;
  }

  const webValue = readWebStorage(key);
  if (webValue != null) {
    memory.set(key, webValue);
    return webValue;
  }

  return null;
}

export async function storageSetItem(key: string, value: string): Promise<void> {
  memory.set(key, value);

  if (isNativeMobile()) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Keep in-memory session for the current app run.
    }
    return;
  }

  writeWebStorage(key, value);
}

export async function storageRemoveItem(key: string): Promise<void> {
  memory.delete(key);

  if (isNativeMobile()) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore cleanup failures.
    }
    return;
  }

  deleteWebStorage(key);
}
