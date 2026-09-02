import { Magnetometer } from 'expo-sensors';

import type { HeadingProvider } from '../../domain/repositories';

/**
 * Rumbo del dispositivo sobre expo-sensors.
 * Se usa el magnetómetro en vez de `Location.watchHeadingAsync` porque este
 * exige permiso de ubicación, y la brújula debe funcionar sin él.
 */
export class ExpoHeadingDataSource implements HeadingProvider {
  async isAvailable(): Promise<boolean> {
    try {
      return await Magnetometer.isAvailableAsync();
    } catch {
      return false;
    }
  }

  watchHeading(onChange: (degrees: number) => void): () => void {
    Magnetometer.setUpdateInterval(200);
    const subscription = Magnetometer.addListener(({ x, y }) => {
      onChange(degreesFromMagnetometer(x, y));
    });
    return () => subscription.remove();
  }
}

/** Convierte los ejes del magnetómetro en un rumbo 0..360 (0 = norte). */
export function degreesFromMagnetometer(x: number, y: number): number {
  const angle = Math.atan2(y, x) * (180 / Math.PI);
  return (90 - angle + 360) % 360;
}
