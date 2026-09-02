import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AntennaListItem,
  Card,
  ConnectionStatusCard,
  DirectionArrow,
  LocationNotice,
  PrimaryButton,
  SignalQualityIndicator,
  Text,
} from '../components';
import type { Antenna } from '../domain/entities';
import { relativeBearing } from '../domain/geo';
import { useCoverageDashboard, useHeading } from '../hooks';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

export function DashboardScreen(): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    snapshot,
    loading,
    refreshing,
    searchingBestSignal,
    bestSignal,
    error,
    locationStatus,
    retryLocation,
    refresh,
    findBestSignal,
  } = useCoverageDashboard();

  // La brújula sólo se activa cuando hay una antena que señalar.
  const { heading, available: hasCompass } = useHeading(bestSignal !== null);

  const renderItem = useCallback(
    ({ item }: { item: Antenna }) => (
      <AntennaListItem
        antenna={item}
        onPress={(antenna) => navigation.navigate('Map', { focusAntennaId: antenna.id })}
      />
    ),
    [navigation],
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

            <LocationNotice status={locationStatus} onRetry={retryLocation} />

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

                <PrimaryButton
                  testID="open-map-button"
                  label="Ver mapa de cobertura"
                  onPress={() => navigation.navigate('Map')}
                />

                {bestSignal ? (
                  <Card testID="best-signal-card">
                    <View style={styles.bestSignalRow}>
                      <View style={styles.bestSignalText}>
                        <Text variant="labelSmall" color="onSurfaceVariant">
                          MEJOR SEÑAL DISPONIBLE
                        </Text>
                        <Text variant="titleMedium" style={{ marginTop: theme.spacing.xs }}>
                          {bestSignal.antenna.name}
                        </Text>
                        <Text color="onSurfaceVariant" style={{ marginTop: theme.spacing.xs }}>
                          {bestSignal.hint}
                        </Text>
                      </View>

                      <DirectionArrow
                        live={hasCompass && heading !== null}
                        rotationDegrees={relativeBearing(
                          bestSignal.antenna.bearingDegrees,
                          heading ?? 0,
                        )}
                        fallbackDirection={bestSignal.antenna.direction}
                      />
                    </View>
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
  bestSignalRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bestSignalText: { flex: 1 },
});
