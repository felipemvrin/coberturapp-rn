import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { UserLocationStatus } from '../hooks/useUserLocation';
import { useTheme } from '../theme';
import { Text } from './Text';

const MESSAGE: Partial<Record<UserLocationStatus, string>> = {
  denied: 'Sin acceso a tu ubicación: mostramos distancias aproximadas.',
  unavailable: 'No pudimos obtener tu ubicación: mostramos distancias aproximadas.',
};

export interface LocationNoticeProps {
  status: UserLocationStatus;
  onRetry: () => void;
}

export function LocationNotice({ status, onRetry }: LocationNoticeProps): React.JSX.Element | null {
  const theme = useTheme();
  const message = MESSAGE[status];

  if (!message) return null;

  return (
    <View
      testID="location-notice"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.secondaryContainer,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <Text variant="bodyMedium" style={{ color: theme.colors.onSecondaryContainer, flex: 1 }}>
        {message}
      </Text>
      <Pressable testID="location-retry-button" accessibilityRole="button" onPress={onRetry}>
        <Text variant="labelLarge" color="primary">
          Reintentar
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
});
