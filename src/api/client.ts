const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('zuricare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  patients: {
    list: (params?: { search?: string; filter?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.filter) q.set('filter', params.filter);
      return fetchApi<Array<{ id: string; name: string; phone: string; lastAccess: string; registered: string }>>(
        `/patients?${q}`
      );
    },
    lookup: (zuriCareId: string) =>
      fetchApi<{ found: boolean; id?: string; name?: string }>(`/patients/lookup/${encodeURIComponent(zuriCareId)}`),
    register: (data: {
      fullName: string;
      dateOfBirth?: string;
      nationality?: string;
      phone?: string;
      email?: string;
      bloodType?: string;
      allergies?: string[];
      chronicConditions?: string[];
      vaccinations?: string[];
      emergencyContact?: { name: string; relationship?: string; phone: string };
    }) => fetchApi<{ id: string; zuriCareId: string }>('/patients', { method: 'POST', body: JSON.stringify(data) }),
  },
  prescriptions: {
    list: (status?: string) =>
      fetchApi<
        Array<{
          id: string;
          patient: string;
          medication: string;
          dosage: string;
          prescriber: string;
          date: string;
          condition: string;
          status: string;
        }>
      >(`/prescriptions${status && status !== 'all' ? `?status=${status}` : ''}`),
    add: (data: {
      patientId: string;
      medicationName: string;
      dosage?: string;
      datePrescribed?: string;
      duration?: string;
      condition?: string;
      pharmacy?: string;
    }) => fetchApi<{ id: string }>('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  },
  consent: {
    list: (status?: string) =>
      fetchApi<
        Array<{
          id: string;
          patient: string;
          zuriId: string;
          scopes: string[];
          status: string;
          sentAt: string;
        }>
      >(`/consent${status && status !== 'all' ? `?status=${status}` : ''}`),
    request: (data: { patientId: string; scopes: string[]; reason?: string }) =>
      fetchApi<{ id: string }>('/consent', { method: 'POST', body: JSON.stringify(data) }),
  },
  audit: {
    list: (params?: { dateFrom?: string; dateTo?: string; action?: string }) => {
      const q = new URLSearchParams();
      if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
      if (params?.dateTo) q.set('dateTo', params.dateTo);
      if (params?.action) q.set('action', params.action);
      return fetchApi<
        Array<{
          id: string;
          timestamp: string;
          user: string;
          patient: string;
          action: string;
          result: string;
          scopes: string;
        }>
      >(`/audit?${q}`);
    },
  },
  dashboard: {
    stats: () =>
      fetchApi<{ patientsToday: number; pendingConsent: number; accessEvents: number }>('/dashboard/stats'),
    activity: () =>
      fetchApi<
        Array<{
          patient: string;
          action: string;
          time: string;
          status: string;
        }>
      >('/dashboard/activity'),
    weeklyChart: () =>
      fetchApi<Array<{ day: string; count: number }>>('/dashboard/charts/weekly'),
    consentChart: () =>
      fetchApi<Array<{ name: string; value: number; color: string }>>('/dashboard/charts/consent'),
  },
  auth: {
    login: (email: string, password: string) =>
      fetchApi<{ token: string; user: { id: string; email: string; fullName: string; clinicName: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    logout: () =>
      fetchApi<{ ok: boolean }>('/auth/logout', {
        method: 'POST',
        headers: { ...getAuthHeaders() },
      }),
    me: () =>
      fetchApi<{ user: { id: string; email: string; fullName: string; clinicName: string } }>('/auth/me', {
        headers: { ...getAuthHeaders() },
      }),
  },
  transfers: {
    clinics: (exclude?: string) =>
      fetchApi<Array<{ id: string; name: string; type: string; location: string; country: string }>>(
        `/transfers/clinics${exclude ? `?exclude=${encodeURIComponent(exclude)}` : ''}`
      ),
    list: (status?: string) =>
      fetchApi<
        Array<{
          id: string;
          patientId: string;
          patientName: string;
          fromClinic: string;
          fromCountry: string;
          toClinic: string;
          toCountry: string;
          reason: string;
          status: string;
          transferDate: string;
          createdAt: string;
        }>
      >(`/transfers${status && status !== 'all' ? `?status=${status}` : ''}`),
    create: (data: {
      patientId: string;
      toClinicId: string;
      reason?: string;
      transferDate?: string;
      notes?: string;
    }) => fetchApi<{ id: string }>('/transfers', { method: 'POST', body: JSON.stringify(data) }),
    complete: (id: string) =>
      fetchApi<{ ok: boolean }>(`/transfers/${id}/complete`, { method: 'POST' }),
  },
  clinic: {
    getSettings: () =>
      fetchApi<{
        clinic: {
          id: string;
          name: string;
          type: string;
          address: string;
          location: string;
          country: string;
          phone: string;
          email: string;
          website: string;
          description: string;
          hours: string;
          open24_7: boolean;
          refugeeFriendly: boolean;
          latitude: string;
          longitude: string;
        };
        services: string[];
        consentTimeout: string;
        defaultScopes: string[];
        staff: Array<{ id: string; fullName: string; email: string; role: string }>;
      }>('/clinic/settings'),
    updateSettings: (data: {
      name?: string;
      type?: string;
      address?: string;
      location?: string;
      country?: string;
      phone?: string;
      email?: string;
      website?: string;
      description?: string;
      hours?: string;
      open24_7?: boolean;
      refugeeFriendly?: boolean;
      latitude?: string;
      longitude?: string;
      services?: string[];
      consentTimeout?: string;
      defaultScopes?: string[];
    }) => fetchApi<{ ok: boolean }>('/clinic/settings', { method: 'PUT', body: JSON.stringify(data) }),
    getRoles: () =>
      fetchApi<Array<{ id: string; name: string; description: string }>>('/clinic/roles'),
    invite: (data: { email: string; roleId: string }) =>
      fetchApi<{ ok: boolean; message: string }>('/clinic/invite', { method: 'POST', body: JSON.stringify(data) }),
  },
  medicalSummary: (patientId: string) =>
    fetchApi<{
      patientId: string;
      patientName: string;
      consentGrantedAt: string;
      expiry: string;
      allergies: string[];
      bloodType: string;
      chronicConditions: string[];
      vaccinationHistory: string[];
      prescriptionHistory: Array<{
        medication: string;
        dosage: string;
        prescriber: string;
        date: string;
        status: string;
      }>;
      emergencyContact: { name: string; relationship: string; phone: string };
    }>(`/medical-summary?patient=${encodeURIComponent(patientId)}`),
};
