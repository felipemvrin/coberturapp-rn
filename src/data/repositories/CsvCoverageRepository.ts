import type {
  Antenna,
  BestSignalSuggestion,
  ConnectionStatus,
  CoverageSnapshot,
  SignalMeasurement,
} from '../../domain/entities';
import type { CoverageRepository, NearbyAntennasQuery } from '../../domain/repositories';
import { parseAntennasCsv } from '../datasources/csvCoverageParser';
import { barsFromDbm, levelFromBars, formatDistance } from '../../domain/signal';
import { MOCK_CONNECTION } from '../datasources/mockCoverageData';


export interface CsvCoverageRepositoryOptions {
  /** Contenido del archivo CSV */
  readonly csvContent: string;
  /** Punto origen para calcular distancias (coordenadas del usuario) */
  readonly originLatitude: number;
  readonly originLongitude: number;
  /** Latencia simulada en ms */
  readonly latencyMs?: number;
}

/**
 * Implementación del repositorio que lee antenas desde un archivo CSV.
 * Mantiene la misma interfaz que MockCoverageRepository.
 */
export class CsvCoverageRepository implements CoverageRepository {
  private readonly antennas: Antenna[];
  private readonly latencyMs: number;
  private measurementIndex = 0;

  constructor(options: CsvCoverageRepositoryOptions) {
    this.latencyMs = options.latencyMs ?? 600;
    
    const origin = {
      latitude: options.originLatitude,
      longitude: options.originLongitude,
    };
    
    this.antennas = parseAntennasCsv(options.csvContent, origin);
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
    let filtered = [...this.antennas];

    if (params.radiusMeters !== undefined && params.radiusMeters !== null) {
      filtered = filtered.filter(a => a.distanceMeters <= params.radiusMeters!);
    }

    // Ordenar por distancia
    filtered.sort((a, b) => a.distanceMeters - b.distanceMeters);

    // Limitar
    if (params.limit !== undefined) {
      filtered = filtered.slice(0, params.limit);
    } else {
      filtered = filtered.slice(0, 20); // Default a 20 (todos del CSV de prueba)
    }

    return filtered;
  }

  private nextMeasurement(): SignalMeasurement {
    // Simular variación de señal
    const dbmValues = [-65, -70, -75, -80, -85];
    const dbm = dbmValues[this.measurementIndex % dbmValues.length];
    this.measurementIndex++;

    return {
      dbm,
      bars: barsFromDbm(dbm),
      level: levelFromBars(barsFromDbm(dbm)),
      measuredAt: new Date(),
    };
  }

  private delay(ms?: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms ?? this.latencyMs));
  }
}

/**
 * Calcula un score simple para priorizar antenas (por distancia y tecnología).
 */
function scoreAntenna(antenna: Antenna): number {
  let score = 100 - antenna.distanceMeters / 100; // Más cercana = mejor
  
  // Bonus por tecnología
  const techScore: Record<string, number> = {
    '5G': 50,
    '4G+': 40,
    '4G': 30,
    '3G': 20,
    '2G': 10,
    NO_SERVICE: 0,
  };
  
  score += techScore[antenna.technology] || 0;
  return score;
}
