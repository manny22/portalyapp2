// RFC-5322 simplified but practical
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export class Email {
  readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  // ── Validation — VO is the single source of truth for its rules ────────────

  static validate(value: string): string | null {
    if (!value?.trim()) return 'El correo electrónico es requerido'
    const normalized = value.trim().toLowerCase()
    if (!EMAIL_REGEX.test(normalized)) return 'El correo electrónico no tiene un formato válido'
    if (normalized.length > 254) return 'El correo electrónico es demasiado largo'
    return null
  }

  static validateOptional(value: string | undefined | null): string | null {
    if (!value || !value.trim()) return null
    return Email.validate(value)
  }

  // ── Factory ────────────────────────────────────────────────────────────────

  static create(value: string): Email {
    const err = Email.validate(value)
    if (err) throw new Error(err)
    return new Email(value.trim().toLowerCase())
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  equals(other: Email): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
