import React, { createContext, useContext } from 'react';

import { ExpoHeadingDataSource } from '../data/datasources/ExpoHeadingDataSource';
import type { HeadingProvider } from '../domain/repositories';

const defaultProvider: HeadingProvider = new ExpoHeadingDataSource();

const HeadingProviderContext = createContext<HeadingProvider>(defaultProvider);

export interface AppHeadingProviderProps {
  children: React.ReactNode;
  provider?: HeadingProvider;
}

export function AppHeadingProvider({
  children,
  provider = defaultProvider,
}: AppHeadingProviderProps): React.JSX.Element {
  return (
    <HeadingProviderContext.Provider value={provider}>{children}</HeadingProviderContext.Provider>
  );
}

export function useHeadingProvider(): HeadingProvider {
  return useContext(HeadingProviderContext);
}
