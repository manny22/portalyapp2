export class AuthorizationCode {
  readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): AuthorizationCode {
    const trimmed = value.trim().toUpperCase()
    if (!trimmed || trimmed.length < 6) {
      throw new Error(`Código de autorización inválido: "${value}"`)
    }
    return new AuthorizationCode(trimmed)
  }

  static generate(): AuthorizationCode {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return new AuthorizationCode(code)
  }

  equals(other: AuthorizationCode): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
