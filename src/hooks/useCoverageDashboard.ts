import { useCallback, useEffect, useState } from 'react';

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

  const [snapshot, setSnapshot] = useState<CoverageSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchingBestSignal, setSearchingBestSignal] = useState(false);
  const [bestSignal, setBestSignal] = useState<BestSignalSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        // TODO: pasar `origin` desde el LocationProvider (expo-location).
        setSnapshot(await repository.getCoverageSnapshot());
      } catch {
        setError('No pudimos obtener el estado de cobertura. Inténtalo nuevamente.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [repository],
  );

  useEffect(() => {
    let active = true;
    void (async () => {
      if (active) await load('initial');
    })();
    return () => {
      active = false;
    };
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  const findBestSignal = useCallback(async () => {
    setSearchingBestSignal(true);
    setError(null);
    try {
      setBestSignal(await repository.findBestSignal());
    } catch {
      setError('No pudimos completar la búsqueda de mejor señal.');
    } finally {
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
