import type {
  Antenna,
  BestSignalSuggestion,
  ConnectionStatus,
  CoverageSnapshot,
  SignalMeasurement,
} from '../../domain/entities';
import type { CoverageRepository, NearbyAntennasQuery } from '../../domain/repositories';
import { barsFromDbm, formatDistance, levelFromBars } from '../../domain/signal';
import { MOCK_ANTENNAS, MOCK_CONNECTION, MOCK_DBM_SERIES } from '../datasources/mockCoverageData';

export interface MockCoverageRepositoryOptions {
  /** Latencia simulada en ms. Se pone en 0 en los tests. */
  readonly latencyMs?: number;
}

/**
 * Implementación en memoria del contrato de dominio.
 * TODO: crear `ApiCoverageRepository` que consuma la API real de cobertura
 * y las APIs nativas de radio, manteniendo esta misma interfaz.
 */
export class MockCoverageRepository implements CoverageRepository {
  private readonly latencyMs: number;
  private measurementIndex = 0;

  constructor(options: MockCoverageRepositoryOptions = {}) {
    this.latencyMs = options.latencyMs ?? 600;
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    await this.delay();
    return MOCK_CONNECTION;
  }

  async getCurrentSignal(): Promise<SignalMeasurement> {
    await this.delay();
    return this.nextMeasurement();
  }

  async getNearbyAntennas(params: NearbyAntennasQuery = {}): Promise<Antenna[]> {
    await this.delay();
    return this.filterAntennas(params);
  }

  async getCoverageSnapshot(params: NearbyAntennasQuery = {}): Promise<CoverageSnapshot> {
    await this.delay();
    return {
      connection: MOCK_CONNECTION,
      signal: this.nextMeasurement(),
      nearbyAntennas: this.filterAntennas(params),
    };
  }

  async findBestSignal(params: NearbyAntennasQuery = {}): Promise<BestSignalSuggestion> {
    // El escaneo real es más lento que una lectura puntual.
    await this.delay(this.latencyMs * 2);

    const candidates = this.filterAntennas({ ...params, limit: undefined });
    if (candidates.length === 0) {
      throw new Error('No hay antenas disponibles para sugerir una mejor señal.');
    }
    const best = candidates.reduce((acc, antenna) =>
      scoreAntenna(antenna) > scoreAntenna(acc) ? antenna : acc,
    );

    return {
      antenna: best,
      expectedBars: 4,
      hint: `Muévete ${formatDistance(best.distanceMeters)} hacia el ${best.direction} para conectarte a ${best.name}.`,
    };
  }

  private filterAntennas(params: NearbyAntennasQuery): Antenna[] {
    const { radiusMeters = Number.POSITIVE_INFINITY, limit } = params;
    const result = MOCK_ANTENNAS.filter((a) => a.distanceMeters <= radiusMeters).sort(
      (a, b) => a.distanceMeters - b.distanceMeters,
    );
    return typeof limit === 'number' ? result.slice(0, limit) : result;
  }

  private nextMeasurement(): SignalMeasurement {
    const dbm = MOCK_DBM_SERIES[this.measurementIndex % MOCK_DBM_SERIES.length];
    this.measurementIndex += 1;
    const bars = barsFromDbm(dbm);
    return { dbm, bars, level: levelFromBars(bars), measuredAt: new Date() };
  }

  private delay(ms = this.latencyMs): Promise<void> {
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/** Menor distancia y mejor tecnología ⇒ mayor puntaje. */
function scoreAntenna(antenna: Antenna): number {
  const techBonus = antenna.technology === '5G' ? 1500 : antenna.technology === '4G+' ? 800 : 0;
  return techBonus - antenna.distanceMeters;
}
