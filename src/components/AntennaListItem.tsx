import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Antenna } from '../domain/entities';
import { formatDistance } from '../domain/signal';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface AntennaListItemProps {
  antenna: Antenna;
  onPress?: (antenna: Antenna) => void;
}

export function AntennaListItem({ antenna, onPress }: AntennaListItemProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      testID={`antenna-item-${antenna.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${antenna.name}, a ${formatDistance(antenna.distanceMeters)} hacia el ${antenna.direction}`}
      onPress={onPress ? () => onPress(antenna) : undefined}
      style={({ pressed }) => [
        styles.row,
        {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
          backgroundColor: pressed ? theme.colors.surfaceVariant : 'transparent',
        },
      ]}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: theme.colors.secondaryContainer,
            borderRadius: theme.radius.full,
          },
        ]}
      >
        <Text variant="labelLarge" style={{ color: theme.colors.onSecondaryContainer }}>
          {antenna.direction}
        </Text>
      </View>

      <View style={styles.info}>
        <Text variant="titleMedium" numberOfLines={1}>
          {antenna.name}
        </Text>
        <Text variant="bodyMedium" color="onSurfaceVariant">
          {antenna.carrier} · {antenna.technology}
        </Text>
      </View>

      <Text variant="labelLarge" color="primary">
        {formatDistance(antenna.distanceMeters)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
});
