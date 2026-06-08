export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  user?: {
    id?: string;
    name: string;
    email: string;
  }
  message?: string;
}

export interface RecoveryPassword {
  email: string
}
