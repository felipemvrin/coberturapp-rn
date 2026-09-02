# CoberturApp (React Native + Expo)

App para consultar y entender la cobertura móvil en Chile. Esta es la migración del
proyecto original en Flutter a **React Native con Expo y TypeScript**, manteniendo la
misma separación por capas (presentación / dominio / datos).

Hoy funciona con **datos simulados (mock)**; la arquitectura ya está preparada para
enchufar datos reales sin tocar la UI.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- App **Expo Go** en tu teléfono, o un simulador de iOS / emulador de Android

## Cómo ejecutar

```bash
npm install
npx expo start
```

Luego escanea el código QR con Expo Go, o pulsa `i` (iOS), `a` (Android) o `w` (web)
en la terminal.

## Scripts

| Comando             | Descripción                                        |
| ------------------- | -------------------------------------------------- |
| `npm start`         | Inicia el servidor de desarrollo de Expo           |
| `npm run ios`       | Abre la app en el simulador de iOS                 |
| `npm run android`   | Abre la app en el emulador de Android              |
| `npm test`          | Ejecuta las pruebas con Jest                       |
| `npm run typecheck` | Verifica los tipos con TypeScript en modo estricto |
| `npm run lint`      | Analiza el código con ESLint                       |
| `npm run format`    | Formatea el código con Prettier                    |

## Estructura de carpetas

```
App.tsx                  Punto de entrada (equivalente a lib/main.dart)
index.ts                 Registro del componente raíz en Expo
src/
  screens/               Pantallas          (equivalente a presentation/)
  components/            Componentes reutilizables de UI
  domain/                Entidades, contratos y reglas de negocio (domain/)
  data/                  Repositorios y datasources mock (data/)
    datasources/         Datos simulados
    repositories/        Implementaciones del contrato de dominio
  navigation/            Stack de navegación tipado
  hooks/                 Hooks y providers de estado
  theme/                 Tokens de diseño y theming claro/oscuro
__tests__/               Pruebas con Jest + React Native Testing Library
```

## Arquitectura

El flujo de datos es unidireccional y las dependencias apuntan siempre hacia el dominio:

```
screens ──> hooks ──> CoverageRepository (interfaz de dominio)
                              ▲
                              └── MockCoverageRepository (implementación actual)
```

- **`src/domain`** no depende de React ni de ninguna librería: sólo tipos y reglas puras
  (`barsFromDbm`, `directionFromBearing`, `formatDistance`), fáciles de testear.
- **`CoverageRepository`** es el único contrato que conoce la UI. Cambiar de mock a API real
  significa cambiar una línea en [src/data/index.ts](src/data/index.ts).
- **`CoverageRepositoryProvider`** inyecta el repositorio por contexto, lo que permite usar
  dobles de prueba en los tests sin mockear módulos.
- **`useCoverageDashboard`** concentra el estado (carga, refresco, búsqueda de mejor señal),
  dejando la pantalla declarativa.
- El **theming propio** con tokens (`colors`, `spacing`, `radius`, `typography`) sigue el
  espíritu de Material 3 sin añadir dependencias nativas, y responde al modo claro/oscuro
  del sistema.

## Pantalla principal

- Card de estado de conexión (operador + tecnología)
- Indicador visual de calidad de señal (4 barras + dBm)
- Lista de antenas cercanas con `FlatList` (nombre, operador, distancia y dirección)
- Acción **"Buscar mejor señal"** con estado de carga simulado
- Pull to refresh

## Próximos pasos

Los puntos de extensión ya están definidos (busca los comentarios `TODO` en el código):

- **Datos reales de cobertura**: crear `ApiCoverageRepository` implementando
  `CoverageRepository` y registrarlo en [src/data/index.ts](src/data/index.ts).
- **Mapa interactivo**: `react-native-maps` en [src/screens/MapScreen.tsx](src/screens/MapScreen.tsx),
  usando `Antenna.position`.
- **GPS y orientación**: implementar `LocationProvider` con `expo-location` y
  `HeadingProvider` con `expo-sensors` (ver [src/domain/repositories.ts](src/domain/repositories.ts)).
- **Mejor flujo de búsqueda de señal**: enriquecer `findBestSignal` con datos reales y
  navegación al mapa.
