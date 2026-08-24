# webmicomercio (micomercio-webchat)

## Qué es este proyecto

Widget de chat embebible de MiComercio — la interfaz web del mismo
asistente que ya existe en Telegram (ver el proyecto hermano
`chatbot-saas`/`micomercio-chat` en el ecosistema MiComercio). Es un
frontend puro: no tiene backend propio, no tiene base de datos, no
persiste nada — todo el mensaje/estado vive en memoria del componente
React mientras la conversación está abierta.

- **Stack:** React 19 + Vite 8, JavaScript puro (sin TypeScript), sin
  framework de estilos (CSS plano en `src/styles.css`).
- **Dos builds distintos, del mismo código:**
  - `npm run dev` / `npm run build` → app normal (`index.html` →
    `src/main.jsx` → `dist/`), para probar en desarrollo.
  - `npm run build:widget` → bundle IIFE embebible (`src/widget.jsx` →
    `dist-widget/chat-widget.js`, config en `vite.config.widget.js`), con
    `vite-plugin-css-injected-by-js` para que el CSS quede inyectado
    dentro del JS — pensado para pegarse con un `<script>` en cualquier
    sitio de un cliente de MiComercio, sin depender de un `<link>` aparte.
- **Backend:** ninguno en este repo. Todo el tráfico va a
  `POST {API_URL}/webchat/message` — por defecto `https://auth.micomercio.co`
  (el servicio `micomercio-autenticacion`), configurable.
- **Auth:** un solo token Bearer estático (`VITE_API_TOKEN`), no hay login
  de usuario en este repo.

## Multi-tenant: cómo se identifica la empresa/sucursal

No hay `siteId` como en el dashboard — acá la identificación va por
`sender_id`, `IdEmpresa`, `IdSucursal`, `IdCaja`, `IdUser`,
`nombre_empresa` (ver `getSessionContext()` en `src/services/api.js`).
Estos valores salen de `window.MICOMERCIO_CHAT_CONFIG`, que el sitio del
cliente inyecta antes de cargar `chat-widget.js` — el widget no sabe nada
de la empresa hasta que el host se lo pasa por esa variable global.

## Convenciones de código identificadas

- **Prioridad de configuración en tres niveles**, siempre en este orden
  (ver `src/services/api.js`): `window.MICOMERCIO_CHAT_CONFIG` (embebido
  en un sitio real) → `import.meta.env.VITE_*` (desarrollo local) →
  default hardcodeado (`https://auth.micomercio.co`). Cualquier config
  nueva que se agregue debe seguir esta misma cascada, no una nueva.
- **Componentes funcionales con hooks**, sin clases, sin Redux ni ningún
  estado global — todo vive en `useState`/`useRef` de `ChatWindow.jsx`.
- **Contrato de respuesta del backend:** `{ message, requires_confirmation }`.
  Si `requires_confirmation` es `true`, la UI muestra botones
  Confirmar/Cancelar y el siguiente mensaje que se envía es el texto plano
  `'SI'` o `'NO'` — no un campo estructurado. Cualquier cambio de este
  contrato en el frontend tiene que mantenerse en sincronía con lo que
  espera el backend de `auth.micomercio.co` (repo aparte).
- **Adjuntos:** imágenes se mandan como `imageBase64`/`imageMime` leídos
  con `FileReader`. Los PDF **no se mandan como PDF** — se renderiza la
  primera página a JPEG en el cliente (`src/services/pdf.js`, con
  `pdfjs-dist`) y se manda igual que una imagen. Si un PDF tiene
  información relevante más allá de la primera página, hoy se pierde — es
  una limitación conocida, no un bug a "corregir" sin que te lo pidan.
- **Manejo de errores plano:** cualquier falla de red cae en el mismo
  mensaje genérico `"❌ Error de conexión. Intenta de nuevo."` — no hay
  distinción entre 4xx/5xx/timeout todavía.
- **ESLint sí está configurado** (`eslint.config.js`, con
  `eslint-plugin-react-hooks`) — correr `npm run lint` antes de dar un
  cambio por terminado. A diferencia de `micomercio_bi_dashboard`, acá si
  hay que respetar reglas de lint.

## Lo que no hay todavía (no asumir que existe)

- Sin tests automatizados de ningún tipo.
- Sin TypeScript.
- Sin backend/base de datos en este repo — cualquier cambio que "necesite"
  guardar algo del lado del servidor es trabajo del repo de
  `auth.micomercio.co`, no de este.
- Sin CI/CD configurado (no hay `.github/workflows` de deploy) — cómo y
  dónde se despliega `dist`/`dist-widget` hoy es manual o externo a este
  repo.
- **`.env` está commiteado en el repo con un token real** — problema de
  seguridad conocido y ya señalado aparte, no forma parte del alcance de
  un cambio a menos que se pida explícitamente rotarlo.
