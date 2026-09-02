import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { GeoPoint } from '../src/domain/entities';
import {
  LocationError,
  type LocationPermissionStatus,
  type LocationProvider,
} from '../src/domain/repositories';
import { AppLocationProvider, useUserLocation } from '../src/hooks';

const POSITION: GeoPoint = { latitude: -33.45, longitude: -70.66 };

class FakeLocationProvider implements LocationProvider {
  constructor(private readonly result: GeoPoint | Error) {}

  async requestPermission(): Promise<LocationPermissionStatus> {
    return this.result instanceof Error ? 'denied' : 'granted';
  }

  async getCurrentPosition(): Promise<GeoPoint> {
    if (this.result instanceof Error) throw this.result;
    return this.result;
  }
}

function renderUserLocation(provider: LocationProvider) {
  return renderHook(() => useUserLocation(), {
    wrapper: ({ children }) => (
      <AppLocationProvider provider={provider}>{children}</AppLocationProvider>
    ),
  });
}

describe('useUserLocation', () => {
  it('expone la ubicación cuando se concede el permiso', async () => {
    const { result } = await renderUserLocation(new FakeLocationProvider(POSITION));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.origin).toEqual(POSITION);
  });

  it('marca "denied" cuando se rechaza el permiso', async () => {
    const { result } = await renderUserLocation(
      new FakeLocationProvider(new LocationError('permission-denied')),
    );

    await waitFor(() => expect(result.current.status).toBe('denied'));
    expect(result.current.origin).toBeNull();
  });

  it('marca "unavailable" ante un fallo del GPS', async () => {
    const { result } = await renderUserLocation(
      new FakeLocationProvider(new LocationError('unavailable')),
    );

    await waitFor(() => expect(result.current.status).toBe('unavailable'));
    expect(result.current.origin).toBeNull();
  });

  it('permite reintentar tras un fallo', async () => {
    let shouldFail = true;
    const provider: LocationProvider = {
      requestPermission: async () => 'granted',
      getCurrentPosition: async () => {
        if (shouldFail) throw new LocationError('unavailable');
        return POSITION;
      },
    };

    const { result } = await renderUserLocation(provider);
    await waitFor(() => expect(result.current.status).toBe('unavailable'));

    shouldFail = false;
    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.origin).toEqual(POSITION);
  });
});
