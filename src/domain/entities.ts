/**
 * Modelos del dominio (equivalente a lib/domain/ en el proyecto Flutter).
 * No dependen de React ni de ninguna fuente de datos concreta.
 */

export type NetworkTechnology = '2G' | '3G' | '4G' | '4G+' | '5G' | 'NO_SERVICE';

export type SignalLevel = 'none' | 'poor' | 'fair' | 'good' | 'excellent';

/** Estado de conexión actual del dispositivo. */
export interface ConnectionStatus {
  /** Nombre comercial del operador, ej. "Entel". */
  readonly carrier: string;
  readonly technology: NetworkTechnology;
  /** true cuando el dispositivo está en roaming nacional/internacional. */
  readonly isRoaming: boolean;
}

/** Medición de señal en un instante dado. */
export interface SignalMeasurement {
  /** Potencia recibida en dBm (típicamente entre -120 y -50). */
  readonly dbm: number;
  /** Nivel discreto derivado del dBm, 0..4 barras. */
  readonly bars: 0 | 1 | 2 | 3 | 4;
  readonly level: SignalLevel;
  readonly measuredAt: Date;
}

export type CardinalDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface GeoPoint {
  readonly latitude: number;
  readonly longitude: number;
}

/** Antena (celda) cercana a la ubicación del usuario. */
export interface Antenna {
  readonly id: string;
  readonly name: string;
  readonly carrier: string;
  readonly technology: NetworkTechnology;
  /** Distancia en metros desde la ubicación del usuario. */
  readonly distanceMeters: number;
  /** Rumbo hacia la antena, en grados (0 = norte). */
  readonly bearingDegrees: number;
  readonly direction: CardinalDirection;
  /** Coordenadas: se usarán al integrar el mapa interactivo. */
  readonly position: GeoPoint;
}

/** Resultado de la acción "Buscar mejor señal". */
export interface BestSignalSuggestion {
  readonly antenna: Antenna;
  readonly expectedBars: 0 | 1 | 2 | 3 | 4;
  /** Mensaje accionable para el usuario. */
  readonly hint: string;
}

/** Snapshot completo que alimenta el dashboard. */
export interface CoverageSnapshot {
  readonly connection: ConnectionStatus;
  readonly signal: SignalMeasurement;
  readonly nearbyAntennas: readonly Antenna[];
}
