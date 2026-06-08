import { Href } from 'expo-router';

import { AuthUser } from '@/services/api';

let currentUser: AuthUser | null = null;

export function setCurrentUser(user: AuthUser) {
  currentUser = user;
}

export function getCurrentUser() {
  return currentUser;
}

export function clearCurrentUser() {
  currentUser = null;
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
    return '/' as any;
  }

  if (user.role === 'Thu ngân') {
    return '/cashier' as any;
  }

  if (user.role === 'Phục vụ') {
    return '/staff' as any;
  }

  return '/admin' as any;
}
