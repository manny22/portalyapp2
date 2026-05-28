export type UnitType = 'APARTMENT' | 'HOUSE' | 'OFFICE' | 'LOCAL'

export interface ResidentialUnit {
  id: string
  number: string
  type: UnitType
  floor: number | null
  propertyId: string
  blockId: string | null
  blockName: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
