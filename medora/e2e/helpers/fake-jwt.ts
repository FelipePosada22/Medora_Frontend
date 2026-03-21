/**
 * Creates a syntactically valid (but unsigned) JWT that the app will accept.
 * The app decodes the payload but does NOT verify the signature, so any
 * signature value works for testing purposes.
 */
export function createFakeJwt(payload: {
  sub?: string;
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'AUXILIARY';
  tenantId: string;
  exp?: number;
}): string {
  const b64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const header  = b64url({ alg: 'HS256', typ: 'JWT' });
  const body    = b64url({
    sub:      payload.sub ?? payload.id ?? '1',
    name:     payload.name,
    email:    payload.email,
    role:     payload.role,
    tenantId: payload.tenantId,
    exp:      payload.exp ?? Math.floor(Date.now() / 1000) + 86400,
  });

  return `${header}.${body}.e2e_fake_signature`;
}

export const ADMIN_TOKEN = createFakeJwt({
  sub: '1', name: 'Admin Medora', email: 'admin@medora.com',
  role: 'ADMIN', tenantId: 'tenant-1',
});

export const DOCTOR_TOKEN = createFakeJwt({
  sub: '2', name: 'Dr. García', email: 'doctor@medora.com',
  role: 'DOCTOR', tenantId: 'tenant-1',
});

export const RECEPTIONIST_TOKEN = createFakeJwt({
  sub: '3', name: 'Ana Recepción', email: 'recep@medora.com',
  role: 'RECEPTIONIST', tenantId: 'tenant-1',
});

export const AUXILIARY_TOKEN = createFakeJwt({
  sub: '4', name: 'Luis Auxiliar', email: 'aux@medora.com',
  role: 'AUXILIARY', tenantId: 'tenant-1',
});
