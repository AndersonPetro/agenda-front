export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    name: string;
    email: string;
  }
  message: string;
}

export interface RecoveryPassword {
  email: string
}
