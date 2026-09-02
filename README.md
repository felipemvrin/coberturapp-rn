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
- Acción **"Ver mapa de cobertura"**; tocar una antena abre el mapa centrado en ella
- Pull to refresh

## Mapa

Usa `react-native-maps` con **Google Maps en Android e iOS** (`PROVIDER_GOOGLE`).
Muestra un marcador por antena, coloreado según la tecnología, y la posición del
usuario cuando hay permiso concedido.

`react-native-maps` viene incluido en Expo Go, por lo que **no requiere ninguna
configuración para desarrollo**.

### API keys (sólo al compilar el binario)

Al generar un development build o publicar en las tiendas, Google Maps sí exige
credenciales:

1. En [Google Cloud](https://console.cloud.google.com/apis), habilita **Maps SDK for
   Android** y **Maps SDK for iOS**.
2. Crea una API key por plataforma, restringida al `android.package` y al
   `ios.bundleIdentifier` declarados en [app.json](app.json).
3. Añade el plugin a `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "androidGoogleMapsApiKey": "TU_API_KEY_ANDROID",
          "iosGoogleMapsApiKey": "TU_API_KEY_IOS"
        }
      ]
    ]
  }
}
```

El plugin **no está declarado todavía** de forma deliberada: un config plugin
innecesario ya rompió el arranque del proyecto en el pasado.

## Geolocalización

La app pide permiso de ubicación **en primer plano** al abrirse y, con la posición
real, recalcula la distancia y el rumbo hacia cada antena (Haversine).

El permiso **no es bloqueante**: si se deniega o el GPS falla, el dashboard sigue
funcionando con un origen por defecto y muestra un aviso con opción de reintentar.

La fuente de ubicación está detrás de la interfaz `LocationProvider`, igual que el
repositorio de cobertura, por lo que los tests inyectan un doble y nunca tocan
`expo-location`.

| Pieza                    | Rol                                       |
| ------------------------ | ----------------------------------------- |
| `LocationProvider`       | Contrato de dominio                       |
| `ExpoLocationDataSource` | Implementación real sobre `expo-location` |
| `useUserLocation`        | Estado de permiso y posición              |
| `LocationNotice`         | Aviso y reintento en la UI                |

## Brújula

Al pulsar **"Buscar mejor señal"**, la tarjeta de sugerencia muestra una flecha que
apunta físicamente hacia la antena, combinando su rumbo geográfico con la
orientación del dispositivo (`relativeBearing`).

Se lee el **magnetómetro** directamente en vez de `Location.watchHeadingAsync`,
porque este último exige permiso de ubicación y la brújula debe funcionar sin él.

Si el dispositivo no tiene magnetómetro, la flecha se sustituye por el punto
cardinal (N, NE, E…). La suscripción sólo está activa mientras hay una antena que
señalar, para no consumir batería de forma innecesaria.

| Pieza                   | Rol                                      |
| ----------------------- | ---------------------------------------- |
| `HeadingProvider`       | Contrato de dominio                      |
| `ExpoHeadingDataSource` | Implementación real sobre `expo-sensors` |
| `useHeading`            | Suscripción al rumbo del dispositivo     |
| `DirectionArrow`        | Flecha rotada, con respaldo cardinal     |

## Pruebas

```bash
npm test
```

## Próximos pasos

- **Datos reales de cobertura**: crear `ApiCoverageRepository` implementando
  `CoverageRepository` y registrarlo en [src/data/index.ts](src/data/index.ts).
  Es el último `TODO` que queda en el código.
- **Mejor flujo de búsqueda de señal**: centrar el mapa en la antena sugerida al
  pulsar la tarjeta de resultado.
