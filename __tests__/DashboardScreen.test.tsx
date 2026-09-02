import { NavigationContainer } from '@react-navigation/native';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { MockCoverageRepository } from '../src/data';
import type { GeoPoint } from '../src/domain/entities';
import {
  LocationError,
  type CoverageRepository,
  type LocationProvider,
} from '../src/domain/repositories';
import { AppLocationProvider, CoverageRepositoryProvider } from '../src/hooks';
import { DashboardScreen } from '../src/screens';
import { ThemeProvider } from '../src/theme';

const POSITION: GeoPoint = { latitude: -33.4489, longitude: -70.6693 };

const grantedLocation: LocationProvider = {
  requestPermission: async () => 'granted',
  getCurrentPosition: async () => POSITION,
};

const deniedLocation: LocationProvider = {
  requestPermission: async () => 'denied',
  getCurrentPosition: async () => {
    throw new LocationError('permission-denied');
  },
};

// En RNTL v14 `render` es asíncrono y publica el resultado en `screen`.
async function renderDashboard(
  repository: CoverageRepository = new MockCoverageRepository({ latencyMs: 0 }),
  location: LocationProvider = grantedLocation,
) {
  await render(
    <ThemeProvider forceScheme="light">
      <CoverageRepositoryProvider repository={repository}>
        <AppLocationProvider provider={location}>
          <NavigationContainer>
            <DashboardScreen />
          </NavigationContainer>
        </AppLocationProvider>
      </CoverageRepositoryProvider>
    </ThemeProvider>,
  );
}

describe('DashboardScreen', () => {
  it('muestra el estado de conexión y la calidad de señal', async () => {
    await renderDashboard();

    expect(await screen.findByTestId('connection-status-card')).toBeTruthy();
    expect(screen.getByText('Entel')).toBeTruthy();
    expect(screen.getByText('5G')).toBeTruthy();
    expect(screen.getByTestId('signal-quality-indicator')).toBeTruthy();
  });

  it('lista las antenas cercanas ordenadas por distancia', async () => {
    await renderDashboard();

    expect(await screen.findByText('Providencia Norte')).toBeTruthy();
    expect(screen.getByText('Bellas Artes')).toBeTruthy();
  });

  it('no muestra aviso de ubicación cuando hay permiso', async () => {
    await renderDashboard();

    expect(await screen.findByTestId('connection-status-card')).toBeTruthy();
    expect(screen.queryByTestId('location-notice')).toBeNull();
  });

  it('avisa y permite reintentar cuando se deniega la ubicación', async () => {
    await renderDashboard(new MockCoverageRepository({ latencyMs: 0 }), deniedLocation);

    expect(await screen.findByTestId('location-notice')).toBeTruthy();
    expect(screen.getByTestId('location-retry-button')).toBeTruthy();
    // El dashboard sigue siendo utilizable con el origen por defecto.
    expect(screen.getByTestId('connection-status-card')).toBeTruthy();
  });

  it('muestra la sugerencia tras buscar la mejor señal', async () => {
    const user = userEvent.setup();
    await renderDashboard();

    await user.press(await screen.findByTestId('find-best-signal-button'));

    await waitFor(() => expect(screen.getByTestId('best-signal-card')).toBeTruthy());
    expect(screen.getByText('MEJOR SEÑAL DISPONIBLE')).toBeTruthy();
  });

  it('oculta la sugerencia anterior si una nueva búsqueda falla', async () => {
    const baseRepository = new MockCoverageRepository({ latencyMs: 0 });
    let attempts = 0;
    const repository: CoverageRepository = {
      getConnectionStatus: () => baseRepository.getConnectionStatus(),
      getCurrentSignal: () => baseRepository.getCurrentSignal(),
      getNearbyAntennas: (params) => baseRepository.getNearbyAntennas(params),
      getCoverageSnapshot: (params) => baseRepository.getCoverageSnapshot(params),
      findBestSignal: async (params) => {
        attempts += 1;
        if (attempts === 1) return baseRepository.findBestSignal(params);
        throw new Error('scan failed');
      },
    };

    const user = userEvent.setup();
    await renderDashboard(repository);

    await user.press(await screen.findByTestId('find-best-signal-button'));
    await waitFor(() => expect(screen.getByTestId('best-signal-card')).toBeTruthy());

    await user.press(screen.getByTestId('find-best-signal-button'));

    await waitFor(() => expect(screen.getByTestId('dashboard-error')).toBeTruthy());
    expect(screen.queryByTestId('best-signal-card')).toBeNull();
  });
});
