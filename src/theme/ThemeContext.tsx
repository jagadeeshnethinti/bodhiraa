/**
 * Bodhira — active brand theme context.
 *
 * Derives the brand palette from the signed-in user's school (or the default
 * Bodhira gold for personal/B2C accounts) and exposes it via `useTheme()`. Must
 * sit inside <AuthProvider> so it can react to login / logout / school changes.
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { BrandTheme, BODHIRA, resolveTheme } from './themes';

const ThemeContext = createContext<BrandTheme>(BODHIRA);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const theme = useMemo(() => resolveTheme(user?.school ?? null), [user?.school]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export function useTheme(): BrandTheme {
  return useContext(ThemeContext);
}
