export type DocumentType = 'CC' | 'CE' | 'TI' | 'PASSPORT' | 'NIT'

// Per-type rules (Colombia)
const RULES: Record<DocumentType, { pattern: RegExp; min: number; max: number; hint: string }> = {
  CC:       { pattern: /^\d+$/,        min: 6,  max: 10, hint: '6–10 dígitos numéricos' },
  CE:       { pattern: /^[A-Z0-9]+$/i, min: 6,  max: 10, hint: '6–10 caracteres alfanuméricos' },
  TI:       { pattern: /^\d+$/,        min: 10, max: 12, hint: '10–12 dígitos numéricos' },
  PASSPORT: { pattern: /^[A-Z0-9]+$/i, min: 5,  max: 15, hint: '5–15 caracteres alfanuméricos' },
  NIT:      { pattern: /^\d+$/,        min: 9,  max: 10, hint: '9–10 dígitos numéricos (sin dígito de verificación)' },
}

export class DocumentNumber {
  readonly type: DocumentType
  readonly number: string

  private constructor(type: DocumentType, number: string) {
    this.type = type
    this.number = number
  }

  // ── Validation — VO is the single source of truth for its rules ────────────

  static validate(type: DocumentType, number: string): string | null {
    if (!type) return 'El tipo de documento es requerido'
    const trimmed = number?.trim() ?? ''
    if (!trimmed) return 'El número de documento es requerido'

    const rule = RULES[type]
    if (!rule) return `Tipo de documento desconocido: "${type}"`
    if (!rule.pattern.test(trimmed)) return `Formato inválido para ${type}: ${rule.hint}`
    if (trimmed.length < rule.min || trimmed.length > rule.max)
      return `El ${type} debe tener entre ${rule.min} y ${rule.max} caracteres (${rule.hint})`

    return null
  }

  static hint(type: DocumentType): string {
    return RULES[type]?.hint ?? ''
  }

  // ── Factory ────────────────────────────────────────────────────────────────

  static create(type: DocumentType, number: string): DocumentNumber {
    const err = DocumentNumber.validate(type, number)
    if (err) throw new Error(err)
    return new DocumentNumber(type, number.trim())
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  equals(other: DocumentNumber): boolean {
    return this.type === other.type && this.number === other.number
  }

  format(): string {
    return `${this.type} ${this.number}`
  }

  toString(): string {
    return this.format()
  }
}
