import type { BreedClassification } from '@/core/domain/models/pet.model'

/**
 * Ley 746 de 2002 — Razas cuya importación y reproducción está prohibida en Colombia.
 */
export const PROHIBITED_BREEDS = [
  'Staffordshire Terrier',
  'American Staffordshire Terrier',
  'Pit Bull Terrier',
  'American Pit Bull Terrier',
] as const

/**
 * Ley 746 de 2002 — Razas potencialmente peligrosas que requieren permiso especial,
 * registro municipal, seguro de responsabilidad civil y bozal en espacios públicos.
 */
export const SPECIAL_PERMIT_BREEDS = [
  'Bullmastiff',
  'Dóberman',
  'Dogo Argentino',
  'Dogo de Burdeos',
  'Fila Brasileiro',
  'Mastín Napolitano',
  'Presa Canario',
  'Rottweiler',
  'Tosa Japonés',
] as const

export function classifyBreed(breed: string | null | undefined): BreedClassification {
  if (!breed) return 'STANDARD'
  const normalized = breed.trim().toLowerCase()
  if (PROHIBITED_BREEDS.some(b => b.toLowerCase() === normalized)) return 'PROHIBITED'
  if (SPECIAL_PERMIT_BREEDS.some(b => b.toLowerCase() === normalized)) return 'SPECIAL_PERMIT'
  return 'STANDARD'
}

export function isPotentiallyDangerous(breed: string | null | undefined): boolean {
  const classification = classifyBreed(breed)
  return classification === 'SPECIAL_PERMIT' || classification === 'PROHIBITED'
}

export function requiresSpecialPermit(breed: string | null | undefined): boolean {
  return classifyBreed(breed) === 'SPECIAL_PERMIT'
}

export const ALL_KNOWN_BREEDS = {
  DOG: [
    'Labrador Retriever',
    'Golden Retriever',
    'Pastor Alemán',
    'Bulldog Francés',
    'Bulldog Inglés',
    'Beagle',
    'Poodle',
    'Chihuahua',
    'Schnauzer',
    'Shih Tzu',
    'Yorkshire Terrier',
    'Maltés',
    'Boxer',
    'Husky Siberiano',
    'Border Collie',
    'Dálmata',
    'Cocker Spaniel',
    ...SPECIAL_PERMIT_BREEDS,
    ...PROHIBITED_BREEDS,
  ],
  CAT: ['Persa', 'Siamés', 'Ragdoll', 'Maine Coon', 'Bengalí', 'Angora', 'Esfinge', 'Británico de Pelo Corto'],
  BIRD: ['Canario', 'Periquito', 'Cacatúa', 'Loro', 'Agaporni', 'Diamante de Gould'],
  OTHER: [],
} as const
