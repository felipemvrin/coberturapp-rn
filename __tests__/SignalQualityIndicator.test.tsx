import { render, screen } from '@testing-library/react-native';

import { SignalQualityIndicator } from '../src/components';
import type { SignalMeasurement } from '../src/domain/entities';
import { ThemeProvider } from '../src/theme';

function measurement(dbm: number, bars: SignalMeasurement['bars']): SignalMeasurement {
  return {
    dbm,
    bars,
    level: bars >= 4 ? 'excellent' : bars === 3 ? 'good' : bars === 2 ? 'fair' : 'poor',
    measuredAt: new Date('2026-01-01T00:00:00Z'),
  };
}

async function renderIndicator(signal: SignalMeasurement) {
  await render(
    <ThemeProvider forceScheme="light">
      <SignalQualityIndicator signal={signal} />
    </ThemeProvider>,
  );
}

describe('SignalQualityIndicator', () => {
  it('describe el nivel y el detalle en dBm', async () => {
    await renderIndicator(measurement(-72, 4));

    expect(screen.getByText('Señal excelente')).toBeTruthy();
    expect(screen.getByText('-72 dBm · 4/4 barras')).toBeTruthy();
  });

  it('renderiza siempre las 4 barras', async () => {
    await renderIndicator(measurement(-100, 1));

    expect(screen.getByText('Señal débil')).toBeTruthy();
    [0, 1, 2, 3].forEach((index) => {
      expect(screen.getByTestId(`signal-bar-${index}`)).toBeTruthy();
    });
  });
});
