import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { MockCoverageRepository } from '../src/data';
import { CoverageRepositoryProvider } from '../src/hooks';
import { DashboardScreen } from '../src/screens';
import { ThemeProvider } from '../src/theme';

// En RNTL v14 `render` es asíncrono y publica el resultado en `screen`.
async function renderDashboard() {
  const repository = new MockCoverageRepository({ latencyMs: 0 });
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
});
