// Accepts Colombian mobile (3xx) and landlines with optional country code
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/
const COLOMBIAN_MOBILE_REGEX = /^(\+57)?[\s-]?3\d{9}$/
const COLOMBIAN_LANDLINE_REGEX = /^(\+57)?[\s-]?[1-8]\d{6,7}$/

export class PhoneNumber {
  readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  // ── Validation — VO is the single source of truth for its rules ────────────

  static validate(value: string): string | null {
    const trimmed = value?.trim() ?? ''
    if (!trimmed) return 'El número de teléfono es requerido'
    if (!PHONE_REGEX.test(trimmed)) return 'El número de teléfono no tiene un formato válido (7–20 caracteres)'
    const digits = trimmed.replace(/\D/g, '')
    if (digits.length < 7) return 'El número de teléfono debe tener al menos 7 dígitos'
    return null
  }

  static validateOptional(value: string | undefined | null): string | null {
    if (!value || !value.trim()) return null
    return PhoneNumber.validate(value)
  }

  static hint(): string {
    return 'Ej: 3101234567 o +57 310 123 4567'
  }

  static isColombian(value: string): boolean {
    const normalized = value.trim().replace(/\s/g, '')
    return COLOMBIAN_MOBILE_REGEX.test(normalized) || COLOMBIAN_LANDLINE_REGEX.test(normalized)
  }

  // ── Factory ────────────────────────────────────────────────────────────────

  static create(value: string): PhoneNumber {
    const err = PhoneNumber.validate(value)
    if (err) throw new Error(err)
    return new PhoneNumber(value.trim())
  }

  static createOptional(value: string | undefined | null): PhoneNumber | null {
    if (!value || value.trim() === '') return null
    return PhoneNumber.create(value)
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  equals(other: PhoneNumber): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
