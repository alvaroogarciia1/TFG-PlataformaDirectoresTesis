export type UserRole = "STUDENT" | "PROFESSOR" | "ADMIN";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  id: number;
  email: string;
  role: UserRole;
  active: boolean;
  token: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  role: UserRole;
  active: boolean;
}