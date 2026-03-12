/** Credentials submitted on the login form. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** JWT tokens returned by the auth API. */
export interface AuthTokens {
  accessToken: string;
}

/** Authenticated user domain model. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
  tenantId: string;
}
