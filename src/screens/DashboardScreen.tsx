import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AntennaListItem,
  Card,
  ConnectionStatusCard,
  PrimaryButton,
  SignalQualityIndicator,
  Text,
} from '../components';
import type { Antenna } from '../domain/entities';
import { useCoverageDashboard } from '../hooks';
import { useTheme } from '../theme';

export function DashboardScreen(): React.JSX.Element {
  const theme = useTheme();
  const {
    snapshot,
    loading,
    refreshing,
    searchingBestSignal,
    bestSignal,
    error,
    refresh,
    findBestSignal,
  } = useCoverageDashboard();

  const renderItem = useCallback(
    ({ item }: { item: Antenna }) => <AntennaListItem antenna={item} />,
    [],
  );

  if (loading) {
    return (
      <SafeAreaView
        testID="dashboard-loading"
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text color="onSurfaceVariant" style={{ marginTop: theme.spacing.md }}>
          Midiendo cobertura…
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        testID="antenna-list"
        data={snapshot ? [...snapshot.nearbyAntennas] : []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <Text color="onSurfaceVariant" style={{ paddingHorizontal: theme.spacing.lg }}>
            No encontramos antenas cerca de tu ubicación.
          </Text>
        }
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
            <Text variant="titleLarge" color="onBackground">
              CoberturApp
            </Text>

            {error ? (
              <Text color="error" testID="dashboard-error">
                {error}
              </Text>
            ) : null}

            {snapshot ? (
              <>
                <ConnectionStatusCard connection={snapshot.connection}>
                  <SignalQualityIndicator signal={snapshot.signal} />
                </ConnectionStatusCard>

                <PrimaryButton
                  testID="find-best-signal-button"
                  label={searchingBestSignal ? 'Buscando…' : 'Buscar mejor señal'}
                  loading={searchingBestSignal}
                  onPress={findBestSignal}
                />

                {bestSignal ? (
                  <Card testID="best-signal-card">
                    <Text variant="labelSmall" color="onSurfaceVariant">
                      MEJOR SEÑAL DISPONIBLE
                    </Text>
                    <Text variant="titleMedium" style={{ marginTop: theme.spacing.xs }}>
                      {bestSignal.antenna.name}
                    </Text>
                    <Text color="onSurfaceVariant" style={{ marginTop: theme.spacing.xs }}>
                      {bestSignal.hint}
                    </Text>
                  </Card>
                ) : null}

                <Text variant="titleMedium" color="onBackground">
                  Antenas cercanas
                </Text>
              </>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
