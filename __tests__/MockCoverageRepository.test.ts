import { MockCoverageRepository } from '../src/data';
import { barsFromDbm, directionFromBearing, formatDistance } from '../src/domain/signal';

describe('MockCoverageRepository', () => {
  const repository = new MockCoverageRepository({ latencyMs: 0 });

  it('devuelve el estado de conexión mock', async () => {
    const connection = await repository.getConnectionStatus();
    expect(connection.carrier).toBe('Entel');
    expect(connection.technology).toBe('5G');
    expect(connection.isRoaming).toBe(false);
  });

  it('devuelve mediciones coherentes entre dBm, barras y nivel', async () => {
    const signal = await repository.getCurrentSignal();
    expect(signal.dbm).toBeLessThan(-50);
    expect(signal.bars).toBe(barsFromDbm(signal.dbm));
    expect(signal.measuredAt).toBeInstanceOf(Date);
  });

  it('ordena las antenas por distancia y respeta el límite', async () => {
    const antennas = await repository.getNearbyAntennas({ limit: 3 });
    expect(antennas).toHaveLength(3);
    const distances = antennas.map((a) => a.distanceMeters);
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it('filtra por radio de búsqueda', async () => {
    const antennas = await repository.getNearbyAntennas({ radiusMeters: 1000 });
    expect(antennas.every((a) => a.distanceMeters <= 1000)).toBe(true);
  });

  it('sugiere la mejor antena con una pista accionable', async () => {
    const suggestion = await repository.findBestSignal();
    expect(suggestion.antenna.name).toBe('Providencia Norte');
    expect(suggestion.expectedBars).toBe(4);
    expect(suggestion.hint).toContain('Providencia Norte');
  });

  it('entrega un snapshot completo para el dashboard', async () => {
    const snapshot = await repository.getCoverageSnapshot();
    expect(snapshot.connection).toBeDefined();
    expect(snapshot.signal).toBeDefined();
    expect(snapshot.nearbyAntennas.length).toBeGreaterThan(0);
  });
});

describe('reglas de dominio de señal', () => {
  it('convierte dBm a barras', () => {
    expect(barsFromDbm(-60)).toBe(4);
    expect(barsFromDbm(-80)).toBe(3);
    expect(barsFromDbm(-90)).toBe(2);
    expect(barsFromDbm(-100)).toBe(1);
    expect(barsFromDbm(-115)).toBe(0);
  });

  it('convierte rumbo a punto cardinal', () => {
    expect(directionFromBearing(0)).toBe('N');
    expect(directionFromBearing(95)).toBe('E');
    expect(directionFromBearing(350)).toBe('N');
  });

  it('formatea distancias en m y km', () => {
    expect(formatDistance(320)).toBe('320 m');
    expect(formatDistance(2680)).toBe('2.7 km');
  });
});
