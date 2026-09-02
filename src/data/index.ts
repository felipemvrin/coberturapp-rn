import type { CoverageRepository } from '../domain/repositories';
import { MockCoverageRepository } from './repositories/MockCoverageRepository';

/**
 * Punto único de composición de dependencias.
 * TODO: alternar aquí a `ApiCoverageRepository` (API real) cuando exista;
 * la UI no necesita cambios.
 */
export const coverageRepository: CoverageRepository = new MockCoverageRepository();

export { ExpoLocationDataSource } from './datasources/ExpoLocationDataSource';
export { MockCoverageRepository };
