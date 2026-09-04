# Claude Code setup - Janora Web

## Objetivo

Este paquete configura Claude Code para trabajar sobre el **frontend actual de Janora** sin convertir los prompts históricos del repositorio en arquitectura autoritativa.

## Alcance y compatibilidad

- Target: Claude Code.
- Proyecto: aplicación React/TypeScript/Vite única.
- Superficie: repositorio/proyecto abierto con Claude Code.
- Versión de Claude Code: **Unknown** en el entorno de generación porque el ejecutable `claude` no está instalado.
- Compatibilidad validada: **estática** contra la documentación oficial actual de Claude Code; la carga en runtime queda `NOT RUN` hasta ejecutar el paquete con una instalación real de Claude Code.

## Archivos del paquete

| Archivo | Carga/uso | Propósito |
|---|---|---|
| `CLAUDE.md` | Contexto de proyecto | Hechos estables, arquitectura, calidad, seguridad, comandos y pendientes. |
| `.claude/rules/domain-and-application.md` | Path-scoped | Reglas para dominio, puertos y casos de uso. |
| `.claude/rules/http-data-security.md` | Path-scoped | Adaptadores HTTP, DI, hooks remotos, autenticación, datos y permisos. |
| `.claude/rules/react-ui.md` | Path-scoped | React, Atomic Design, forms, routing y UX. |
| `.claude/rules/testing.md` | Path-scoped | Pruebas Vitest/Testing Library y gate de cobertura. |
| `.claude/skills/implement-janora-frontend-change/SKILL.md` | On demand/auto por descripción | Flujo completo para feature, bugfix o refactor del frontend. |
| `.claude/skills/verify-janora-change/SKILL.md` | On demand/auto por descripción | Verificación con comandos reales del repositorio y estados honestos. |
| `.claude/skills/prepare-git-commit/SKILL.md` | Manual-only | Revisa rama y propone commit según estándar IAS; nunca ejecuta commit/push. |
| `.claude/agents/janora-reviewer.md` | Subagente | Revisión read-only de arquitectura, contratos, seguridad, RBAC, pruebas y documentación. |
| `.claude/settings.local.json` | Local-only existente | Se preserva; no forma parte del paquete versionable. |

## Activación y presupuesto de contexto

### `CLAUDE.md`

Mantiene únicamente información estable y no contiene tutoriales extensos. No duplica el contenido completo de skills.

### Reglas por path

| Regla | Paths positivos | No debe gobernar |
|---|---|---|
| `domain-and-application.md` | `src/core/domain/**`, `src/core/application/**` | UI, adaptadores HTTP no relacionados. |
| `http-data-security.md` | `src/infrastructure/**`, `src/shared/hooks/**`, configuración relacionada | Componentes UI puramente presentacionales. |
| `react-ui.md` | `src/ui/**`, `src/app/**` | Modelos/puertos del dominio. |
| `testing.md` | `src/**/*.test.*`, `src/**/*.spec.*`, archivos de config de test | Código productivo que no esté siendo probado. |

Las reglas usan `paths` solamente en el frontmatter de `.claude/rules/*.md`, que es el mecanismo path-scoped previsto para reglas de Claude Code.

### Skills

#### `implement-janora-frontend-change`

Úsala para implementar/modificar una feature, corregir un bug o refactorizar comportamiento del frontend Janora.

Ejemplo que debe activarla:

> Agrega edición de residentes preservando la arquitectura actual y crea sus pruebas.

Ejemplo que no debe activarla:

> Explícame qué hace `UserRole` sin modificar archivos.

#### `verify-janora-change`

Úsala cuando se pide comprobar un cambio ya realizado, ejecutar las gates disponibles o informar qué está bloqueando la validación.

Ejemplo que debe activarla:

> Verifica los cambios de visitantes y dime si están listos para merge.

Ejemplo que no debe activarla:

> Diseña una nueva pantalla de reportes.

#### `prepare-git-commit`

Es **manual-only**. Su propósito es revisar estado/nombre de rama y redactar un mensaje de commit, no ejecutar acciones Git mutables.

Invocación esperada:

```text
/prepare-git-commit
```

No debe activarse automáticamente durante desarrollo normal.

## Subagente `janora-reviewer`

Use este subagente cuando se requiera una revisión aislada del cambio. Debe operar como revisor read-only: identificar evidencia concreta, severidad, riesgos y validaciones; no debe modificar código ni realizar operaciones Git destructivas.

Aspectos prioritarios en este repositorio:

- dirección de dependencias entre `core`, infraestructura y UI;
- consistencia de contratos frontend/backend;
- manejo de `propertyId`;
- sesión/token y errores HTTP;
- divergencias entre router, Sidebar/constantes y `usePermissions`;
- estado remoto con TanStack Query;
- tests que ejerciten comportamiento real y no solo APIs del navegador;
- documentación afectada.

## Configuración local existente

El ZIP suministrado contiene `.claude/settings.local.json`. Se preservó sin modificarlo y se agregó a `.gitignore` porque es configuración local de Claude Code y no debe convertirse accidentalmente en política compartida del proyecto.

Si el equipo quiere permisos o hooks compartidos, debe diseñarse deliberadamente `.claude/settings.json` y revisarse antes de versionarlo. No se creó en este paquete porque no hay una necesidad confirmada ni un hook seguro que deba ejecutarse automáticamente.

## Artefactos omitidos deliberadamente

### Hooks

**Omitido.** Las validaciones del repositorio dependen de `node_modules` y algunas pueden ser costosas para un evento frecuente. No se crea un hook automático que instale dependencias, ejecute builds completos o modifique archivos. Las validaciones quedan en `verify-janora-change` para ejecución consciente.

### MCP

**Omitido.** No se identificó una necesidad del flujo actual que requiera acceso a sistemas externos mediante MCP.

### `.claude/settings.json`

**Omitido.** No se identificó configuración compartida necesaria; el archivo local existente se conserva como local-only.

### Nuevos agentes especializados adicionales

**Omitidos.** Un único reviewer aislado cubre la necesidad clara del repositorio. Agregar más subagentes aumentaría catálogo/contexto sin evidencia de un flujo que lo justifique.

## Relación con `.claudecode/`

Los archivos `.claudecode/prompt_janoraApp_react_node*.md` describen una intención histórica de solución full-stack/monorepo con tecnologías que no están presentes en el árbol actual. Claude debe tratarlos como contexto histórico y no como autorización para crear backend, workspaces o infraestructura.

La evidencia actual (`package.json`, `src/`, adaptadores y configuración de build) tiene prioridad.

## Uso recomendado

1. Abra la raíz del repositorio en Claude Code.
2. Verifique que `CLAUDE.md` fue descubierto por el proyecto.
3. Para un cambio funcional, describa la tarea normalmente; `implement-janora-frontend-change` está diseñado para ser seleccionable por su descripción.
4. Para validar, solicite explícitamente la verificación o invoque el skill correspondiente.
5. Antes de crear un commit, invoque `/prepare-git-commit` y revise manualmente la propuesta.
6. Use `janora-reviewer` para una segunda revisión read-only cuando el cambio toque arquitectura, seguridad, contratos o permisos.

## Cómo validar el paquete en una máquina con Claude Code

La validación de runtime no se pudo ejecutar durante la generación porque `claude` no estaba instalado. En una máquina con Claude Code:

1. Abra Claude Code desde la raíz del repositorio.
2. Revise el contexto/instrucciones cargadas usando los comandos de diagnóstico disponibles en la versión instalada.
3. Compruebe que las reglas de `src/core/**` no se inyectan para un archivo exclusivamente UI, y viceversa.
4. Pruebe una solicitud positiva y una negativa para cada skill automático.
5. Confirme que `/prepare-git-commit` requiere invocación manual y que no ejecuta `git add`, `git commit` ni `git push`.
6. Ejecute el reviewer sobre un diff pequeño y compruebe que no modifica archivos.
7. Ejecute las validaciones de repositorio únicamente cuando las dependencias ya estén instaladas y el equipo haya confirmado el gestor de paquetes.

## Comandos de validación de aplicación

Desde la raíz, cuando el entorno esté preparado:

```bash
npm run format:check
npm run lint
npm run build
npm test -- --run
npm run test:coverage
```

No instalar dependencias automáticamente desde un skill o hook. Si faltan, reportar `BLOCKED` y pedir la decisión del desarrollador/equipo.

## Mantenimiento

Actualizar `CLAUDE.md` o una regla cuando cambien hechos estables como arquitectura, límites de capas, rutas críticas, seguridad, stack o comandos.

Actualizar un skill cuando cambie el **procedimiento** de implementación/verificación, no para almacenar detalles de una feature puntual.

Agregar un nuevo subagente únicamente cuando se necesite aislamiento real de contexto, herramientas o responsabilidad.

Agregar hooks solo cuando exista un comando confirmado, rápido, no destructivo, repetible y apropiado para el evento elegido.

## Pendientes que Claude no debe resolver por su cuenta

- npm vs pnpm como gestor canónico.
- versión canónica de Node.
- habilitación de TypeScript `strict`.
- conexión real de `.env.example` con runtime.
- parametrización de la URL de API.
- contrato completo del backend y autorización/tenant isolation.
- vigencia de la regla legal de clasificación de razas.
- intención funcional de `/residential-units` respecto de permisos y navegación.
