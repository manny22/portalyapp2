Actúa como un Senior Full Stack Software Architect experto en React, Node.js, TypeScript, Clean Architecture, seguridad OWASP, diseño SaaS y productos comerciales para administración residencial.

Necesito crear desde cero un proyecto llamado Janora.

Janora es una aplicación web comercial para administrar el ingreso y salida de personas en una copropiedad, conjunto residencial, edificio o comunidad cerrada. La plataforma debe permitir gestionar residentes, visitantes, autorizaciones de ingreso, registros de entrada y salida, mascotas, carros, motos, apartamentos, casas, torres, zonas, vigilantes, administradores y auditoría de movimientos.

El sistema debe estar pensado como un SaaS escalable, seguro, multi-tenant y preparado para crecer comercialmente.

# Stack tecnológico obligatorio

Usar el siguiente stack:

- Monorepo con pnpm workspaces.
- Frontend:
  - React.
  - TypeScript.
  - Vite.
  - Tailwind CSS.
  - TanStack Router para rutas.
  - TanStack Query para manejo de estado remoto.
  - React Hook Form para formularios.
  - Zod para validaciones.
  - Componentes reutilizables con enfoque de diseño limpio, moderno y responsive.
- Backend:
  - Node.js.
  - TypeScript.
  - NestJS como framework principal.
  - PostgreSQL como base de datos.
  - Prisma ORM.
  - JWT para autenticación.
  - Refresh tokens.
  - RBAC para autorización por roles.
  - Swagger/OpenAPI para documentación.
  - Validación de DTOs.
  - Helmet, CORS seguro y rate limiting.
- Infraestructura local:
  - Docker Compose para PostgreSQL.
  - Variables de entorno por ambiente.
  - Seeds iniciales.
- Testing:
  - Frontend con Vitest y React Testing Library.
  - Backend con Jest y Supertest.
- Calidad:
  - ESLint.
  - Prettier.
  - Husky.
  - lint-staged.
  - Arquitectura modular.
  - Código limpio.
  - Nombres de archivos, clases, variables y funciones en inglés.

# Objetivo del producto

Construir una plataforma para que una copropiedad pueda controlar y auditar todo lo relacionado con:

- Ingreso de visitantes.
- Salida de visitantes.
- Residentes activos e inactivos.
- Mascotas asociadas a residentes.
- Vehículos asociados a residentes, incluyendo carros y motos.
- Personal de seguridad.
- Administradores de la copropiedad.
- Unidades residenciales: apartamentos, casas, torres, bloques o interiores.
- Autorizaciones de ingreso.
- Historial de accesos.
- Reportes operativos.
- Auditoría de cambios.
- Seguridad de datos.

# Roles del sistema

Implementar los siguientes roles:

1. SUPER_ADMIN
   - Administra toda la plataforma SaaS.
   - Puede crear copropiedades.
   - Puede activar o suspender copropiedades.
   - Puede ver métricas globales.

2. PROPERTY_ADMIN
   - Administra una copropiedad específica.
   - Puede crear torres, unidades, residentes, usuarios de seguridad, vehículos y mascotas.
   - Puede consultar reportes y auditoría.
   - Puede activar o desactivar residentes.

3. SECURITY_GUARD
   - Registra ingresos y salidas.
   - Consulta autorizaciones.
   - Valida visitantes.
   - No puede modificar información sensible de residentes.

4. RESIDENT
   - Puede gestionar sus visitantes autorizados.
   - Puede registrar sus vehículos.
   - Puede registrar sus mascotas.
   - Puede consultar su propio historial.

# Módulos principales del backend

Crear el backend usando arquitectura limpia y modular. Cada módulo debe separar responsabilidades y mantener bajo acoplamiento.

Módulos requeridos:

1. AuthModule
   - Login.
   - Refresh token.
   - Logout.
   - Cambio de contraseña.
   - Recuperación de contraseña, dejando preparada la estructura aunque no se implemente envío real de correo.
   - Hash seguro de contraseñas usando argon2 o bcrypt.
   - Guards para JWT.
   - Guards para roles.

2. UsersModule
   - CRUD de usuarios.
   - Activar/desactivar usuarios.
   - Asignación de roles.
   - Usuario pertenece a una copropiedad.
   - Usuario puede estar asociado a un residente.

3. PropertiesModule
   - CRUD de copropiedades.
   - Nombre comercial.
   - NIT opcional.
   - Dirección.
   - Ciudad.
   - Estado activo/inactivo.
   - Configuración básica.

4. ResidentialUnitsModule
   - Manejo de torres, bloques, interiores o zonas.
   - Manejo de apartamentos o casas.
   - Cada unidad pertenece a una copropiedad.
   - Una unidad puede tener múltiples residentes.

5. ResidentsModule
   - CRUD de residentes.
   - Nombre completo.
   - Tipo y número de documento.
   - Teléfono.
   - Correo.
   - Estado activo/inactivo.
   - Unidad residencial asociada.
   - Relación con la unidad: propietario, arrendatario, familiar, autorizado.
   - Observaciones.

6. PetsModule
   - CRUD de mascotas.
   - Nombre.
   - Tipo: perro, gato, ave, otro.
   - Raza.
   - Color.
   - Observaciones.
   - Estado activo/inactivo.
   - Residente propietario.
   - Unidad residencial asociada.

7. VehiclesModule
   - CRUD de vehículos.
   - Tipo: car, motorcycle, bicycle, other.
   - Placa.
   - Marca.
   - Modelo.
   - Color.
   - Estado activo/inactivo.
   - Residente propietario.
   - Unidad residencial asociada.
   - Validar que la placa no se repita dentro de la misma copropiedad.

8. VisitorsModule
   - CRUD de visitantes.
   - Nombre completo.
   - Tipo y número de documento.
   - Teléfono opcional.
   - Empresa opcional.
   - Observaciones.
   - Historial de visitas.

9. VisitAuthorizationsModule
   - Crear autorización de visita.
   - Residente que autoriza.
   - Visitante autorizado.
   - Fecha y hora de inicio.
   - Fecha y hora de expiración.
   - Tipo de autorización: one_time, recurring, permanent, service_provider.
   - Estado: pending, active, used, expired, cancelled.
   - Código QR o código alfanumérico único.
   - Unidad residencial destino.
   - Observaciones.
   - Validar que una autorización expirada no permita ingreso.

10. AccessLogsModule
   - Registro de entrada.
   - Registro de salida.
   - Fecha y hora.
   - Tipo de persona: resident, visitor, service_provider, delivery, staff.
   - Usuario vigilante que registra.
   - Copropiedad.
   - Unidad destino.
   - Visitante o residente relacionado.
   - Vehículo relacionado opcional.
   - Placa opcional.
   - Motivo de visita.
   - Observaciones.
   - Estado: entered, exited.
   - No permitir salida si no existe una entrada activa.
   - Permitir consultar personas actualmente dentro de la copropiedad.

11. ReportsModule
   - Reporte de ingresos por fecha.
   - Reporte de salidas por fecha.
   - Visitantes frecuentes.
   - Vehículos registrados.
   - Mascotas registradas.
   - Residentes activos.
   - Personas actualmente dentro de la copropiedad.

12. AuditModule
   - Registrar acciones importantes:
     - Creación de residente.
     - Actualización de residente.
     - Eliminación lógica.
     - Creación de visitante.
     - Creación de autorización.
     - Registro de ingreso.
     - Registro de salida.
     - Cambios de estado.
   - Guardar:
     - Usuario que ejecuta la acción.
     - Entidad afectada.
     - ID de entidad.
     - Acción.
     - Fecha.
     - Datos previos.
     - Datos nuevos.

# Arquitectura del backend

Usar una estructura clara basada en Clean Architecture:

apps/api/src
  modules
    auth
    users
    properties
    residential-units
    residents
    pets
    vehicles
    visitors
    visit-authorizations
    access-logs
    reports
    audit
  common
    decorators
    filters
    guards
    interceptors
    pipes
    exceptions
    utils
  config
  database
  main.ts

Cada módulo debe tener, cuando aplique:

- controller
- service
- dto
- entities o domain models
- repository abstraction
- prisma repository implementation
- mapper
- module
- tests

Evitar lógica de negocio en controllers. Los controllers solo deben recibir HTTP requests, validar DTOs y delegar en services/use cases.

# Base de datos

Crear el schema de Prisma con las siguientes entidades mínimas:

- User
- Role
- Property
- ResidentialBlock
- ResidentialUnit
- Resident
- Pet
- Vehicle
- Visitor
- VisitAuthorization
- AccessLog
- AuditLog
- RefreshToken

Relaciones importantes:

- Una Property tiene muchos ResidentialBlocks.
- Una Property tiene muchas ResidentialUnits.
- Una ResidentialUnit pertenece a una Property.
- Una ResidentialUnit puede pertenecer a un ResidentialBlock.
- Una ResidentialUnit tiene muchos Residents.
- Un Resident pertenece a una ResidentialUnit.
- Un Resident puede tener muchas Pets.
- Un Resident puede tener muchos Vehicles.
- Un Resident puede crear muchas VisitAuthorizations.
- Un Visitor puede tener muchas VisitAuthorizations.
- Una VisitAuthorization pertenece a una Property.
- Una AccessLog pertenece a una Property.
- Una AccessLog puede relacionarse con Visitor, Resident, Vehicle y VisitAuthorization.
- Un User pertenece a una Property, excepto SUPER_ADMIN.
- Un User puede tener muchos AuditLogs.
- Un User puede tener RefreshTokens.

Implementar soft delete cuando tenga sentido usando campos como:

- isActive
- deletedAt
- createdAt
- updatedAt

Usar índices para:

- propertyId
- documentNumber
- plate
- authorizationCode
- createdAt
- access status

# Seguridad obligatoria

Implementar buenas prácticas de seguridad:

- No guardar contraseñas en texto plano.
- Usar hash seguro.
- JWT con expiración corta.
- Refresh token con persistencia y revocación.
- Validar inputs con DTOs y Zod donde corresponda.
- Sanitizar entradas relevantes.
- Implementar rate limit en endpoints sensibles como login.
- Configurar CORS desde variables de entorno.
- Usar Helmet.
- No exponer stack traces en producción.
- Implementar RBAC.
- Implementar tenant isolation: ningún usuario debe poder consultar datos de otra copropiedad.
- SUPER_ADMIN puede consultar todas las copropiedades.
- PROPERTY_ADMIN, SECURITY_GUARD y RESIDENT solo pueden consultar datos de su propia copropiedad.
- RESIDENT solo puede consultar o modificar información propia o de su unidad cuando aplique.
- Crear filtros globales de errores.
- Crear respuestas API consistentes.

# Frontend

Crear una aplicación React moderna, responsive y lista para producto comercial.

Estructura sugerida:

apps/web/src
  app
    router.tsx
    providers.tsx
  features
    auth
    dashboard
    properties
    residential-units
    residents
    pets
    vehicles
    visitors
    visit-authorizations
    access-logs
    reports
    users
    settings
  shared
    components
    hooks
    lib
    services
    types
    utils
  styles
    globals.css
  main.tsx

# Frontend: páginas requeridas

Crear las siguientes páginas:

1. LoginPage
   - Formulario de login.
   - Validación.
   - Manejo de errores.
   - Guardar access token de forma segura.
   - Redirección al dashboard.

2. DashboardPage
   - Cards con métricas:
     - Residentes activos.
     - Visitantes del día.
     - Personas actualmente dentro.
     - Vehículos registrados.
     - Mascotas registradas.
     - Autorizaciones activas.
   - Diseño moderno con Tailwind CSS.

3. ResidentsPage
   - Tabla de residentes.
   - Filtros por nombre, documento, unidad y estado.
   - Crear residente.
   - Editar residente.
   - Activar/desactivar.
   - Ver detalle.

4. ResidentDetailPage
   - Información del residente.
   - Unidad asociada.
   - Vehículos.
   - Mascotas.
   - Historial de visitantes autorizados.
   - Historial de ingresos relacionados.

5. PetsPage
   - Tabla de mascotas.
   - Crear mascota.
   - Editar mascota.
   - Asociar con residente.
   - Asociar con unidad.

6. VehiclesPage
   - Tabla de vehículos.
   - Crear vehículo.
   - Editar vehículo.
   - Tipo carro/moto/bicicleta/otro.
   - Validación de placa.
   - Asociar con residente.

7. VisitorsPage
   - Tabla de visitantes.
   - Crear visitante.
   - Ver historial de visitas.
   - Buscar por documento.

8. VisitAuthorizationsPage
   - Crear autorización.
   - Seleccionar visitante.
   - Seleccionar residente autorizador.
   - Seleccionar unidad destino.
   - Definir fecha de inicio y expiración.
   - Generar código único.
   - Mostrar estado.
   - Cancelar autorización.

9. AccessControlPage
   - Página principal para vigilantes.
   - Buscar visitante por documento o código de autorización.
   - Registrar ingreso.
   - Registrar salida.
   - Ver personas actualmente dentro.
   - Diseño rápido de usar en portería.
   - Botones grandes y claros.
   - Validaciones visuales.

10. ReportsPage
   - Filtros por fecha.
   - Reporte de ingresos y salidas.
   - Reporte de visitantes.
   - Reporte de vehículos.
   - Reporte de mascotas.
   - Exportación básica a CSV.

11. UsersPage
   - Gestión de usuarios.
   - Crear usuarios.
   - Editar roles.
   - Activar/desactivar.
   - Solo visible para PROPERTY_ADMIN o SUPER_ADMIN.

12. SettingsPage
   - Información básica de la copropiedad.
   - Configuración visual básica.
   - Configuración de reglas de acceso.

# Frontend: diseño visual

Usar Tailwind CSS con un diseño:

- Profesional.
- Limpio.
- Moderno.
- Responsive.
- Compatible con escritorio, tablet y móvil.
- Ideal para uso en portería.
- Sidebar para navegación principal.
- Header con usuario autenticado.
- Estados visuales claros.
- Formularios ordenados.
- Tablas con acciones.
- Modales o drawers para crear y editar.
- Toast notifications.
- Loading states.
- Empty states.
- Error states.

Usar una paleta sobria inspirada en seguridad y comunidad:

- Fondo claro.
- Azul oscuro o slate para navegación.
- Verde para estados exitosos o ingresos autorizados.
- Rojo para alertas o accesos denegados.
- Amarillo para pendientes.

No hardcodear textos críticos dentro de componentes si pueden ir centralizados.

# Reglas de navegación

Implementar rutas protegidas según rol:

- /login público.
- /dashboard autenticado.
- /residents para PROPERTY_ADMIN y SECURITY_GUARD, con permisos limitados.
- /pets para PROPERTY_ADMIN y RESIDENT.
- /vehicles para PROPERTY_ADMIN y RESIDENT.
- /visitors para PROPERTY_ADMIN, SECURITY_GUARD y RESIDENT.
- /authorizations para PROPERTY_ADMIN, SECURITY_GUARD y RESIDENT.
- /access-control principalmente para SECURITY_GUARD y PROPERTY_ADMIN.
- /reports para PROPERTY_ADMIN y SUPER_ADMIN.
- /users para PROPERTY_ADMIN y SUPER_ADMIN.
- /settings para PROPERTY_ADMIN y SUPER_ADMIN.

# API client

Crear un cliente HTTP centralizado usando fetch o axios.

Debe incluir:

- Base URL desde variables de entorno.
- Interceptor o wrapper para agregar Authorization Bearer token.
- Manejo de errores 401.
- Refresh token automático si es posible.
- Tipado de requests y responses.
- Separar servicios por feature:
  - authService
  - residentsService
  - petsService
  - vehiclesService
  - visitorsService
  - authorizationsService
  - accessLogsService
  - reportsService
  - usersService

# Requerimientos funcionales clave

Implementar al menos los siguientes flujos completos:

1. Login
   - Usuario ingresa email y contraseña.
   - Backend valida credenciales.
   - Backend retorna access token, refresh token y perfil.
   - Frontend guarda sesión y redirige al dashboard.

2. Crear residente
   - PROPERTY_ADMIN crea residente.
   - Se asocia a unidad residencial.
   - Se valida documento único por copropiedad.

3. Registrar vehículo
   - PROPERTY_ADMIN o RESIDENT registra vehículo.
   - Se asocia a residente.
   - Se valida placa única por copropiedad.

4. Registrar mascota
   - PROPERTY_ADMIN o RESIDENT registra mascota.
   - Se asocia a residente.

5. Crear visitante
   - PROPERTY_ADMIN, SECURITY_GUARD o RESIDENT crea visitante.
   - Se valida documento.

6. Crear autorización de visita
   - RESIDENT crea autorización.
   - Se genera código único.
   - Se define fecha de expiración.
   - Queda activa.

7. Registrar ingreso
   - SECURITY_GUARD busca autorización por código o documento.
   - Si está activa y vigente, registra ingreso.
   - El sistema crea AccessLog con estado entered.

8. Registrar salida
   - SECURITY_GUARD busca persona dentro.
   - Registra salida.
   - El sistema actualiza o crea registro de salida.
   - No debe permitir salida duplicada.

9. Consultar personas dentro
   - SECURITY_GUARD y PROPERTY_ADMIN ven listado de visitantes/personas actualmente dentro.

10. Reportes
   - PROPERTY_ADMIN consulta ingresos y salidas por rango de fechas.

# Requerimientos no funcionales

- Código escalable.
- Separación clara entre UI, lógica de negocio y servicios.
- Componentes reutilizables.
- DTOs claros.
- Validaciones robustas.
- Manejo de errores consistente.
- Evitar duplicación de lógica.
- Preparar el proyecto para producción.
- No usar datos quemados excepto seeds.
- No incluir secretos reales.
- Usar variables de entorno.
- Documentar cómo ejecutar el proyecto.

# Entregables esperados

Generar el proyecto con:

1. Estructura de monorepo.
2. package.json raíz.
3. pnpm-workspace.yaml.
4. apps/web.
5. apps/api.
6. docker-compose.yml para PostgreSQL.
7. README.md con instrucciones.
8. .env.example para frontend y backend.
9. Prisma schema.
10. Migración inicial o instrucciones para migrar.
11. Seed inicial con:
    - Un SUPER_ADMIN.
    - Una copropiedad demo.
    - Un PROPERTY_ADMIN.
    - Un SECURITY_GUARD.
    - Un RESIDENT.
    - Una torre.
    - Una unidad residencial.
    - Un residente demo.
    - Un vehículo demo.
    - Una mascota demo.
12. Backend funcional con endpoints principales.
13. Frontend funcional con pantallas principales.
14. Tests base.
15. Configuración de lint y format.

# Criterios de aceptación

El proyecto debe permitir ejecutar:

pnpm install
pnpm dev

Y debe levantar:

- Frontend en http://localhost:5173
- Backend en http://localhost:3000
- PostgreSQL en Docker

También debe permitir:

pnpm db:migrate
pnpm db:seed
pnpm test
pnpm lint
pnpm format

# Estilo de código

- Usar TypeScript estricto.
- Evitar any.
- Usar nombres en inglés.
- Crear tipos reutilizables.
- Crear DTOs para entrada y salida.
- No colocar lógica de negocio dentro de componentes React.
- No colocar lógica de negocio dentro de controllers NestJS.
- Mantener componentes pequeños.
- Mantener services enfocados.
- Crear utilidades compartidas cuando aplique.
- Aplicar principios SOLID.
- Aplicar Clean Architecture de forma pragmática.

# Instrucciones para generación

Primero genera la estructura completa del monorepo.

Después genera los archivos de configuración.

Después genera el backend.

Después genera el frontend.

Después genera el README.

No generes explicaciones largas. Genera código funcional, organizado y listo para ejecutar.

Cuando una parte sea demasiado extensa, divide la implementación por módulos y continúa hasta completar el proyecto.

Antes de finalizar, verifica que:

- Las rutas del frontend coincidan con los endpoints del backend.
- Las entidades del frontend coincidan con el schema de Prisma.
- Los roles estén correctamente aplicados.
- Las variables de entorno estén documentadas.
- El README explique cómo ejecutar todo localmente.