import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { ColorScheme, darkColors, lightColors } from './colors';
import { radius, spacing, typography } from './tokens';

export interface Theme {
  readonly colors: ColorScheme;
  readonly spacing: typeof spacing;
  readonly radius: typeof radius;
  readonly typography: typeof typography;
  readonly isDark: boolean;
}

function buildTheme(isDark: boolean): Theme {
  return { colors: isDark ? darkColors : lightColors, spacing, radius, typography, isDark };
}

const ThemeContext = createContext<Theme>(buildTheme(false));

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Fuerza un esquema concreto; útil en tests y en un futuro selector manual. */
  forceScheme?: 'light' | 'dark';
}

export function ThemeProvider({ children, forceScheme }: ThemeProviderProps): React.JSX.Element {
  const systemScheme = useColorScheme();
  const isDark = forceScheme ? forceScheme === 'dark' : systemScheme === 'dark';
  const theme = useMemo(() => buildTheme(isDark), [isDark]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
