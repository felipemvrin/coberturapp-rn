import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '../components';
import { useTheme } from '../theme';

/**
 * Placeholder del mapa interactivo.
 * TODO: instalar `react-native-maps` y renderizar los marcadores de
 * `Antenna.position` centrados en la ubicación de `expo-location`.
 */
export function MapScreen(): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="titleLarge" color="onBackground">
        Mapa de cobertura
      </Text>
      <Text color="onSurfaceVariant" style={{ marginTop: theme.spacing.sm }}>
        Próximamente: mapa interactivo con antenas cercanas.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
