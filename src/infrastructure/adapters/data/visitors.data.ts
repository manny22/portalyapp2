import type { Visitor } from '@/core/domain/models/visitor.model'
import { FullName } from '@/core/domain/value-objects/full-name.vo'
import { DocumentNumber } from '@/core/domain/value-objects/document-number.vo'
import { PhoneNumber } from '@/core/domain/value-objects/phone-number.vo'

export const MOCK_VISITORS: Visitor[] = [
  {
    id: 'vis-1',
    name: FullName.create('Pedro', 'Suárez'),
    document: DocumentNumber.create('CC', '71234567'),
    phone: PhoneNumber.create('3001234567'),
    company: null,
    observations: null,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    id: 'vis-2',
    name: FullName.create('Ana', 'Ruiz'),
    document: DocumentNumber.create('CC', '53456789'),
    phone: PhoneNumber.create('3112345678'),
    company: null,
    observations: null,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: 'vis-3',
    name: FullName.create('Luis', 'Torres'),
    document: DocumentNumber.create('CC', '82345678'),
    phone: PhoneNumber.create('3223456789'),
    company: 'Empresas Acme',
    observations: 'Técnico de mantenimiento',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01'),
  },
  {
    id: 'vis-4',
    name: FullName.create('Diana', 'Castro'),
    document: DocumentNumber.create('CC', '46789012'),
    phone: null,
    company: null,
    observations: null,
    createdAt: new Date('2024-04-10'),
    updatedAt: new Date('2024-04-10'),
  },
  {
    id: 'vis-5',
    name: FullName.create('Roberto', 'Mora'),
    document: DocumentNumber.create('CC', '19876543'),
    phone: PhoneNumber.create('3334567890'),
    company: 'Domicilios Express',
    observations: 'Domiciliario frecuente',
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-15'),
  },
]
