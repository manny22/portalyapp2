# Janora Web

Janora Web es el frontend de una aplicación de administración y control de acceso para propiedades residenciales. Este repositorio contiene únicamente la aplicación web React; el backend que atiende las operaciones HTTP es externo a este código.

## Funcionalidad actual

La interfaz contiene flujos para:

- autenticación y manejo de sesión;
- tablero de indicadores;
- residentes;
- unidades y bloques residenciales;
- visitantes y autorizaciones de visita;
- registro de entradas y salidas;
- vehículos y mascotas;
- administración de usuarios;
- reportes;
- configuración.

Los roles modelados actualmente son `SUPER_ADMIN`, `PROPERTY_ADMIN`, `SECURITY_GUARD` y `RESIDENT`.

> **Importante:** las reglas de visibilidad por rol del frontend mejoran la experiencia de usuario, pero no sustituyen la autorización del backend.

## Funcionalidad crítica

### Autenticación y sesión

`src/infrastructure/adapters/http/base-http-client.ts` centraliza el envío del token `Bearer`. La sesión se lee de `sessionStorage` con la clave `auth_session`. Ante una respuesta HTTP `401`, el cliente elimina la sesión y redirige a `/login`.

No deben registrarse tokens, contraseñas ni datos personales sensibles en logs o mensajes de diagnóstico.

### Separación por propiedad

Varios DTO, consultas y pantallas utilizan `propertyId`. Existe un valor de desarrollo `APP_CONFIG.DEFAULT_PROPERTY_ID = 'prop-001'`; este valor no debe interpretarse como una garantía de aislamiento multi-tenant ni propagarse a nueva lógica de dominio sin validar el contrato real del backend.

### Control de acceso en interfaz

`src/shared/hooks/usePermissions.ts` define la visibilidad de rutas por rol. `src/app/router.tsx` protege autenticación, pero actualmente no aplica autorización por rol a cada ruta. Cualquier cambio de rutas debe revisar en conjunto router, navegación y permisos.

## Arquitectura

El código sigue predominantemente un enfoque de **Ports and Adapters / Clean Architecture** para el frontend:

```text
src/
├── app/                       # providers y composición del router
├── core/
│   ├── domain/                # modelos, value objects y puertos
│   └── application/use-cases # casos de uso
├── infrastructure/
│   ├── adapters/http/         # implementaciones HTTP de los puertos
│   └── di/container.ts        # composition root
├── shared/
│   ├── config/
│   ├── constants/
│   ├── hooks/features/        # adaptación de casos de uso/datos a React
│   └── lib/
└── ui/
    ├── atoms/
    ├── molecules/
    ├── organisms/
    ├── templates/
    └── pages/
```

Dirección esperada de dependencias:

```text
UI / hooks -> application use cases -> domain ports
                    ^                    |
                    |                    v
              DI composition <- HTTP adapters
```

La composición concreta se realiza en `src/infrastructure/di/container.ts`.

### Patrones y paradigma

Patrones observados en el repositorio:

- Ports and Adapters / Dependency Inversion para acceso a datos.
- Use Case para orquestación de comportamiento de aplicación.
- Repository ports con adaptadores HTTP concretos.
- Dependency Injection manual mediante un composition root.
- Atomic Design en los componentes de interfaz.
- Hooks para integración con React.
- TanStack Query para buena parte del estado remoto.
- React Hook Form + Zod en formularios no triviales.

El frontend usa el modelo declarativo de React y flujos asíncronos basados en Promises/TanStack Query. El repositorio no contiene RxJS ni evidencia de un paradigma reactivo basado en Reactive Streams.

### Excepciones/deuda técnica conocida

Estas implementaciones existen, pero no deben tomarse como patrón para código nuevo:

- `CreatePetUseCase` depende de una constante/regla ubicada en `src/shared`, introduciendo una dependencia desde `core` hacia una capa exterior.
- `ResidentialUnitsPage` accede directamente al contenedor DI.
- `useResidentialBlocks` y `useResidentialUnits` realizan fetching manual con `useEffect` en vez del patrón dominante con TanStack Query.
- `/residential-units` existe en el router, pero no está presente en `ROUTE_PERMISSIONS` ni en `src/shared/constants/routes.ts`; esto debe validarse antes de asumir que la navegación/permisos están completos.

## Tecnologías

Versiones declaradas por `package.json`/lockfile:

| Tecnología | Versión declarada |
|---|---|
| React | `^19.2.6` |
| React DOM | `^19.2.6` |
| TypeScript | `~6.0.2` |
| Vite | `^8.0.12` (`8.0.14` resuelto en `package-lock.json`) |
| TanStack Router | `^1.170.8` |
| TanStack Query | `^5.100.14` |
| React Hook Form | `^7.76.1` |
| Zod | `^4.4.3` |
| Tailwind CSS | `^4.3.0` |
| Vitest | `^4.1.7` |
| ESLint | `^10.3.0` |
| Prettier | `^3.8.3` |

Vite 8.0.14 declara Node.js `^20.19.0 || >=22.12.0`. El repositorio no declara `engines` ni una versión de Node propia, por lo que la versión corporativa/canónica sigue **Pending Validation**.

## Prerrequisitos

- Node.js compatible con Vite 8.
- Un backend Janora disponible para las operaciones de la aplicación.

El cliente HTTP utiliza actualmente de forma fija:

```text
http://localhost:3000/api/v1
```

El backend no forma parte de este repositorio.

### Gestor de paquetes

El repositorio contiene y versiona tanto `package-lock.json` como `pnpm-lock.yaml`, y `package.json` no declara `packageManager`. Por ello, el gestor canónico está **Pending Validation**.

Los comandos documentados a continuación usan `npm` porque existen scripts npm válidos y la configuración local de Claude Code suministrada permite `npm run *`. No elimine ni regenere uno de los lockfiles como parte de un cambio no relacionado.

## Instalación local

Si el equipo confirma **npm** como gestor para su entorno:

```bash
npm ci
```

Si el equipo confirma **pnpm**, debe utilizar el flujo corporativo correspondiente y validar previamente cuál lockfile es autoritativo. No se documenta un comando pnpm como canónico mientras esa decisión siga abierta.

## Configuración

Existe `.env.example`:

```dotenv
VITE_DATA_MODE=mock
VITE_APP_NAME=Janora
```

Sin embargo, el árbol `src/` actual no consume `import.meta.env`. Por tanto, estas variables no controlan actualmente el modo de datos ni el branding en tiempo de ejecución. Copiar `.env.example` a `.env` es opcional para el estado actual del código y no corrige la URL fija de la API.

## Ejecución

Desde la raíz del repositorio:

```bash
npm run dev
```

Para generar el build:

```bash
npm run build
```

Para previsualizar un build ya generado:

```bash
npm run preview
```

## Calidad y pruebas

Comandos definidos por el repositorio:

```bash
npm run format:check
npm run lint
npm run build
npm test -- --run
npm run test:coverage
```

`npm test` sin `-- --run` inicia Vitest en modo watch.

Estado de pruebas observado al generar esta documentación:

- existe una única prueba localizada en `src/infrastructure/adapters/http/base-http-client.test.ts`;
- el script `test:coverage` existe;
- no hay un proveedor `@vitest/coverage-*` declarado en las dependencias del repositorio;
- no existe un umbral de cobertura configurado en el repositorio.

Por lo anterior, no debe afirmarse cobertura `>80%` sin ejecutar un reporte real. Para código nuevo o modificado por los artefactos de IA, el objetivo definido para el flujo de trabajo es cobertura **estrictamente mayor a 80%**; si el proyecto no puede medirla, la validación debe reportarse como `BLOCKED` en vez de inventar el resultado o instalar herramientas sin aprobación.

## Contratos HTTP

Los contratos del frontend deben deducirse únicamente de:

- puertos y modelos de `src/core/domain`;
- casos de uso;
- adaptadores de `src/infrastructure/adapters/http`;
- documentación explícita del repositorio.

`BACKEND_INSTRUCTIONS.md` documenta únicamente la creación de residentes (`POST /api/v1/residents`); no es una especificación completa de la API.

Algunos modelos TypeScript tipan timestamps como `Date`, mientras que JSON entrega strings en runtime. Los cambios sensibles a fechas deben validar y normalizar el dato en el punto correcto, sin asumir deserialización automática.

## Claude Code

El repositorio incluye un paquete de contexto específico para Claude Code:

- `CLAUDE.md`: instrucciones globales y hechos estables.
- `.claude/rules/`: reglas por capa/tipo de archivo.
- `.claude/skills/implement-janora-frontend-change/`: flujo de implementación.
- `.claude/skills/verify-janora-change/`: flujo de verificación.
- `.claude/skills/prepare-git-commit/`: validación manual de rama/commit IAS; no realiza el commit.
- `.claude/agents/janora-reviewer.md`: subagente de revisión read-only.
- `docs/ai/claude-code-setup.md`: instalación, activación, mantenimiento y validación del paquete.

Los prompts bajo `.claudecode/` son evidencia histórica de una intención previa de generar una solución full-stack/monorepo. No representan la topología actual y no deben utilizarse para introducir NestJS, Prisma, PostgreSQL, Docker Compose o workspaces sin una solicitud explícita de migración.

## Documentación adicional

- `BACKEND_INSTRUCTIONS.md`: contrato backend parcial disponible en el repositorio.
- `docs/ai/claude-code-setup.md`: guía del agente Claude Code.

## Pendientes de validación

- Gestor de paquetes canónico: npm o pnpm.
- Versión corporativa/canónica de Node.js.
- Si TypeScript debe adoptar `strict`; la configuración actual no lo habilita explícitamente.
- Si `VITE_DATA_MODE` y `VITE_APP_NAME` deben conectarse al runtime.
- Si la URL de API debe configurarse por ambiente.
- Contrato/OpenAPI completo del backend y garantías reales de aislamiento por propiedad.
- Regla vigente de clasificación legal de razas de mascotas usada por el código.
- Comportamiento esperado de permisos/navegación para `/residential-units`.
