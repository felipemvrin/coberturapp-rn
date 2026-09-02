import * as Location from 'expo-location';

import type { GeoPoint } from '../../domain/entities';
import {
  LocationError,
  type LocationPermissionStatus,
  type LocationProvider,
} from '../../domain/repositories';

/** Implementación real de `LocationProvider` sobre expo-location. */
export class ExpoLocationDataSource implements LocationProvider {
  async requestPermission(): Promise<LocationPermissionStatus> {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    if (status === Location.PermissionStatus.GRANTED) return 'granted';
    if (status === Location.PermissionStatus.DENIED && !canAskAgain) return 'denied';
    return status === Location.PermissionStatus.DENIED ? 'denied' : 'undetermined';
  }

  async getCurrentPosition(): Promise<GeoPoint> {
    if ((await this.requestPermission()) !== 'granted') {
      throw new LocationError('permission-denied');
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      throw new LocationError('unavailable');
    }
  }
}
