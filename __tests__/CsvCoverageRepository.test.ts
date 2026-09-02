import { CsvCoverageRepository } from '../src/data/repositories/CsvCoverageRepository';
import type { GeoPoint } from '../src/domain/entities';

const CSV_FIXTURE = `Nro / Fecha Ingreso,Publ. DO Extracto,Publ. DS / Notif. RES.,Empresa,Comuna,Direccion,Latitud,Longitud
1,01/01/2024,01/01/2024,MOVISTAR MOVIL,Recoleta,Estación Metro Patronato,-33.4366,-70.6389
2,01/01/2024,01/01/2024,ENTEL PCS,Recoleta,Estación Metro Cerro Blanco,-33.4298,-70.6359`;

const DEFAULT_ORIGIN: GeoPoint = { latitude: -33.4489, longitude: -70.6693 };

describe('CsvCoverageRepository', () => {
  const repository = new CsvCoverageRepository({
    csvContent: CSV_FIXTURE,
    originLatitude: DEFAULT_ORIGIN.latitude,
    originLongitude: DEFAULT_ORIGIN.longitude,
    latencyMs: 0,
  });

  it('recalcula distancia y rumbo cuando se recibe un origen', async () => {
    const origenLejano: GeoPoint = { latitude: -33.6, longitude: -70.9 };
    const sinOrigen = await repository.getNearbyAntennas();
    const conOrigen = await repository.getNearbyAntennas({ origin: origenLejano });

    const antennaId = sinOrigen[0].id;
    const antennaSinOrigen = sinOrigen.find((a) => a.id === antennaId)!;
    const antennaConOrigen = conOrigen.find((a) => a.id === antennaId)!;

    expect(antennaConOrigen.distanceMeters).not.toBeCloseTo(antennaSinOrigen.distanceMeters, 0);
    expect(antennaConOrigen.bearingDegrees).not.toBeCloseTo(antennaSinOrigen.bearingDegrees, 0);
  });

  it('respeta radio y límite en el filtrado', async () => {
    const antennas = await repository.getNearbyAntennas({ radiusMeters: 5000, limit: 1 });
    expect(antennas).toHaveLength(1);
    expect(antennas[0].distanceMeters).toBeLessThanOrEqual(5000);
  });
});
