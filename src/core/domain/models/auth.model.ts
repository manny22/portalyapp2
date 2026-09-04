export interface AuthSession {
  accessToken: string
  refreshToken?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RefreshTokenDto {
  refreshToken: string
}
