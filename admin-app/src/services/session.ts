import { Href } from 'expo-router';

import { AuthUser } from '@/services/api';
import { storageGetItem, storageRemoveItem, storageSetItem } from '@/services/app-storage';

const SESSION_KEY = 'coffeeshop_session';

let currentUser: AuthUser | null = null;
let hydratePromise: Promise<AuthUser | null> | null = null;

export async function hydrateSession(): Promise<AuthUser | null> {
  if (hydratePromise) {
    return hydratePromise;
  }

  hydratePromise = (async () => {
    try {
      const raw = await storageGetItem(SESSION_KEY);
      if (!raw) {
        return null;
      }

      currentUser = JSON.parse(raw) as AuthUser;
      return currentUser;
    } catch {
      currentUser = null;
      return null;
    } finally {
      hydratePromise = null;
    }
  })();

  return hydratePromise;
}

export async function setCurrentUser(user: AuthUser) {
  currentUser = user;

  try {
    await storageSetItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // Session stays in memory for this app run even if disk persistence fails.
  }
}

export function getCurrentUser() {
  return currentUser;
}

export async function clearSession() {
  currentUser = null;

  try {
    await storageRemoveItem(SESSION_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

export async function clearCurrentUser() {
  await clearSession();
}

export function canAccess(permission: string) {
  if (!currentUser) {
    return false;
  }

  if (currentUser.role === 'Admin') {
    return true;
  }

  return currentUser.permissions[permission] === true;
}

export function homeRouteFor(user: AuthUser | null = currentUser): Href {
  if (!user) {
    return '/' as Href;
  }

  if (user.role === 'Thu ngân') {
    return '/cashier' as Href;
  }

  if (user.role === 'Phục vụ') {
    return '/staff' as Href;
  }

  return '/admin' as Href;
}
