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

> **Importante:** este proyecto está fijado a **Expo SDK 54**. Ver
> [Compatibilidad con Expo Go](#compatibilidad-con-expo-go) antes de actualizar.

## Cómo ejecutar

```bash
npm install
npx expo start
```

Luego escanea el código QR con Expo Go, o pulsa `i` (iOS), `a` (Android) o `w` (web)
en la terminal.

## Compatibilidad con Expo Go

Expo Go sólo puede ejecutar proyectos del SDK cuyo runtime trae embebido. Si el
proyecto usa un SDK más nuevo que el de la app instalada, al escanear el QR aparece:

> Project is incompatible with this version of Expo Go.

Por eso el proyecto está fijado al **SDK 54** y no al más reciente. **No actualices
el SDK** sin verificar antes qué versión soporta tu Expo Go.

Para comprobar qué SDK anuncia el servidor de desarrollo:

```bash
curl -s -H "Expo-Platform: ios" -H "Accept: application/expo+json,application/json" \
  http://127.0.0.1:8081 | node -pe "JSON.parse(require('fs').readFileSync(0)).extra.expoClient.sdkVersion"
```

Y qué versión de Expo Go exige cada SDK:

```bash
curl -s https://api.expo.dev/v2/versions/latest | node -pe \
  "Object.entries(JSON.parse(require('fs').readFileSync(0)).data.sdkVersions).map(([k,v])=>k+' -> '+v.iosClientVersion).join('\n')"
```

Si necesitas un SDK más nuevo que el que soporta Expo Go, la alternativa es un
**development build** (`npx expo run:ios`), que instala la app con su propio
runtime y elimina esta dependencia de la App Store.

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

## Pruebas

```bash
npm test
```

La primera ejecución tras reinstalar dependencias puede fallar por timeout: la
transformación inicial de Babel supera los 5 s por defecto de Jest. Vuelve a
ejecutarlo y pasará con la caché ya construida.

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
