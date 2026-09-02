import React, { createContext, useContext } from 'react';

import { ExpoLocationDataSource } from '../data/datasources/ExpoLocationDataSource';
import type { LocationProvider } from '../domain/repositories';

const defaultProvider: LocationProvider = new ExpoLocationDataSource();

const LocationProviderContext = createContext<LocationProvider>(defaultProvider);

export interface LocationProviderContextProps {
  children: React.ReactNode;
  /** Permite inyectar un doble de prueba o una fuente alternativa. */
  provider?: LocationProvider;
}

export function AppLocationProvider({
  children,
  provider = defaultProvider,
}: LocationProviderContextProps): React.JSX.Element {
  return (
    <LocationProviderContext.Provider value={provider}>{children}</LocationProviderContext.Provider>
  );
}

export function useLocationProvider(): LocationProvider {
  return useContext(LocationProviderContext);
}
