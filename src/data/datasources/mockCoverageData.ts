import type { Antenna, ConnectionStatus, GeoPoint } from '../../domain/entities';
import { directionFromBearing } from '../../domain/signal';

/** Centro aproximado de Santiago, usado como origen por defecto en los mocks. */
export const DEFAULT_ORIGIN: GeoPoint = { latitude: -33.4489, longitude: -70.6693 };

export const MOCK_CONNECTION: ConnectionStatus = {
  carrier: 'Entel',
  technology: '5G',
  isRoaming: false,
};

/** Serie de mediciones que el mock recorre cíclicamente para simular variación. */
export const MOCK_DBM_SERIES = [-72, -78, -84, -91, -83, -76];

type AntennaSeed = Omit<Antenna, 'direction'>;

const SEEDS: AntennaSeed[] = [
  {
    id: 'ant-001',
    name: 'Providencia Norte',
    carrier: 'Entel',
    technology: '5G',
    distanceMeters: 320,
    bearingDegrees: 15,
    position: { latitude: -33.4461, longitude: -70.6675 },
  },
  {
    id: 'ant-002',
    name: 'Bellas Artes',
    carrier: 'Movistar',
    technology: '4G+',
    distanceMeters: 780,
    bearingDegrees: 95,
    position: { latitude: -33.4372, longitude: -70.6412 },
  },
  {
    id: 'ant-003',
    name: 'Estación Central',
    carrier: 'Entel',
    technology: '4G',
    distanceMeters: 1450,
    bearingDegrees: 250,
    position: { latitude: -33.4523, longitude: -70.6789 },
  },
  {
    id: 'ant-004',
    name: 'Ñuñoa Plaza',
    carrier: 'WOM',
    technology: '5G',
    distanceMeters: 2100,
    bearingDegrees: 130,
    position: { latitude: -33.4562, longitude: -70.5981 },
  },
  {
    id: 'ant-005',
    name: 'Cerro San Cristóbal',
    carrier: 'Claro',
    technology: '4G',
    distanceMeters: 2680,
    bearingDegrees: 340,
    position: { latitude: -33.4258, longitude: -70.6321 },
  },
];

export const MOCK_ANTENNAS: Antenna[] = SEEDS.map((seed) => ({
  ...seed,
  direction: directionFromBearing(seed.bearingDegrees),
}));
