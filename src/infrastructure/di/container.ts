/**
 * Dependency Injection Container
 *
 * Este es el único archivo del proyecto que conoce las implementaciones concretas
 * de los repositorios. El resto del código solo conoce los puertos (interfaces).
 *
 * Para pasar de datos mock a una API REST real, solo hay que:
 * 1. Crear una nueva implementación del puerto (ej. ResidentHttpRepository)
 * 2. Cambiar la línea de importación y la instancia aquí
 * 3. Nada más en el resto del código
 */

import type { AuthRepositoryPort } from '@/core/domain/ports/auth.repository.port'
import type { ResidentRepositoryPort } from '@/core/domain/ports/resident.repository.port'
import type { PetRepositoryPort } from '@/core/domain/ports/pet.repository.port'
import type { VehicleRepositoryPort } from '@/core/domain/ports/vehicle.repository.port'
import type { VisitorRepositoryPort } from '@/core/domain/ports/visitor.repository.port'
import type { AuthorizationRepositoryPort } from '@/core/domain/ports/authorization.repository.port'
import type { AccessLogRepositoryPort } from '@/core/domain/ports/access-log.repository.port'
import type { UserRepositoryPort } from '@/core/domain/ports/user.repository.port'
import type { ReportsRepositoryPort } from '@/core/domain/ports/reports.repository.port'

import { AuthMockRepository } from '../adapters/mock/auth.mock-repository'
import { ResidentMockRepository } from '../adapters/mock/resident.mock-repository'
import { PetMockRepository } from '../adapters/mock/pet.mock-repository'
import { VehicleMockRepository } from '../adapters/mock/vehicle.mock-repository'
import { VisitorMockRepository } from '../adapters/mock/visitor.mock-repository'
import { AuthorizationMockRepository } from '../adapters/mock/authorization.mock-repository'
import { AccessLogMockRepository } from '../adapters/mock/access-log.mock-repository'
import { UserMockRepository } from '../adapters/mock/user.mock-repository'
import { ReportsMockRepository } from '../adapters/mock/reports.mock-repository'

// Instancias singleton — comparten estado en toda la sesión (simula una "base de datos" en memoria)
export const container = {
  authRepository: new AuthMockRepository() as AuthRepositoryPort,
  residentRepository: new ResidentMockRepository() as ResidentRepositoryPort,
  petRepository: new PetMockRepository() as PetRepositoryPort,
  vehicleRepository: new VehicleMockRepository() as VehicleRepositoryPort,
  visitorRepository: new VisitorMockRepository() as VisitorRepositoryPort,
  authorizationRepository: new AuthorizationMockRepository() as AuthorizationRepositoryPort,
  accessLogRepository: new AccessLogMockRepository() as AccessLogRepositoryPort,
  userRepository: new UserMockRepository() as UserRepositoryPort,
  reportsRepository: new ReportsMockRepository() as ReportsRepositoryPort,
} as const

export type Container = typeof container
