import React from 'react';
import { StyleSheet, Text as RNText, TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../theme';
import type { TypographyVariant } from '../theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  /** Rol de color del tema; por defecto hereda el color del contenido de fondo. */
  color?: 'onSurface' | 'onSurfaceVariant' | 'onBackground' | 'primary' | 'error' | 'onPrimary';
}

export function Text({
  variant = 'bodyMedium',
  color = 'onSurface',
  style,
  ...rest
}: TextProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <RNText
      style={StyleSheet.flatten([theme.typography[variant], { color: theme.colors[color] }, style])}
      {...rest}
    />
  );
}
