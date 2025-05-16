"use client";

import type { User } from '@/types';
import { MOCK_FACULTY } from '@/lib/mock-data';

const AUTH_KEY = 'attendvisor_auth_user';

export const login = (email: string, password_input: string): User | null => {
  const faculty = MOCK_FACULTY.find(f => f.email === email && f.password === password_input);
  if (faculty) {
    const user: User = { id: faculty.id, email: faculty.email, name: faculty.name };
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
    return user;
  }
  return null;
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem(AUTH_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
