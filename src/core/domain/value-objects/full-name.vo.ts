const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ\s'-]+$/

export class FullName {
  readonly firstName: string
  readonly lastName: string

  private constructor(firstName: string, lastName: string) {
    this.firstName = firstName
    this.lastName = lastName
  }

  // ── Validation — VO is the single source of truth for its rules ────────────

  static validateFirstName(value: string): string | null {
    const v = value?.trim() ?? ''
    if (!v) return 'El nombre es requerido'
    if (v.length < 2) return 'El nombre debe tener al menos 2 caracteres'
    if (v.length > 50) return 'El nombre no puede exceder 50 caracteres'
    if (!NAME_REGEX.test(v)) return 'El nombre solo puede contener letras'
    return null
  }

  static validateLastName(value: string): string | null {
    const v = value?.trim() ?? ''
    if (!v) return 'El apellido es requerido'
    if (v.length < 2) return 'El apellido debe tener al menos 2 caracteres'
    if (v.length > 50) return 'El apellido no puede exceder 50 caracteres'
    if (!NAME_REGEX.test(v)) return 'El apellido solo puede contener letras'
    return null
  }

  // ── Factory ────────────────────────────────────────────────────────────────

  static create(firstName: string, lastName: string): FullName {
    const firstErr = FullName.validateFirstName(firstName)
    if (firstErr) throw new Error(firstErr)
    const lastErr = FullName.validateLastName(lastName)
    if (lastErr) throw new Error(lastErr)
    return new FullName(firstName.trim(), lastName.trim())
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  get full(): string {
    return `${this.firstName} ${this.lastName}`
  }

  get initials(): string {
    return `${this.firstName[0]}${this.lastName[0]}`.toUpperCase()
  }

  equals(other: FullName): boolean {
    return this.firstName === other.firstName && this.lastName === other.lastName
  }

  toString(): string {
    return this.full
  }
}
