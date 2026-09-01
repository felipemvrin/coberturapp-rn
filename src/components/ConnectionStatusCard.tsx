import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { ConnectionStatus } from '../domain/entities';
import { useTheme } from '../theme';
import { Card } from './Card';
import { Text } from './Text';

export interface ConnectionStatusCardProps {
  connection: ConnectionStatus;
  children?: React.ReactNode;
}

export function ConnectionStatusCard({
  connection,
  children,
}: ConnectionStatusCardProps): React.JSX.Element {
  const theme = useTheme();
  const online = connection.technology !== 'NO_SERVICE';

  return (
    <Card testID="connection-status-card">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="labelSmall" color="onSurfaceVariant">
            ESTADO DE CONEXIÓN
          </Text>
          <Text variant="displaySmall" style={{ marginTop: theme.spacing.xs }}>
            {connection.carrier}
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: online ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
              borderRadius: theme.radius.full,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xs,
            },
          ]}
        >
          <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
            {online ? connection.technology : 'Sin servicio'}
          </Text>
        </View>
      </View>

      {connection.isRoaming ? (
        <Text variant="bodyMedium" color="onSurfaceVariant" style={{ marginTop: theme.spacing.xs }}>
          En roaming
        </Text>
      ) : null}

      {children ? <View style={{ marginTop: theme.spacing.lg }}>{children}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerText: { flexShrink: 1 },
  badge: { alignSelf: 'flex-start' },
});
