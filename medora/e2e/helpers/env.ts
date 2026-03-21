/**
 * Centralised environment configuration for E2E tests.
 * Values come from the loaded .env.e2e.<env> file.
 */
export const E2E_ENV     = process.env['E2E_ENV']      ?? 'local';
export const API_URL     = process.env['E2E_API_URL']  ?? 'http://localhost:3000';
export const BASE_URL    = process.env['E2E_BASE_URL'] ?? 'http://localhost:4200';
export const USE_MOCKS   = process.env['E2E_USE_MOCKS'] !== 'false';

export const CREDENTIALS = {
  ADMIN: {
    email:    process.env['E2E_ADMIN_EMAIL']        ?? 'admin@medora.com',
    password: process.env['E2E_ADMIN_PASSWORD']     ?? 'Admin123!',
  },
  DOCTOR: {
    email:    process.env['E2E_DOCTOR_EMAIL']       ?? 'doctor@medora.com',
    password: process.env['E2E_DOCTOR_PASSWORD']    ?? 'Doctor123!',
  },
  RECEPTIONIST: {
    email:    process.env['E2E_RECEPTIONIST_EMAIL']    ?? 'recepcionista@medora.com',
    password: process.env['E2E_RECEPTIONIST_PASSWORD'] ?? 'Recep123!',
  },
  AUXILIARY: {
    email:    process.env['E2E_AUXILIARY_EMAIL']    ?? 'auxiliar@medora.com',
    password: process.env['E2E_AUXILIARY_PASSWORD'] ?? 'Aux123!',
  },
} as const;

export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'AUXILIARY';
