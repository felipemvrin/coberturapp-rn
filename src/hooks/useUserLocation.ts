import { useCallback, useEffect, useRef, useState } from 'react';

import type { GeoPoint } from '../domain/entities';
import { LocationError } from '../domain/repositories';
import { useLocationProvider } from './useLocationProvider';

export type UserLocationStatus = 'loading' | 'ready' | 'denied' | 'unavailable';

export interface UserLocationState {
  /** `null` mientras se resuelve o si no hay permiso; el repositorio usa su origen por defecto. */
  origin: GeoPoint | null;
  status: UserLocationStatus;
  retry: () => Promise<void>;
}

/** Resuelve la ubicación del usuario sin bloquear el resto del dashboard. */
export function useUserLocation(): UserLocationState {
  const provider = useLocationProvider();
  const isMountedRef = useRef(true);

  const [origin, setOrigin] = useState<GeoPoint | null>(null);
  const [status, setStatus] = useState<UserLocationStatus>('loading');

  const resolve = useCallback(async () => {
    if (!isMountedRef.current) return;
    setStatus('loading');

    try {
      const position = await provider.getCurrentPosition();
      if (!isMountedRef.current) return;
      setOrigin(position);
      setStatus('ready');
    } catch (error) {
      if (!isMountedRef.current) return;
      setOrigin(null);
      setStatus(
        error instanceof LocationError && error.reason === 'permission-denied'
          ? 'denied'
          : 'unavailable',
      );
    }
  }, [provider]);

  useEffect(() => {
    isMountedRef.current = true;
    void resolve();
    return () => {
      isMountedRef.current = false;
    };
  }, [resolve]);

  return { origin, status, retry: resolve };
}
