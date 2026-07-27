# AGENTS.md

Guia rapida del proyecto para agentes/IA que trabajen aca despues.

## Que es

App de gestion de turnos para barberias/negocios con citas ("turnos-app"): agenda sin
sobreturnos, clientes, servicios, recordatorios y confirmaciones por WhatsApp. SPA
100% client-side, sin backend: todo el estado vive en `localStorage` del navegador.

## Stack

- React 18 + Vite 5 (JSX, no TypeScript aunque estan instalados `@types/react*`).
- React Router v7 en modo `HashRouter` (rutas tipo `/#/agenda`).
- Tailwind CSS 3 + PostCSS/Autoprefixer. Dark mode por clase (`darkMode: "class"`).
- Iconos: `lucide-react`. Fechas: `date-fns`.
- Node: **24.x** (ver `.nvmrc` y `engines` en `package.json`; antes fallaba el deploy
  en Vercel porque no estaba fijado y usaba el 16.x deprecado).

## Scripts

```
npm run dev       # vite dev server
npm run build     # build de produccion a dist/
npm run preview   # sirve el build localmente
```

No hay lint ni tests configurados todavia.

## Estructura

```
src/
  App.jsx              # rutas (HashRouter) envueltas en <DataProvider>
  main.jsx              # entry point
  context/DataContext.jsx  # UNICA fuente de estado global (ver abajo)
  lib/
    storage.js          # useLocalStorage hook, seeds iniciales, migracion de datos legacy
    time.js             # helpers de fecha/hora, calculo de slots libres, deteccion de superposicion
    whatsapp.js         # arma links wa.me y mensajes (confirmacion, recall, cumpleanios)
  hooks/useDesktopReminders.js  # notificaciones de escritorio (Notification API)
  components/
    layout/Layout.jsx
    dashboard/DashboardView.jsx
    agenda/            # AgendaView, AppointmentModal, AppointmentRow, OccupancyBar
    clientes/          # ClientesView, ClienteModal
    servicios/         # ServiciosView, ServicioModal
    recordatorios/RecordatoriosView.jsx
    ajustes/AjustesView.jsx
    ui/                # Badge, Button, Card, EmptyState, Field, Modal (componentes genericos)
```

## Modelo de datos (todo en `localStorage`, claves `bc_*`)

- `bc_clients`: `{ id, nombre, telefono, email, notas, fechaNacimiento, creadoEl }`
- `bc_services`: `{ id, nombre, duracionMin, precio, intervaloRecomendadoDias, color }`
- `bc_staff`: `{ id, nombre, activo, color }`
- `bc_appointments`: `{ id, clienteId, servicioId, barberoId, fecha, horaInicio, duracionMin, estado, notas, creadoEl, recordatorioEnviadoEl }`
  - `estado`: `"confirmado" | "completado" | ...`
- `bc_settings`: nombre del negocio, moneda, horario de apertura/cierre, intervalo de
  slots, dias laborales, codigo de pais para WhatsApp, dias de anticipacion de
  recordatorio, notificaciones de escritorio.
- `bc_recall_snoozes`: pospone el aviso de "recall" (recordatorio de volver) por cliente+servicio.

Hay migracion automatica (`migrarDatosLegacy` en `storage.js`) desde una version vieja
que guardaba todo bajo la key `clientes`, marcada como hecha con `bc_migrado_v2`.

Toda la logica de negocio (evitar sobreturnos, calcular slots libres, turnos de manana,
recalls vencidos, cumpleanios proximos, estadisticas del dia) vive en
`DataContext.jsx` y se consume via el hook `useData()`.

## Detalles no obvios

- **Sin backend/API**: nada se sincroniza entre dispositivos; exportar/importar datos
  es JSON manual (`exportData`/`importData` en `DataContext`).
- **WhatsApp**: se arman links `https://wa.me/<numero>?text=...`, no hay integracion
  con la API oficial de WhatsApp Business. El telefono se normaliza sacando todo lo
  que no sea digito y anteponiendo el codigo de pais si el numero tiene <=10 digitos.
- **Anti-sobreturno**: `addAppointment`/`updateAppointment` tiran error si hay
  superposicion de horario para el mismo barbero (`haySuperposicion` en `lib/time.js`).
- **Recalls**: se calculan comparando la fecha del ultimo turno completado de un
  cliente para un servicio contra `intervaloRecomendadoDias` de ese servicio.
- **Idioma**: UI y nombres de variables/funciones en espanol (rioplatense, sin tildes
  en la mayoria de los strings). Mantener consistencia con eso al agregar codigo.

## Deploy

- Sin `vercel.json` propio; se infiere config de Vite. Confirmar en el dashboard de
  Vercel (Project Settings > General > Node.js Version) que quede en **24.x**, ademas
  del `engines` de `package.json`, porque el selector del dashboard suele pisar el de
  package.json.
