import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { MockCoverageRepository } from '../src/data';
import type { CoverageRepository } from '../src/domain/repositories';
import { CoverageRepositoryProvider } from '../src/hooks';
import { DashboardScreen } from '../src/screens';
import { ThemeProvider } from '../src/theme';

// En RNTL v14 `render` es asíncrono y publica el resultado en `screen`.
async function renderDashboard(repository: CoverageRepository = new MockCoverageRepository({ latencyMs: 0 })) {
  await render(
    <ThemeProvider forceScheme="light">
      <CoverageRepositoryProvider repository={repository}>
        <DashboardScreen />
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
    expect(screen.getByText('320 m')).toBeTruthy();
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
