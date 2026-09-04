/**
 * Dependency Injection Container
 *
 * Este es el único archivo del proyecto que conoce las implementaciones concretas
 * de los repositorios. El resto del código solo conoce los puertos (interfaces).
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
import type { ResidentialUnitRepositoryPort } from '@/core/domain/ports/residential-unit.repository.port'
import type { ResidentialBlockRepositoryPort } from '@/core/domain/ports/residential-block.repository.port'

import { AuthHttpRepository } from '../adapters/http/auth.http-repository'
import { ResidentHttpRepository } from '../adapters/http/resident.http-repository'
import { PetHttpRepository } from '../adapters/http/pet.http-repository'
import { VehicleHttpRepository } from '../adapters/http/vehicle.http-repository'
import { VisitorHttpRepository } from '../adapters/http/visitor.http-repository'
import { AuthorizationHttpRepository } from '../adapters/http/authorization.http-repository'
import { AccessLogHttpRepository } from '../adapters/http/access-log.http-repository'
import { UserHttpRepository } from '../adapters/http/user.http-repository'
import { ReportsHttpRepository } from '../adapters/http/reports.http-repository'
import { ResidentialUnitHttpRepository } from '../adapters/http/residential-unit.http-repository'
import { ResidentialBlockHttpRepository } from '../adapters/http/residential-block.http-repository'

// Instancias singleton — hacen llamadas HTTP a la API en localhost:3000/api/v1
export const container = {
  authRepository: new AuthHttpRepository() as AuthRepositoryPort,
  residentRepository: new ResidentHttpRepository() as ResidentRepositoryPort,
  petRepository: new PetHttpRepository() as PetRepositoryPort,
  vehicleRepository: new VehicleHttpRepository() as VehicleRepositoryPort,
  visitorRepository: new VisitorHttpRepository() as VisitorRepositoryPort,
  authorizationRepository: new AuthorizationHttpRepository() as AuthorizationRepositoryPort,
  accessLogRepository: new AccessLogHttpRepository() as AccessLogRepositoryPort,
  userRepository: new UserHttpRepository() as UserRepositoryPort,
  reportsRepository: new ReportsHttpRepository() as ReportsRepositoryPort,
  residentialUnitRepository: new ResidentialUnitHttpRepository() as ResidentialUnitRepositoryPort,
  residentialBlockRepository:
    new ResidentialBlockHttpRepository() as ResidentialBlockRepositoryPort,
} as const

export type Container = typeof container
