import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  testID,
}: PrimaryButtonProps): React.JSX.Element {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.full,
          paddingVertical: theme.spacing.md + 2,
          paddingHorizontal: theme.spacing.xl,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator testID="primary-button-spinner" color={theme.colors.onPrimary} />
        ) : null}
        <Text variant="labelLarge" color="onPrimary">
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
