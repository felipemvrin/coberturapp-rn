import { useRoute, type RouteProp } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { LocationNotice, Text } from '../components';
import { DEFAULT_ORIGIN } from '../data/datasources/mockCoverageData';
import type { Antenna, NetworkTechnology } from '../domain/entities';
import { formatDistance } from '../domain/signal';
import { useNearbyAntennas } from '../hooks';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

/** Zoom aproximado de ~5 km de lado. */
const DELTA = 0.05;

const MARKER_COLOR: Record<NetworkTechnology, string> = {
  '5G': '#12B76A',
  '4G+': '#2563EB',
  '4G': '#F79009',
  '3G': '#98A2B3',
  '2G': '#98A2B3',
  NO_SERVICE: '#D92D20',
};

export function MapScreen(): React.JSX.Element {
  const theme = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'Map'>>();
  const focusAntennaId = route.params?.focusAntennaId;

  const { antennas, loading, error, locationStatus, origin, retryLocation } = useNearbyAntennas();

  const focused: Antenna | undefined = useMemo(
    () => antennas.find((a) => a.id === focusAntennaId),
    [antennas, focusAntennaId],
  );

  const center = focused?.position ?? origin ?? DEFAULT_ORIGIN;

  if (loading) {
    return (
      <View
        testID="map-loading"
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <MapView
        testID="coverage-map"
        provider={PROVIDER_GOOGLE}
        style={styles.flex}
        showsUserLocation={locationStatus === 'ready'}
        showsMyLocationButton={locationStatus === 'ready'}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: DELTA,
          longitudeDelta: DELTA,
        }}
      >
        {antennas.map((antenna) => (
          <Marker
            key={antenna.id}
            testID={`antenna-marker-${antenna.id}`}
            coordinate={antenna.position}
            title={antenna.name}
            description={`${antenna.carrier} · ${antenna.technology} · ${formatDistance(antenna.distanceMeters)}`}
            pinColor={MARKER_COLOR[antenna.technology]}
          />
        ))}
      </MapView>

      <View style={[styles.overlay, { padding: theme.spacing.lg }]} pointerEvents="box-none">
        <LocationNotice status={locationStatus} onRetry={retryLocation} />
        {error ? (
          <Text color="error" testID="map-error">
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, gap: 8 },
});
