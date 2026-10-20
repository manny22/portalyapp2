const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
const SESSION_STORAGE_KEY = 'auth_session'

export interface HttpClientOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

export class HttpClient {
  private getAuthToken(): string | null {
    try {
      const session = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (!session) return null
      const parsed = JSON.parse(session)
      return parsed?.accessToken || null
    } catch {
      return null
    }
  }

  private buildHeaders(userHeaders?: HeadersInit): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (userHeaders && typeof userHeaders === 'object') {
      Object.assign(headers, userHeaders)
    }

    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async request<T>(endpoint: string, options: HttpClientOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const url = new URL(`${API_BASE_URL}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers: this.buildHeaders(fetchOptions.headers),
    })

    // Manejar error 401 (No autorizado)
    if (response.status === 401) {
      // Limpiar sesión
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
      // Redirigir a login
      window.location.href = '/login'
      // Lanzar error para detener la ejecución
      throw new Error('No autorizado. Inicia sesión nuevamente.')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  get<T>(endpoint: string, options?: HttpClientOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, body?: unknown, options?: HttpClientOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  put<T>(endpoint: string, body?: unknown, options?: HttpClientOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(endpoint: string, body?: unknown, options?: HttpClientOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(endpoint: string, options?: HttpClientOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const httpClient = new HttpClient()
