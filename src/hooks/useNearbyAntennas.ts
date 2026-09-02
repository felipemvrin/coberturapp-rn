import { useCallback, useEffect, useRef, useState } from 'react';

import type { Antenna, GeoPoint } from '../domain/entities';
import { useCoverageRepository } from './useCoverageRepository';
import { useUserLocation, type UserLocationStatus } from './useUserLocation';

export interface NearbyAntennasState {
  antennas: Antenna[];
  loading: boolean;
  error: string | null;
  locationStatus: UserLocationStatus;
  origin: GeoPoint | null;
  retryLocation: () => Promise<void>;
  reload: () => Promise<void>;
}

/** Carga de antenas centrada en la ubicación del usuario, compartida por mapa y dashboard. */
export function useNearbyAntennas(): NearbyAntennasState {
  const repository = useCoverageRepository();
  const { origin, status: locationStatus, retry: retryLocation } = useUserLocation();
  const isMountedRef = useRef(true);

  const [antennas, setAntennas] = useState<Antenna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);

    try {
      const result = await repository.getNearbyAntennas(origin ? { origin } : {});
      if (!isMountedRef.current) return;
      setAntennas(result);
    } catch {
      if (!isMountedRef.current) return;
      setError('No pudimos cargar las antenas cercanas.');
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, [repository, origin]);

  useEffect(() => {
    isMountedRef.current = true;
    void load();
    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  return { antennas, loading, error, locationStatus, origin, retryLocation, reload: load };
}
