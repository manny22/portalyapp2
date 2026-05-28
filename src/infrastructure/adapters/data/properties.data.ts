import type { Property, ResidentialBlock } from '@/core/domain/models/property.model'
import type { ResidentialUnit } from '@/core/domain/models/residential-unit.model'

export const MOCK_BLOCKS: ResidentialBlock[] = [
  { id: 'block-1', name: 'Torre A', propertyId: 'prop-1', createdAt: new Date('2024-01-01') },
  { id: 'block-2', name: 'Torre B', propertyId: 'prop-1', createdAt: new Date('2024-01-01') },
  { id: 'block-3', name: 'Torre C', propertyId: 'prop-1', createdAt: new Date('2024-01-01') },
]

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Conjunto Residencial Los Pinos',
    nit: '900.123.456-7',
    address: 'Calle 45 # 23-10',
    city: 'Bogotá',
    isActive: true,
    blocks: MOCK_BLOCKS,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

export const MOCK_UNITS: ResidentialUnit[] = [
  { id: 'unit-1', number: '101', type: 'APARTMENT', floor: 1, propertyId: 'prop-1', blockId: 'block-1', blockName: 'Torre A', isActive: true, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: 'unit-2', number: '102', type: 'APARTMENT', floor: 1, propertyId: 'prop-1', blockId: 'block-1', blockName: 'Torre A', isActive: true, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: 'unit-3', number: '201', type: 'APARTMENT', floor: 2, propertyId: 'prop-1', blockId: 'block-1', blockName: 'Torre A', isActive: true, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: 'unit-4', number: '101', type: 'APARTMENT', floor: 1, propertyId: 'prop-1', blockId: 'block-2', blockName: 'Torre B', isActive: true, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: 'unit-5', number: '102', type: 'APARTMENT', floor: 1, propertyId: 'prop-1', blockId: 'block-2', blockName: 'Torre B', isActive: true, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: 'unit-6', number: '301', type: 'APARTMENT', floor: 3, propertyId: 'prop-1', blockId: 'block-3', blockName: 'Torre C', isActive: true, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
]
