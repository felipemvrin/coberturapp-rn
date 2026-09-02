import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { MockCoverageRepository } from '../src/data';
import type { GeoPoint } from '../src/domain/entities';
import type { LocationProvider } from '../src/domain/repositories';
import { AppLocationProvider, CoverageRepositoryProvider } from '../src/hooks';
import { MapScreen } from '../src/screens';
import { ThemeProvider } from '../src/theme';

jest.mock('react-native-maps');

const POSITION: GeoPoint = { latitude: -33.4489, longitude: -70.6693 };

const grantedLocation: LocationProvider = {
  requestPermission: async () => 'granted',
  getCurrentPosition: async () => POSITION,
};

const mockUseRoute = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => mockUseRoute(),
}));

async function renderMap(params: { focusAntennaId?: string } | undefined = undefined) {
  mockUseRoute.mockReturnValue({ params });
  await render(
    <ThemeProvider forceScheme="light">
      <CoverageRepositoryProvider repository={new MockCoverageRepository({ latencyMs: 0 })}>
        <AppLocationProvider provider={grantedLocation}>
          <NavigationContainer>
            <MapScreen />
          </NavigationContainer>
        </AppLocationProvider>
      </CoverageRepositoryProvider>
    </ThemeProvider>,
  );
}

describe('MapScreen', () => {
  it('renderiza un marcador por cada antena cercana', async () => {
    await renderMap();

    expect(await screen.findByTestId('coverage-map')).toBeTruthy();
    expect(screen.getByTestId('antenna-marker-ant-001')).toBeTruthy();
    expect(screen.getByTestId('antenna-marker-ant-005')).toBeTruthy();
  });

  it('no muestra aviso de ubicación cuando hay permiso', async () => {
    await renderMap();

    expect(await screen.findByTestId('coverage-map')).toBeTruthy();
    expect(screen.queryByTestId('location-notice')).toBeNull();
  });

  it('acepta el parámetro de antena enfocada', async () => {
    await renderMap({ focusAntennaId: 'ant-003' });

    expect(await screen.findByTestId('antenna-marker-ant-003')).toBeTruthy();
  });
});
