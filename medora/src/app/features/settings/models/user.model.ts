export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'AUXILIARY';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN:        'Administrador',
  DOCTOR:       'Doctor',
  RECEPTIONIST: 'Recepcionista',
  AUXILIARY:    'Auxiliar',
};

export const USER_ROLES: UserRole[] = ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'AUXILIARY'];

export interface StaffUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
  password?: string;
}
