import React, { createContext, useContext } from 'react';

import { coverageRepository as defaultRepository } from '../data';
import type { CoverageRepository } from '../domain/repositories';

const CoverageRepositoryContext = createContext<CoverageRepository>(defaultRepository);

export interface CoverageRepositoryProviderProps {
  children: React.ReactNode;
  /** Permite inyectar un doble de prueba o, a futuro, la implementación real. */
  repository?: CoverageRepository;
}

export function CoverageRepositoryProvider({
  children,
  repository = defaultRepository,
}: CoverageRepositoryProviderProps): React.JSX.Element {
  return (
    <CoverageRepositoryContext.Provider value={repository}>
      {children}
    </CoverageRepositoryContext.Provider>
  );
}

export function useCoverageRepository(): CoverageRepository {
  return useContext(CoverageRepositoryContext);
}
