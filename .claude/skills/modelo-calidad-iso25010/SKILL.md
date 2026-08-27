---
name: modelo-calidad-iso25010
description: Checklist de calidad ISO/IEC 25010 interpretado específicamente para webmicomercio (no la definición genérica de la norma). Úsalo como estructura de cualquier revisión o auditoría de código de este repo — cada hallazgo debe poder ubicarse en una de las 8 características.
---

# Modelo de calidad — ISO/IEC 25010 aplicado a webmicomercio

Este documento traduce las 8 características de la norma a lo que
significan concretamente en este repo, con base en el código real (no en
la definición abstracta). Es el checklist que usa `revisor-codigo`, y la
referencia para interpretar cualquier hallazgo de `tester` en términos de
calidad de producto.

## 1. Adecuación funcional

Que el widget cubra el mismo flujo de conversación que ya existe en
Telegram (mismo asistente, otra interfaz), sin backend ni base de datos
propios en este repo.

- **Completitud:** los tres tipos de entrada del usuario (texto, imagen,
  PDF) tienen que llegar al backend con la forma que espera
  (`imageBase64`/`imageMime`, o el PDF convertido a JPEG de su primera
  página). Un cambio que agregue un tipo de adjunto nuevo sin ese mismo
  tratamiento es un hallazgo.
- **Corrección:** el flujo de confirmación (`requires_confirmation: true`
  → botones Confirmar/Cancelar → el siguiente mensaje es el texto plano
  `'SI'`/`'NO'`) tiene que respetarse exactamente como lo espera el backend
  — no es un campo estructurado, es un contrato frágil por convención.
- **Pertinencia:** este repo es solo la interfaz — no debe acumular lógica
  de negocio (validaciones de pedido, reglas de empresa) que le
  corresponde al backend (`auth.micomercio.co`, repo aparte). Un cambio
  que empiece a "decidir" algo de negocio en el frontend es un hallazgo de
  esta característica, no una mejora.

## 2. Eficiencia de desempeño

- El bundle del widget (`dist-widget/chat-widget.js`) se embebe en sitios
  de terceros — su peso afecta directamente el tiempo de carga del sitio
  host, no solo el propio. Una dependencia nueva agregada sin medir su
  impacto en el tamaño del bundle embebible es un hallazgo.
- La conversión de PDF a JPEG (`src/services/pdf.js`, `pdfjs-dist`) corre
  en el navegador del usuario final, no en un servidor — es costo real de
  CPU/memoria del lado del cliente. Está limitado a la primera página por
  diseño; si un cambio empieza a procesar más páginas, revisar el impacto
  en dispositivos de gama baja.
- Sin caché de ningún tipo (no hay nada que cachear — cada mensaje es una
  request nueva al backend), no aplica aquí como sí aplica en
  `micomercio_bi_dashboard`.

## 3. Compatibilidad

- **Coexistencia con el sitio host:** el bundle del widget se inyecta
  dentro del DOM de un sitio de un tercero — cualquier estilo o clase CSS
  nueva sin *namespacing* claro puede colisionar con el CSS del host o
  heredar estilos no deseados de él. Es la forma más probable en que este
  proyecto rompe algo fuera de su propio código.
- **Interoperabilidad:** contrato JSON simple (`{ message,
  requires_confirmation }`) con el backend — cualquier campo nuevo que el
  frontend empiece a asumir sin que el backend lo devuelva todavía es un
  hallazgo (se rompe en silencio, sin TypeScript que lo detecte).
- Los dos builds (`dist` app, `dist-widget` embebible) comparten el mismo
  código fuente — una dependencia o API del navegador que exista en el
  contexto de la app normal pero no se pueda asumir en cualquier sitio
  host de un tercero (ej. asumir que existe cierto elemento del DOM fuera
  del propio widget) es un hallazgo específico de compatibilidad del
  build embebible.

## 4. Usabilidad

- Confirmación explícita con botones antes de una acción irreversible
  (`requires_confirmation`), adjuntar imagen/PDF con feedback visual.
- **Manejo de error plano, ya documentado como gap:** cualquier falla de
  red (4xx, 5xx, timeout, sin conexión) cae en el mismo mensaje genérico
  `"❌ Error de conexión. Intenta de nuevo."` — no es responsabilidad de
  un diff puntual resolver esto salvo que el Issue lo pida explícitamente,
  pero si un cambio nuevo agrega un caso de error, debe seguir el mismo
  patrón existente, no inventar uno nuevo inconsistente.
- No hay evidencia en el código de atributos de accesibilidad (`aria-*`,
  navegación por teclado del chat) — no auditado, tratar como desconocido,
  no como "cumple".

## 5. Fiabilidad

- **Madurez:** sin tests automatizados y sin backend local contra el cual
  probar (a diferencia de `micomercio_bi_dashboard`) — el subagente
  `tester` prueba lint + los dos builds + interacción manual en navegador;
  el tramo que depende de una respuesta real de `auth.micomercio.co` no
  se puede verificar de punta a punta desde este repo.
- **Tolerancia a fallos:** un estado de `loading` que puede quedar
  trabado en `true` si una request falla a mitad de camino sin pasar por
  el `catch` es un hallazgo — el chat debe seguir usable después de un
  error, nunca quedar bloqueado.
- **Recuperabilidad:** no hay reintentos automáticos si una request
  falla — el usuario tiene que reintentar manualmente. Aceptado como
  estado actual, no deuda a corregir de forma oportunista.

## 6. Seguridad

Interpretación de los 20 puntos de `estandares-seguridad-fabrica` (el
estándar genérico de la fábrica) aplicados a este repo concreto — un
frontend puro, embebido en sitios de terceros, sin backend ni base de
datos propios:

| # | Punto | Estado en este repo |
|---|---|---|
| 1 | Oculta claves API | ❌ **Gap conocido, con historial real:** `VITE_API_TOKEN` queda embebido en texto dentro del bundle final (`dist`/`dist-widget`) — cualquiera que inspeccione el JS servido lo puede extraer, es inherente a que este repo no tiene backend propio que guarde el secreto. Además, el `.env` real (con un token productivo) quedó commiteado en el historial del repo original — deuda ya señalada aparte, no repetirla como hallazgo nuevo salvo que el diff la toque directamente. |
| 2 | Elimina secretos de Git | ⚠️ Mismo gap que el punto 1 (`.env` commiteado en el historial original) — ya registrado, no es un hallazgo nuevo salvo que un diff agregue un secreto adicional. |
| 3 | Clave de DB con privilegio mínimo | **No aplica** — sin base de datos en este repo. |
| 4 | RLS | **No aplica** — sin base de datos en este repo. |
| 5 | Cifra datos sensibles | **No aplica directamente** (no persiste nada), pero el mensaje y los adjuntos del usuario viajan como texto/base64 hacia el backend — la protección real es el transporte (ver punto 19), no cifrado propio de este repo. |
| 6 | Fuerza autenticación del servidor | **No aplica a este repo por diseño** — la autenticación real es responsabilidad de `auth.micomercio.co` (repo aparte); este código solo adjunta el token estático a cada request. |
| 7 | Restringe acceso a registros | **No aplica** — sin registros ni base de datos en este repo; el aislamiento por `IdEmpresa`/`IdSucursal`/`IdCaja` lo debe hacer el backend con lo que este código le manda, no este repo. |
| 8 | Bloquea manipulación de campos | ⚠️ **Gap sin evaluar:** los valores de contexto (`IdEmpresa`, `IdSucursal`, etc.) vienen de `window.MICOMERCIO_CHAT_CONFIG`, inyectado por el sitio host — este código no valida su forma antes de mandarlos; confía en que el host los inyectó bien y en que el backend los valida al recibirlos. No es responsabilidad de este repo resolverlo, pero sí señalarlo si un cambio nuevo agrega un campo de contexto sin la misma cautela. |
| 9 | Protege cookies de sesión | **No aplica** — sin sesión ni cookies en este repo. |
| 10 | Hashea contraseñas | **No aplica** — sin manejo de contraseñas en este repo. |
| 11 | Limita intentos de login | **No aplica** — sin login en este repo. |
| 12 | Protección contra bots | **No aplica a este repo** — responsabilidad del backend, no del frontend. |
| 13 | Monitorea consultas de DB | **No aplica** — sin base de datos en este repo. |
| 14 | Valida todas las entradas | ⚠️ **Gap sin evaluar:** no hay evidencia documentada de límite de tamaño/tipo estricto en los adjuntos (imagen/PDF) antes de mandarlos al backend — señalar si un cambio nuevo toca `src/services/pdf.js` o el flujo de adjuntos sin agregar esa validación. |
| 15 | Escapa contenido del usuario | ⚠️ **El de mayor riesgo real de este proyecto:** cualquier mensaje del bot, `nombre_empresa` u otro texto dinámico insertado con `dangerouslySetInnerHTML` o manipulación directa del DOM (en vez de dejar que React lo renderice como texto) es un hallazgo crítico — este widget se embebe en sitios de clientes reales, el radio de impacto de un XSS acá es mayor que en una herramienta interna como `micomercio_bi_dashboard`. |
| 16 | Restringe subida de archivos | ⚠️ Parcial — acepta imágenes y PDF (primera página convertida a JPEG), sin límite de tamaño de archivo documentado en `CLAUDE.md`. Señalar como gap a verificar si se toca el flujo de adjuntos. |
| 17 | Limita respuestas de API | **No aplica a este repo** — es cliente, no servidor; es responsabilidad de `auth.micomercio.co`. |
| 18 | Cabeceras de seguridad HTTP | **No aplica a este repo** — no sirve HTTP propio, es un bundle estático embebido; las cabeceras del sitio host son responsabilidad de ese sitio, no de este código. |
| 19 | Fuerza HTTPS | ⚠️ El default hardcodeado (`https://auth.micomercio.co`) ya es HTTPS, pero nada en el código valida que una URL provista vía `MICOMERCIO_CHAT_CONFIG`/`VITE_*` sea HTTPS — un sitio host mal configurado podría forzar HTTP sin que el widget lo impida. Gap menor, no evaluado en profundidad. |
| 20 | Escanea dependencias | ❌ **Gap confirmado, deuda conocida:** sin Dependabot ni `npm audit` en CI — de hecho este repo no tiene ningún `.github/workflows` de CI/CD propio más allá de los de la fábrica (ver `CLAUDE.md`). |

## 7. Mantenibilidad

- **Modularidad:** componentes funcionales con hooks, sin Redux ni estado
  global — todo vive en `useState`/`useRef` de `ChatWindow.jsx`. Buena
  separación entre UI (`src/components/`) y acceso a red
  (`src/services/api.js`, `src/services/pdf.js`).
- **Analizabilidad:** sin TypeScript, el contrato de campos con el backend
  (`message`, `requires_confirmation`) es solo por convención — nada lo
  valida en build. Un rename o un campo nuevo mal escrito se rompe en
  silencio.
- **Modificabilidad:** la cascada de configuración de tres niveles
  (`window.MICOMERCIO_CHAT_CONFIG` → `VITE_*` → default) es el patrón a
  seguir para cualquier config nueva — un cambio que la rompa o la
  bypasee es un hallazgo de esta característica.
- **Capacidad de prueba:** cero tests automatizados, y sin backend local
  contra el cual probar de punta a punta (a diferencia de
  `micomercio_bi_dashboard`, que sí tiene Postgres local). Aceptado como
  estado actual, no deuda a corregir de forma oportunista en cada cambio.
- Este repo sí tiene ESLint configurado (`eslint-plugin-react-hooks`) — a
  diferencia de otros proyectos de la fábrica, un error de lint acá es
  siempre un hallazgo, no una preferencia de estilo.

## 8. Portabilidad

- **Adaptabilidad:** la cascada de configuración de tres niveles es
  justamente el mecanismo de portabilidad de este proyecto — el mismo
  bundle sirve para cualquier sitio host que inyecte su propia
  `window.MICOMERCIO_CHAT_CONFIG` antes de cargarlo.
- **Instalabilidad:** dos builds (`npm run build`, `npm run build:widget`)
  con configuraciones de Vite separadas — no hay CI/CD de despliegue
  documentado en este repo (a diferencia de `micomercio_bi_dashboard`,
  que sí tiene `deploy-main.yml`); cómo y dónde se publica `dist`/
  `dist-widget` hoy es manual o externo a este repo.
- **Reemplazabilidad:** acoplado al contrato de respuesta de
  `auth.micomercio.co` — cambiar ese contrato (o de backend) implica
  coordinar el repo del backend también, no solo este.

## Cómo usar este checklist

Cualquier hallazgo de una revisión de código debe poder etiquetarse con una
de estas 8 características. Si un hallazgo no encaja en ninguna, probablemente
no es un hallazgo de calidad de producto sino una preferencia de estilo —
tratarlo aparte, con menor prioridad.
