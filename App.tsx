import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CoverageRepositoryProvider } from './src/hooks';
import { RootNavigator } from './src/navigation';
import { ThemeProvider } from './src/theme';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CoverageRepositoryProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </CoverageRepositoryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
