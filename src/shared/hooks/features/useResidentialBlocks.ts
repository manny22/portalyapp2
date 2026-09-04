import { useState, useEffect } from 'react'
import type { ResidentialBlock } from '@/core/domain/models/residential-block.model'
import { container } from '@/infrastructure/di/container'

interface UseResidentialBlocksResult {
  blocks: ResidentialBlock[]
  isLoading: boolean
  error: Error | null
}

export function useResidentialBlocks(propertyId?: string): UseResidentialBlocksResult {
  const [blocks, setBlocks] = useState<ResidentialBlock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!propertyId) {
      setBlocks([])
      setIsLoading(false)
      return
    }

    const loadBlocks = async () => {
      try {
        setIsLoading(true)
        const data = await container.residentialBlockRepository.findAll({ propertyId })
        setBlocks(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        setBlocks([])
        setError(err instanceof Error ? err : new Error('Error loading blocks'))
      } finally {
        setIsLoading(false)
      }
    }

    loadBlocks()
  }, [propertyId])

  return { blocks: blocks || [], isLoading, error }
}
