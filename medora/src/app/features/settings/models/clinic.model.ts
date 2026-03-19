export interface Clinic {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  timezone: string | null;
  currency: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClinicPayload {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone?: string;
  currency?: string;
}
