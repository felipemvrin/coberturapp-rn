import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export interface DirectionArrowProps {
  /** Grados a rotar: 0 apunta al frente del dispositivo. */
  rotationDegrees: number;
  /** Punto cardinal, usado como respaldo cuando no hay brújula. */
  fallbackDirection: string;
  /** `false` cuando no hay magnetómetro: se muestra el cardinal en su lugar. */
  live: boolean;
  size?: number;
}

export function DirectionArrow({
  rotationDegrees,
  fallbackDirection,
  live,
  size = 56,
}: DirectionArrowProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      testID="direction-arrow"
      accessibilityRole="image"
      accessibilityLabel={
        live
          ? `Antena a ${Math.round(rotationDegrees)} grados`
          : `Antena hacia el ${fallbackDirection}`
      }
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primaryContainer,
        },
      ]}
    >
      {live ? (
        <View
          testID="direction-arrow-needle"
          style={[styles.needle, { transform: [{ rotate: `${rotationDegrees}deg` }] }]}
        >
          <View style={[styles.triangle, { borderBottomColor: theme.colors.onPrimaryContainer }]} />
        </View>
      ) : (
        <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
          {fallbackDirection}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  needle: { alignItems: 'center', justifyContent: 'center' },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
