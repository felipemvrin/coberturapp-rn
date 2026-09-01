/** Rutas tipadas: `navigation.navigate('Map')` queda validado por TypeScript. */
export type RootStackParamList = {
  Dashboard: undefined;
  Map: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
