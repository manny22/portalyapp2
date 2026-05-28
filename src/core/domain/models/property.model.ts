export interface ResidentialBlock {
  id: string
  name: string
  propertyId: string
  createdAt: Date
}

export interface Property {
  id: string
  name: string
  nit: string | null
  address: string
  city: string
  isActive: boolean
  blocks: ResidentialBlock[]
  createdAt: Date
  updatedAt: Date
}
