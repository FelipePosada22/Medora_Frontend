/** Realistic mock API responses for E2E tests. */

export const MOCK_PATIENTS = [
  {
    id: 'p1', tenantId: 'tenant-1',
    name: 'María González', phone: '555-1001', email: 'maria@example.com',
    birthdate: '1985-03-15', notes: 'Alérgica a la penicilina',
    createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'p2', tenantId: 'tenant-1',
    name: 'Carlos Ramírez', phone: '555-1002', email: 'carlos@example.com',
    birthdate: '1990-07-22', notes: null,
    createdAt: '2024-02-05T00:00:00Z', updatedAt: '2024-02-05T00:00:00Z',
  },
  {
    id: 'p3', tenantId: 'tenant-1',
    name: 'Luisa Martínez', phone: '555-1003', email: 'luisa@example.com',
    birthdate: '1978-11-30', notes: 'Diabética tipo 2',
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z',
  },
];

export const MOCK_PROFESSIONALS = [
  {
    id: 'pr1', tenantId: 'tenant-1',
    name: 'Dr. Juan García', specialty: 'Medicina General',
    email: 'juan.garcia@medora.com', phone: '555-2001',
    licenseNumber: 'LIC-001', isActive: true,
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pr2', tenantId: 'tenant-1',
    name: 'Dra. Ana Flores', specialty: 'Pediatría',
    email: 'ana.flores@medora.com', phone: '555-2002',
    licenseNumber: 'LIC-002', isActive: true,
    createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z',
  },
];

export const MOCK_APPOINTMENT_TYPES = [
  {
    id: 'at1', tenantId: 'tenant-1',
    name: 'Consulta General', durationMinutes: 30,
    price: 500, color: '#6324eb', isActive: true,
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'at2', tenantId: 'tenant-1',
    name: 'Revisión Pediátrica', durationMinutes: 45,
    price: 750, color: '#0ea5e9', isActive: true,
    createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z',
  },
];

export const MOCK_APPOINTMENTS = [
  {
    id: 'a1', tenantId: 'tenant-1',
    patientId: 'p1', professionalId: 'pr1', appointmentTypeId: 'at1',
    startTime: '2026-03-20T09:00:00Z', endTime: '2026-03-20T09:30:00Z',
    status: 'SCHEDULED', notes: null,
    createdAt: '2026-03-15T00:00:00Z',
    patient:         { id: 'p1',  name: 'María González' },
    professional:    { id: 'pr1', name: 'Dr. Juan García' },
    appointmentType: { id: 'at1', name: 'Consulta General', durationMinutes: 30 },
  },
  {
    id: 'a2', tenantId: 'tenant-1',
    patientId: 'p2', professionalId: 'pr2', appointmentTypeId: 'at2',
    startTime: '2026-03-20T11:00:00Z', endTime: '2026-03-20T11:45:00Z',
    status: 'CONFIRMED', notes: 'Traer carnet de vacunación',
    createdAt: '2026-03-15T00:00:00Z',
    patient:         { id: 'p2',  name: 'Carlos Ramírez' },
    professional:    { id: 'pr2', name: 'Dra. Ana Flores' },
    appointmentType: { id: 'at2', name: 'Revisión Pediátrica', durationMinutes: 45 },
  },
  {
    id: 'a3', tenantId: 'tenant-1',
    patientId: 'p3', professionalId: 'pr1', appointmentTypeId: 'at1',
    startTime: '2026-03-19T14:00:00Z', endTime: '2026-03-19T14:30:00Z',
    status: 'COMPLETED', notes: null,
    createdAt: '2026-03-10T00:00:00Z',
    patient:         { id: 'p3',  name: 'Luisa Martínez' },
    professional:    { id: 'pr1', name: 'Dr. Juan García' },
    appointmentType: { id: 'at1', name: 'Consulta General', durationMinutes: 30 },
  },
];

export const MOCK_DASHBOARD = {
  period: { startDate: '2026-03-01', endDate: '2026-03-31' },
  patients: { total: 142, newThisMonth: 12, attendedInPeriod: 87 },
  appointments: {
    today: {
      total: 8, completed: 3, scheduled: 3, confirmed: 2, cancelled: 0, noShow: 0,
      list: [
        {
          id: 'a1', startTime: '2026-03-20T09:00:00Z', endTime: '2026-03-20T09:30:00Z',
          status: 'SCHEDULED', notes: null,
          patient: { id: 'p1', name: 'María González' },
          professional: { id: 'pr1', name: 'Dr. Juan García' },
          appointmentType: { id: 'at1', name: 'Consulta General' },
        },
      ],
    },
    inPeriod: {
      total: 87,
      byStatus: { SCHEDULED: 20, CONFIRMED: 15, COMPLETED: 45, CANCELLED: 5, NO_SHOW: 2 },
      byDay: [
        { date: '2026-03-01', count: 3 },
        { date: '2026-03-02', count: 5 },
        { date: '2026-03-03', count: 2 },
      ],
    },
  },
  revenue: {
    today: 4500, inPeriod: 42000, pendingInvoicesCount: 5, pendingAmount: 8750,
    pendingInvoices: [
      { id: 'inv1', status: 'PENDING', patient: { id: 'p1', name: 'María González' }, total: 1500 },
    ],
  },
  topProfessionals: [
    { professional: { id: 'pr1', name: 'Dr. Juan García', specialty: 'Medicina General' }, appointmentsCompleted: 45 },
    { professional: { id: 'pr2', name: 'Dra. Ana Flores', specialty: 'Pediatría' }, appointmentsCompleted: 32 },
  ],
};

export const MOCK_BILLING = [
  {
    id: 'inv1', tenantId: 'tenant-1', patientId: 'p1', appointmentId: 'a3',
    total: 500, status: 'PAID', notes: null,
    createdAt: '2026-03-19T14:30:00Z', updatedAt: '2026-03-19T14:30:00Z',
    patient: { id: 'p1', name: 'María González' },
  },
  {
    id: 'inv2', tenantId: 'tenant-1', patientId: 'p2', appointmentId: null,
    total: 750, status: 'PENDING', notes: null,
    createdAt: '2026-03-18T00:00:00Z', updatedAt: '2026-03-18T00:00:00Z',
    patient: { id: 'p2', name: 'Carlos Ramírez' },
  },
];

export const MOCK_SCHEDULES = [
  {
    id: 's1', tenantId: 'tenant-1', professionalId: 'pr1',
    dayOfWeek: 1, startTime: '08:00', endTime: '17:00', slotDurationMinutes: 30,
    isActive: true,
    professional: { id: 'pr1', name: 'Dr. Juan García' },
  },
  {
    id: 's2', tenantId: 'tenant-1', professionalId: 'pr2',
    dayOfWeek: 2, startTime: '09:00', endTime: '18:00', slotDurationMinutes: 45,
    isActive: true,
    professional: { id: 'pr2', name: 'Dra. Ana Flores' },
  },
];

export const MOCK_PRESCRIPTIONS = [
  {
    id: 'rx1', tenantId: 'tenant-1',
    patientId: 'p1', professionalId: 'pr1', appointmentId: 'a3',
    medications: [{ name: 'Ibuprofeno', dosage: '400mg', frequency: 'Cada 8h', duration: '5 días' }],
    notes: 'Tomar con alimentos',
    createdAt: '2026-03-19T14:30:00Z', updatedAt: '2026-03-19T14:30:00Z',
    patient: { id: 'p1', name: 'María González' },
    professional: { id: 'pr1', name: 'Dr. Juan García' },
  },
];

export const MOCK_TREATMENT_PLANS = [
  {
    id: 'tp1', tenantId: 'tenant-1',
    patientId: 'p1', professionalId: 'pr1',
    title: 'Plan de control diabetes',
    description: 'Seguimiento mensual',
    status: 'ACTIVE',
    startDate: '2026-01-01', endDate: '2026-12-31',
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
    patient: { id: 'p1', name: 'María González' },
    professional: { id: 'pr1', name: 'Dr. Juan García' },
  },
];

export const MOCK_SETTINGS = {
  clinic: {
    id: 'clinic-1', tenantId: 'tenant-1',
    name: 'Clínica Medora', address: 'Av. Principal 123',
    phone: '555-0000', email: 'info@medora.com',
    logo: null,
  },
  users: [
    { id: '1', name: 'Admin Medora', email: 'admin@medora.com', role: 'ADMIN', isActive: true },
    { id: '2', name: 'Dr. Juan García', email: 'juan.garcia@medora.com', role: 'DOCTOR', isActive: true },
    { id: '3', name: 'Ana Recepción', email: 'ana@medora.com', role: 'RECEPTIONIST', isActive: true },
  ],
};
