export type ParkingSpotType = 'PRIVATE' | 'COMMON' | 'VISITOR'

export const PARKING_SPOT_TYPE_LABELS: Record<ParkingSpotType, string> = {
  PRIVATE: 'Privado',
  COMMON: 'Común',
  VISITOR: 'Visitantes',
}

export interface ParkingSpot {
  id: string
  code: string          // Ej. "P-101A", "C-01", "V-05"
  type: ParkingSpotType
  unitId: string | null     // Solo PRIVATE: unidad propietaria
  unitNumber: string | null
  propertyId: string
  isOccupied: boolean
  currentVehicleId: string | null
  currentVehiclePlate: string | null
  observations: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ParkingEligibilityResult {
  allowed: boolean
  reason?: string
}

/**
 * Reglas de elegibilidad de parqueadero — dominio puro, sin dependencias externas.
 *
 * Residentes:   PRIVATE (solo su unidad) | COMMON (libre)
 * Visitantes:   VISITOR (si hay disponibles) | COMMON (solo con autorización especial)
 * Prohibido:    Residente → VISITOR | Visitante → PRIVATE
 */
export function checkParkingEligibility(
  spotType: ParkingSpotType,
  ownerType: 'RESIDENT' | 'VISITOR',
  opts: {
    spotUnitId?: string | null
    vehicleUnitId?: string | null
    hasCommonAuthorization?: boolean
  } = {},
): ParkingEligibilityResult {
  const { spotUnitId, vehicleUnitId, hasCommonAuthorization = false } = opts

  if (ownerType === 'RESIDENT') {
    if (spotType === 'PRIVATE') {
      if (spotUnitId && vehicleUnitId && spotUnitId !== vehicleUnitId) {
        return { allowed: false, reason: 'Este parqueadero privado pertenece a otra unidad residencial' }
      }
      return { allowed: true }
    }
    if (spotType === 'COMMON') return { allowed: true }
    return { allowed: false, reason: 'Los residentes no pueden usar parqueaderos de visitantes' }
  }

  if (ownerType === 'VISITOR') {
    if (spotType === 'PRIVATE') {
      return { allowed: false, reason: 'Los visitantes no pueden usar parqueaderos privados' }
    }
    if (spotType === 'VISITOR') return { allowed: true }
    if (spotType === 'COMMON') {
      if (!hasCommonAuthorization) {
        return {
          allowed: false,
          reason: 'El visitante requiere autorización especial para usar parqueaderos comunes',
        }
      }
      return { allowed: true }
    }
  }

  return { allowed: false, reason: 'Combinación de propietario y tipo de parqueadero no válida' }
}

export interface ParkingSpotFilters {
  propertyId?: string
  type?: ParkingSpotType
  isOccupied?: boolean
  unitId?: string
}
