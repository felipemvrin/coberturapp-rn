import { act, renderHook, waitFor } from '@testing-library/react-native';

import { degreesFromMagnetometer } from '../src/data/datasources/ExpoHeadingDataSource';
import { relativeBearing } from '../src/domain/geo';
import type { HeadingProvider } from '../src/domain/repositories';
import { AppHeadingProvider, useHeading } from '../src/hooks';

class FakeHeadingProvider implements HeadingProvider {
  private listener: ((degrees: number) => void) | null = null;
  unsubscribed = false;

  constructor(private readonly available = true) {}

  async isAvailable(): Promise<boolean> {
    return this.available;
  }

  watchHeading(onChange: (degrees: number) => void): () => void {
    this.listener = onChange;
    return () => {
      this.unsubscribed = true;
      this.listener = null;
    };
  }

  emit(degrees: number): void {
    this.listener?.(degrees);
  }
}

function renderHeading(provider: HeadingProvider, enabled = true) {
  return renderHook(() => useHeading(enabled), {
    wrapper: ({ children }) => (
      <AppHeadingProvider provider={provider}>{children}</AppHeadingProvider>
    ),
  });
}

describe('relativeBearing', () => {
  it('devuelve 0 cuando el objetivo está al frente', () => {
    expect(relativeBearing(90, 90)).toBe(0);
  });

  it('rota según la orientación del dispositivo', () => {
    expect(relativeBearing(90, 0)).toBe(90);
    expect(relativeBearing(0, 90)).toBe(270);
  });

  it('normaliza siempre entre 0 y 360', () => {
    const value = relativeBearing(10, 350);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(360);
    expect(value).toBe(20);
  });
});

describe('degreesFromMagnetometer', () => {
  it('mapea los ejes a un rumbo válido', () => {
    expect(degreesFromMagnetometer(1, 0)).toBeCloseTo(90, 5);
    expect(degreesFromMagnetometer(0, 1)).toBeCloseTo(0, 5);
  });

  it('devuelve siempre un valor entre 0 y 360', () => {
    const value = degreesFromMagnetometer(-1, -1);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(360);
  });
});

describe('useHeading', () => {
  it('expone el rumbo emitido por el sensor', async () => {
    const provider = new FakeHeadingProvider();
    const { result } = await renderHeading(provider);

    await waitFor(() => expect(result.current.available).toBe(true));
    await act(async () => provider.emit(123));

    expect(result.current.heading).toBe(123);
  });

  it('marca el sensor como no disponible', async () => {
    const { result } = await renderHeading(new FakeHeadingProvider(false));

    await waitFor(() => expect(result.current.available).toBe(false));
    expect(result.current.heading).toBeNull();
  });

  it('no se suscribe cuando está deshabilitado', async () => {
    const provider = new FakeHeadingProvider();
    const { result } = await renderHeading(provider, false);

    expect(result.current.heading).toBeNull();
  });

  it('se da de baja al desmontar', async () => {
    const provider = new FakeHeadingProvider();
    const { unmount } = await renderHeading(provider);

    await waitFor(() => expect(provider.unsubscribed).toBe(false));
    unmount();
    await waitFor(() => expect(provider.unsubscribed).toBe(true));
  });
});
