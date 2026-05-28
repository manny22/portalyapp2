import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PetFilters, CreatePetDto, UpdatePetDto } from '@/core/domain/models/pet.model'
import { GetPetsUseCase } from '@/core/application/use-cases/pets/get-pets.use-case'
import { CreatePetUseCase } from '@/core/application/use-cases/pets/create-pet.use-case'
import { UpdatePetUseCase } from '@/core/application/use-cases/pets/update-pet.use-case'
import { container } from '@/infrastructure/di/container'
import { QUERY_KEYS } from '@/shared/lib/query-client'

const getPets = new GetPetsUseCase(container.petRepository)
const createPet = new CreatePetUseCase(container.petRepository)
const updatePet = new UpdatePetUseCase(container.petRepository)

export function usePets(filters: PetFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.pets(filters),
    queryFn: () => getPets.execute(filters),
  })
}

export function useCreatePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePetDto) => createPet.execute(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pets'] }),
  })
}

export function useUpdatePet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePetDto }) => updatePet.execute(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pets'] }),
  })
}

export function useTogglePetStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => container.petRepository.toggleStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pets'] }),
  })
}

