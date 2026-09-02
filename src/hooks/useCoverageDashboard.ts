import { useCallback, useEffect, useRef, useState } from 'react';

import type { BestSignalSuggestion, CoverageSnapshot } from '../domain/entities';
import { useCoverageRepository } from './useCoverageRepository';

export interface CoverageDashboardState {
  snapshot: CoverageSnapshot | null;
  loading: boolean;
  refreshing: boolean;
  searchingBestSignal: boolean;
  bestSignal: BestSignalSuggestion | null;
  error: string | null;
  refresh: () => Promise<void>;
  findBestSignal: () => Promise<void>;
}

/**
 * Orquesta el estado del dashboard. La pantalla queda declarativa y el
 * origen de los datos es intercambiable vía `CoverageRepositoryProvider`.
 */
export function useCoverageDashboard(): CoverageDashboardState {
  const repository = useCoverageRepository();
  const isMountedRef = useRef(true);

  const [snapshot, setSnapshot] = useState<CoverageSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchingBestSignal, setSearchingBestSignal] = useState(false);
  const [bestSignal, setBestSignal] = useState<BestSignalSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!isMountedRef.current) return;
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        // TODO: pasar `origin` desde el LocationProvider (expo-location).
        const nextSnapshot = await repository.getCoverageSnapshot();
        if (!isMountedRef.current) return;
        setSnapshot(nextSnapshot);
      } catch {
        if (!isMountedRef.current) return;
        setError('No pudimos obtener el estado de cobertura. Inténtalo nuevamente.');
      } finally {
        if (!isMountedRef.current) return;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [repository],
  );

  useEffect(() => {
    isMountedRef.current = true;
    queueMicrotask(() => {
      void load('initial');
    });
    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  const findBestSignal = useCallback(async () => {
    setSearchingBestSignal(true);
    setError(null);
    setBestSignal(null);
    try {
      const suggestion = await repository.findBestSignal();
      if (!isMountedRef.current) return;
      setBestSignal(suggestion);
    } catch {
      if (!isMountedRef.current) return;
      setBestSignal(null);
      setError('No pudimos completar la búsqueda de mejor señal.');
    } finally {
      if (!isMountedRef.current) return;
      setSearchingBestSignal(false);
    }
  }, [repository]);

  return {
    snapshot,
    loading,
    refreshing,
    searchingBestSignal,
    bestSignal,
    error,
    refresh,
    findBestSignal,
  };
}
