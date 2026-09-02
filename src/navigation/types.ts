/** Rutas tipadas: `navigation.navigate('Map')` queda validado por TypeScript. */
export type RootStackParamList = {
  Dashboard: undefined;
  /** `focusAntennaId` centra el mapa en una antena concreta al abrirlo. */
  Map: { focusAntennaId?: string } | undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
