import React from 'react';
import { View } from 'react-native';

// react-native-maps no funciona bajo Jest: se sustituye por vistas planas.
export const PROVIDER_GOOGLE = 'google';

export const Marker = (props: Record<string, unknown>) => <View {...props} />;

const MapView = ({ children, ...props }: { children?: React.ReactNode }) => (
  <View {...props}>{children}</View>
);

export default MapView;
