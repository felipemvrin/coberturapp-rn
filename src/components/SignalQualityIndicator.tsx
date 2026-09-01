import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { SignalLevel, SignalMeasurement } from '../domain/entities';
import { useTheme } from '../theme';
import { Text } from './Text';

const LEVEL_LABEL: Record<SignalLevel, string> = {
  none: 'Sin señal',
  poor: 'Señal débil',
  fair: 'Señal regular',
  good: 'Buena señal',
  excellent: 'Señal excelente',
};

const TOTAL_BARS = 4;

export interface SignalQualityIndicatorProps {
  signal: SignalMeasurement;
}

export function SignalQualityIndicator({ signal }: SignalQualityIndicatorProps): React.JSX.Element {
  const theme = useTheme();
  const accent =
    signal.bars >= 3
      ? theme.colors.success
      : signal.bars === 2
        ? theme.colors.warning
        : theme.colors.error;

  return (
    <View
      testID="signal-quality-indicator"
      accessibilityRole="image"
      accessibilityLabel={`${LEVEL_LABEL[signal.level]}, ${signal.bars} de ${TOTAL_BARS} barras`}
    >
      <View style={[styles.bars, { gap: theme.spacing.sm }]}>
        {Array.from({ length: TOTAL_BARS }, (_, index) => (
          <View
            key={index}
            testID={`signal-bar-${index}`}
            style={{
              width: 14,
              height: 16 + index * 12,
              borderRadius: theme.radius.sm,
              backgroundColor: index < signal.bars ? accent : theme.colors.surfaceVariant,
            }}
          />
        ))}
      </View>

      <Text variant="titleMedium" style={{ marginTop: theme.spacing.md }}>
        {LEVEL_LABEL[signal.level]}
      </Text>
      <Text variant="bodyMedium" color="onSurfaceVariant">
        {signal.dbm} dBm · {signal.bars}/{TOTAL_BARS} barras
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'flex-end' },
});
