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
  /** Ubicación del usuario. TODO: proveerla desde expo-location. */
  readonly origin?: GeoPoint;
  readonly radiusMeters?: number;
  readonly limit?: number;
}

/**
 * Fuente de ubicación desacoplada del repositorio.
 * TODO: implementar `ExpoLocationDataSource` con expo-location.
 */
export interface LocationProvider {
  getCurrentPosition(): Promise<GeoPoint>;
}

/**
 * TODO (futuro): sensor de orientación (magnetómetro) para rotar la flecha
 * que apunta a la antena. Implementar con expo-sensors.
 */
export interface HeadingProvider {
  getHeadingDegrees(): Promise<number>;
}
