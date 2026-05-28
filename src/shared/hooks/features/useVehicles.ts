import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { VehicleFilters, CreateVehicleDto, UpdateVehicleDto } from '@/core/domain/models/vehicle.model'
import type { ParkingSpotFilters } from '@/core/domain/models/parking-spot.model'
import { GetVehiclesUseCase } from '@/core/application/use-cases/vehicles/get-vehicles.use-case'
import { CreateVehicleUseCase } from '@/core/application/use-cases/vehicles/create-vehicle.use-case'
import { UpdateVehicleUseCase } from '@/core/application/use-cases/vehicles/update-vehicle.use-case'
import { container } from '@/infrastructure/di/container'
import { QUERY_KEYS } from '@/shared/lib/query-client'

const getVehicles = new GetVehiclesUseCase(container.vehicleRepository)
const createVehicle = new CreateVehicleUseCase(container.vehicleRepository)
const updateVehicle = new UpdateVehicleUseCase(container.vehicleRepository)

export function useVehicles(filters: VehicleFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicles(filters),
    queryFn: () => getVehicles.execute(filters),
  })
}

export function useParkingSpots(filters: ParkingSpotFilters = {}) {
  return useQuery({
    queryKey: ['parking-spots', filters],
    queryFn: () => container.vehicleRepository.findParkingSpots(filters),
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVehicleDto) => createVehicle.execute(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: ['parking-spots'] })
    },
  })
}

export function useUpdateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleDto }) => updateVehicle.execute(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: ['parking-spots'] })
    },
  })
}

export function useToggleVehicleStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => container.vehicleRepository.toggleStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}
