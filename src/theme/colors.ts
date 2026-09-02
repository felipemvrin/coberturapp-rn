/**
 * Tokens de color inspirados en Material 3 (roles semánticos en vez de
 * colores sueltos). Cambiar la paleta aquí re-tematiza toda la app.
 */

export interface ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  error: string;
  warning: string;
  success: string;
}

export const lightColors: ColorScheme = {
  primary: '#2563EB',
  onPrimary: '#FFFFFF',
  primaryContainer: '#DBE7FF',
  onPrimaryContainer: '#0B2C6B',
  secondaryContainer: '#E3E8F2',
  onSecondaryContainer: '#3A4256',
  background: '#F7F9FC',
  onBackground: '#131A24',
  surface: '#FFFFFF',
  onSurface: '#131A24',
  surfaceVariant: '#EEF1F6',
  onSurfaceVariant: '#5A6373',
  outline: '#C6CCD8',
  error: '#D92D20',
  warning: '#F79009',
  success: '#12B76A',
};

export const darkColors: ColorScheme = {
  primary: '#93B4FF',
  onPrimary: '#0B2C6B',
  primaryContainer: '#1D3B7A',
  onPrimaryContainer: '#DBE7FF',
  secondaryContainer: '#2A3140',
  onSecondaryContainer: '#D3DAE8',
  background: '#0F141B',
  onBackground: '#E6EAF2',
  surface: '#161C25',
  onSurface: '#E6EAF2',
  surfaceVariant: '#1E2632',
  onSurfaceVariant: '#A3ACBC',
  outline: '#37404F',
  error: '#FF6B60',
  warning: '#FDB022',
  success: '#3ED598',
};
