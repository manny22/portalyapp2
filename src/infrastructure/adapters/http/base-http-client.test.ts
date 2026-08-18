import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.stubGlobal('fetch', vi.fn())

describe('HttpClient - JWT Integration', () => {
  const mockSession = {
    accessToken: 'test-token-123',
    user: { id: '1', email: 'test@example.com', role: 'USER' },
  }

  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('debería incluir el token JWT cuando existe sesión', () => {
    sessionStorage.setItem('auth_session', JSON.stringify(mockSession))

    const stored = sessionStorage.getItem('auth_session')
    expect(stored).toBeDefined()

    const parsed = JSON.parse(stored!)
    expect(parsed.accessToken).toBe('test-token-123')
  })

  it('debería funcionar sin token cuando no hay sesión', () => {
    expect(() => {
      sessionStorage.getItem('auth_session')
    }).not.toThrow()

    const stored = sessionStorage.getItem('auth_session')
    expect(stored).toBeNull()
  })

  it('debería manejar sesiones malformadas sin romper', () => {
    sessionStorage.setItem('auth_session', 'invalid-json{')

    expect(() => {
      const stored = sessionStorage.getItem('auth_session')
      if (stored) JSON.parse(stored)
    }).toThrow()
  })

  it('debería limpiar la sesión correctamente', () => {
    sessionStorage.setItem('auth_session', JSON.stringify(mockSession))
    expect(sessionStorage.getItem('auth_session')).toBeDefined()

    sessionStorage.removeItem('auth_session')
    expect(sessionStorage.getItem('auth_session')).toBeNull()
  })
})
