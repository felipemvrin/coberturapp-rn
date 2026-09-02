import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Superficie elevada equivalente a un Card de Material 3. */
export function Card({ children, style, testID }: CardProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      style={StyleSheet.flatten([
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.outline,
          padding: theme.spacing.lg,
          shadowOpacity: theme.isDark ? 0 : 0.06,
        },
        style,
      ])}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
});
