// Soporta formato colombiano (ABC123), motos (ABC12A), bicicletas (sin placa = BICI + número)
const PLATE_REGEX = /^[A-Z0-9]{3,8}$/

export class LicensePlate {
  readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  // ── Validation — VO is the single source of truth for its rules ────────────

  static validate(value: string): string | null {
    if (!value?.trim()) return 'La placa es requerida'
    const normalized = value.trim().toUpperCase().replace(/[\s-]/g, '')
    if (!PLATE_REGEX.test(normalized)) {
      return 'Placa inválida: debe tener entre 3 y 8 caracteres alfanuméricos (ej. ABC123 o ABC12A)'
    }
    return null
  }

  static hint(): string {
    return 'Ej. ABC123 — letras y dígitos, sin espacios ni guiones'
  }

  static normalize(value: string): string {
    return value.trim().toUpperCase().replace(/[\s-]/g, '')
  }

  // ── Factory ────────────────────────────────────────────────────────────────

  static create(value: string): LicensePlate {
    const normalized = LicensePlate.normalize(value)
    const err = LicensePlate.validate(value)
    if (err) throw new Error(err)
    return new LicensePlate(normalized)
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  equals(other: LicensePlate): boolean {
    return this.value === other.value
  }

  format(): string {
    if (this.value.length === 6) {
      return `${this.value.slice(0, 3)}-${this.value.slice(3)}`
    }
    return this.value
  }

  toString(): string {
    return this.format()
  }
}
