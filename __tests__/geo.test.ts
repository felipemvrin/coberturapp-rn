import { MockCoverageRepository } from '../src/data';
import type { GeoPoint } from '../src/domain/entities';
import { bearingBetween, distanceBetween } from '../src/domain/geo';
import { directionFromBearing } from '../src/domain/signal';

const SANTIAGO: GeoPoint = { latitude: -33.4489, longitude: -70.6693 };

describe('cálculos geográficos', () => {
  it('devuelve distancia cero para el mismo punto', () => {
    expect(distanceBetween(SANTIAGO, SANTIAGO)).toBeCloseTo(0, 5);
  });

  it('calcula distancias conocidas con precisión razonable', () => {
    // Un grado de latitud equivale aproximadamente a 111,2 km.
    const unGradoAlNorte: GeoPoint = { latitude: -32.4489, longitude: -70.6693 };
    expect(distanceBetween(SANTIAGO, unGradoAlNorte) / 1000).toBeCloseTo(111.2, 0);
  });

  it('es simétrica en la distancia', () => {
    const valparaiso: GeoPoint = { latitude: -33.0472, longitude: -71.6127 };
    expect(distanceBetween(SANTIAGO, valparaiso)).toBeCloseTo(
      distanceBetween(valparaiso, SANTIAGO),
      5,
    );
  });

  it('calcula rumbos cardinales correctos', () => {
    const norte: GeoPoint = { latitude: -32.4489, longitude: -70.6693 };
    const sur: GeoPoint = { latitude: -34.4489, longitude: -70.6693 };
    const este: GeoPoint = { latitude: -33.4489, longitude: -69.6693 };

    expect(directionFromBearing(bearingBetween(SANTIAGO, norte))).toBe('N');
    expect(directionFromBearing(bearingBetween(SANTIAGO, sur))).toBe('S');
    expect(directionFromBearing(bearingBetween(SANTIAGO, este))).toBe('E');
  });

  it('devuelve siempre un rumbo entre 0 y 360', () => {
    const oeste: GeoPoint = { latitude: -33.4489, longitude: -71.6693 };
    const bearing = bearingBetween(SANTIAGO, oeste);
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThan(360);
  });
});

describe('MockCoverageRepository con ubicación real', () => {
  const repository = new MockCoverageRepository({ latencyMs: 0 });

  it('recalcula distancias respecto al origen recibido', async () => {
    const lejos: GeoPoint = { latitude: -33.6, longitude: -70.9 };

    const sinOrigen = await repository.getNearbyAntennas();
    const conOrigen = await repository.getNearbyAntennas({ origin: lejos });

    const antenaSinOrigen = sinOrigen.find((a) => a.id === 'ant-001')!;
    const antenaConOrigen = conOrigen.find((a) => a.id === 'ant-001')!;

    expect(antenaConOrigen.distanceMeters).not.toBeCloseTo(antenaSinOrigen.distanceMeters, 0);
    expect(antenaConOrigen.distanceMeters).toBeGreaterThan(10000);
  });

  it('mantiene el orden por distancia tras recalcular', async () => {
    const antennas = await repository.getNearbyAntennas({ origin: SANTIAGO });
    const distancias = antennas.map((a) => a.distanceMeters);
    expect([...distancias].sort((a, b) => a - b)).toEqual(distancias);
  });

  it('deriva la dirección desde el rumbo recalculado', async () => {
    const antennas = await repository.getNearbyAntennas({ origin: SANTIAGO });
    antennas.forEach((antenna) => {
      expect(antenna.direction).toBe(directionFromBearing(antenna.bearingDegrees));
    });
  });

  it('respeta el radio de búsqueda usando distancias reales', async () => {
    const antennas = await repository.getNearbyAntennas({ origin: SANTIAGO, radiusMeters: 2000 });
    expect(antennas.every((a) => a.distanceMeters <= 2000)).toBe(true);
  });
});
