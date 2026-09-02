import type {
  Antenna,
  BestSignalSuggestion,
  ConnectionStatus,
  CoverageSnapshot,
  GeoPoint,
  SignalMeasurement,
} from './entities';

/**
 * Contrato único que consume la UI. La implementación mock de hoy y la
 * implementación real de mañana (API + APIs nativas de radio) son
 * intercambiables sin tocar pantallas ni componentes.
 */
export interface CoverageRepository {
  getConnectionStatus(): Promise<ConnectionStatus>;
  getCurrentSignal(): Promise<SignalMeasurement>;
  getNearbyAntennas(params?: NearbyAntennasQuery): Promise<Antenna[]>;
  /** Carga agregada usada por el dashboard para una sola pasada. */
  getCoverageSnapshot(params?: NearbyAntennasQuery): Promise<CoverageSnapshot>;
  /** Acción "Buscar mejor señal". Puede tardar: la UI muestra loading. */
  findBestSignal(params?: NearbyAntennasQuery): Promise<BestSignalSuggestion>;
}

export interface NearbyAntennasQuery {
  /** Ubicación del usuario. Si falta, se usa el origen por defecto. */
  readonly origin?: GeoPoint;
  readonly radiusMeters?: number;
  readonly limit?: number;
}

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

/** Error de ubicación con causa distinguible, para que la UI reaccione distinto. */
export class LocationError extends Error {
  constructor(readonly reason: 'permission-denied' | 'unavailable') {
    super(reason);
    this.name = 'LocationError';
  }
}

/** Fuente de ubicación desacoplada del repositorio. */
export interface LocationProvider {
  requestPermission(): Promise<LocationPermissionStatus>;
  /** Lanza `LocationError` si no hay permiso o el GPS no responde. */
  getCurrentPosition(): Promise<GeoPoint>;
}

/** Orientación del dispositivo (magnetómetro), para apuntar hacia una antena. */
export interface HeadingProvider {
  isAvailable(): Promise<boolean>;
  /** Suscribe a los cambios de rumbo. Devuelve la función para darse de baja. */
  watchHeading(onChange: (degrees: number) => void): () => void;
}
