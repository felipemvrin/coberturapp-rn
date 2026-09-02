import type { GeoPoint } from './entities';

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

/** Distancia sobre la superficie terrestre entre dos puntos (fórmula de Haversine). */
export function distanceBetween(from: GeoPoint, to: GeoPoint): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

/** Rumbo inicial desde `from` hacia `to`, en grados 0..360 (0 = norte). */
export function bearingBetween(from: GeoPoint, to: GeoPoint): number {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const dLon = toRadians(to.longitude - from.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Ángulo al que rotar una flecha para que apunte al objetivo desde la
 * orientación actual del dispositivo. 0 = al frente.
 */
export function relativeBearing(targetBearing: number, deviceHeading: number): number {
  return (((targetBearing - deviceHeading) % 360) + 360) % 360;
}
