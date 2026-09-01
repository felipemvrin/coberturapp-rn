import type { CardinalDirection, SignalLevel } from './entities';

/** Reglas de negocio puras y testeables sobre la señal. */

export const MIN_DBM = -120;
export const MAX_DBM = -50;

export function barsFromDbm(dbm: number): 0 | 1 | 2 | 3 | 4 {
  if (dbm >= -75) return 4;
  if (dbm >= -85) return 3;
  if (dbm >= -95) return 2;
  if (dbm >= -105) return 1;
  return 0;
}

export function levelFromBars(bars: number): SignalLevel {
  switch (bars) {
    case 4:
      return 'excellent';
    case 3:
      return 'good';
    case 2:
      return 'fair';
    case 1:
      return 'poor';
    default:
      return 'none';
  }
}

/** Normaliza dBm a un valor 0..1 para gauges y barras de progreso. */
export function normalizeDbm(dbm: number): number {
  const clamped = Math.min(Math.max(dbm, MIN_DBM), MAX_DBM);
  return (clamped - MIN_DBM) / (MAX_DBM - MIN_DBM);
}

const DIRECTIONS: CardinalDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function directionFromBearing(bearingDegrees: number): CardinalDirection {
  const normalized = ((bearingDegrees % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return DIRECTIONS[index];
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
