import type { CoverageRepository } from '../domain/repositories';
import { MockCoverageRepository } from './repositories/MockCoverageRepository';
import { CsvCoverageRepository } from './repositories/CsvCoverageRepository';
import { COVERAGE_DATA_CSV } from './datasources/csvData';
import { DEFAULT_ORIGIN } from './datasources/mockCoverageData';

/**
 * Punto único de composición de dependencias.
 * Alterna entre CsvCoverageRepository (datos reales) y MockCoverageRepository (mock).
 * TODO: alternar aquí a `ApiCoverageRepository` (API real) cuando exista;
 * la UI no necesita cambios.
 */
const USE_CSV_DATA = true; // Cambiar a false para usar mock

export const coverageRepository: CoverageRepository = USE_CSV_DATA
  ? new CsvCoverageRepository({
      csvContent: COVERAGE_DATA_CSV,
      originLatitude: DEFAULT_ORIGIN.latitude,
      originLongitude: DEFAULT_ORIGIN.longitude,
    })
  : new MockCoverageRepository();

export { ExpoLocationDataSource } from './datasources/ExpoLocationDataSource';
export { MockCoverageRepository };
export { CsvCoverageRepository };
