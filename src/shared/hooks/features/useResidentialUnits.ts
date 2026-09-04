import { useState, useEffect } from 'react'
import type { ResidentialUnit } from '@/core/domain/models/residential-unit.model'
import { container } from '@/infrastructure/di/container'

interface UseResidentialUnitsResult {
  units: ResidentialUnit[]
  isLoading: boolean
  error: Error | null
}

export function useResidentialUnits(
  propertyId?: string,
  blockId?: string
): UseResidentialUnitsResult {
  const [units, setUnits] = useState<ResidentialUnit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!propertyId) {
      setUnits([])
      setIsLoading(false)
      return
    }

    const loadUnits = async () => {
      try {
        setIsLoading(true)
        const data = await container.residentialUnitRepository.findAll({ propertyId, blockId })
        setUnits(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        setUnits([])
        setError(err instanceof Error ? err : new Error('Error loading units'))
      } finally {
        setIsLoading(false)
      }
    }

    loadUnits()
  }, [propertyId, blockId])

  return { units: units || [], isLoading, error }
}
