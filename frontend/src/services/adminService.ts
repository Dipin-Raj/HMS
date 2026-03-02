import { api } from './api';

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_time: string; // Use string for ISO format date-time
  status: string;
  notes?: string;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
  };
  doctor: {
    id: number;
    first_name: string;
    last_name: string;
    specialization: string;
  };
}

// Properties to receive via API on creation
export interface AppointmentCreate {
    patient_id: number;
    doctor_id: number;
    appointment_time: string; // Ensure it's a string for consistent ISO format
    status?: string;
    notes?: string;
}

// Properties to receive via API on update
export interface AppointmentUpdate {
    patient_id?: number;
    doctor_id?: number;
    appointment_time?: string;
    status?: string;
    notes?: string;
}

export interface Doctor {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  phone_number?: string;
  current_status?: string;
  status_note?: string;
  status_updated_at?: string;
}

// Properties to receive via API on creation
export interface DoctorCreate {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  specialization: string;
  phone_number?: string;
}

// Properties to receive via API on update
export interface DoctorUpdate {
  first_name?: string;
  last_name?: string;
  specialization?: string;
  phone_number?: string;
}

export interface Staff {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  job_title: string;
  current_status?: string;
  status_note?: string;
  status_updated_at?: string;
}

// Properties to receive via API on creation
export interface StaffCreate {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  job_title: string;
}

// Properties to receive via API on update
export interface StaffUpdate {
  first_name?: string;
  last_name?: string;
  job_title?: string;
}

export interface Patient {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string; // ISO date string
  gender?: string;
  phone_number?: string;
  address?: string;
}

// Properties to receive via API on creation
export interface PatientCreate {
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string; // ISO date string
  gender?: string;
  phone_number?: string;
  address?: string;
}

// Properties to receive via API on update
export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
  address?: string;
}

export interface PharmacyStock {
  id: number;
  medicine_name: string;
  quantity: number;
  unit_price: number; // Assuming number for Decimal
  last_updated: string; // ISO date-time string
}

// Properties to receive via API on creation
export interface PharmacyStockCreate {
  medicine_name: string;
  quantity: number;
  unit_price: number;
}

// Properties to receive via API on update
export interface PharmacyStockUpdate {
  medicine_name?: string;
  quantity?: number;
  unit_price?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AdminEmailSettings {
  is_configured: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  from_email?: string;
  from_name?: string;
  use_tls?: boolean;
}

export interface AdminEmailSettingsUpdate {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password?: string;
  from_email: string;
  from_name: string;
  use_tls: boolean;
}

export const adminService = {
  getAppointments: async (params?: { skip?: number; limit?: number; patient_id?: number; doctor_id?: number; status?: string }): Promise<Appointment[]> => {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      }
    }
    return api.get<Appointment[]>(`/appointments?${query.toString()}`);
  },

  createAppointment: async (data: AppointmentCreate): Promise<Appointment> => {
    return api.post<Appointment>('/appointments/admin', data);
  },

  updateAppointment: async (id: number, data: AppointmentUpdate): Promise<Appointment> => {
    return api.put<Appointment>(`/appointments/${id}`, data);
  },

  deleteAppointment: async (id: number): Promise<void> => {
    return api.delete<void>(`/appointments/${id}`);
  },

  getDoctors: async (params?: { skip?: number; limit?: number; specialization?: string }): Promise<Doctor[]> => {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      }
    }
    return api.get<Doctor[]>(`/doctors?${query.toString()}`);
  },

  createDoctor: async (data: DoctorCreate): Promise<Doctor> => {
    return api.post<Doctor>('/doctors/invite', data);
  },

  updateDoctor: async (id: number, data: DoctorUpdate): Promise<Doctor> => {
    return api.put<Doctor>(`/doctors/${id}`, data);
  },

  deleteDoctor: async (id: number): Promise<void> => {
    return api.delete<void>(`/doctors/${id}`);
  },

  getStaff: async (params?: { skip?: number; limit?: number; job_title?: string }): Promise<Staff[]> => {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      }
    }
    return api.get<Staff[]>(`/staff?${query.toString()}`);
  },

  createStaff: async (data: StaffCreate): Promise<Staff> => {
    return api.post<Staff>('/staff/invite', data);
  },

  updateStaff: async (id: number, data: StaffUpdate): Promise<Staff> => {
    return api.put<Staff>(`/staff/${id}`, data);
  },

  deleteStaff: async (id: number): Promise<void> => {
    return api.delete<void>(`/staff/${id}`);
  },

  getPatients: async (params?: { skip?: number; limit?: number; gender?: string }): Promise<Patient[]> => {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      }
    }
    return api.get<Patient[]>(`/patients?${query.toString()}`);
  },

  createPatient: async (data: PatientCreate): Promise<Patient> => {
    return api.post<Patient>('/patients', data);
  },

  updatePatient: async (id: number, data: PatientUpdate): Promise<Patient> => {
    return api.put<Patient>(`/patients/${id}`, data);
  },

  deletePatient: async (id: number): Promise<void> => {
    return api.delete<void>(`/patients/${id}`);
  },

  getPharmacyStock: async (params?: { skip?: number; limit?: number; medicine_name?: string }): Promise<PharmacyStock[]> => {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      }
    }
    return api.get<PharmacyStock[]>(`/pharmacy/stock?${query.toString()}`);
  },

  createPharmacyStock: async (data: PharmacyStockCreate): Promise<PharmacyStock> => {
    return api.post<PharmacyStock>('/pharmacy/stock', data);
  },

  updatePharmacyStock: async (id: number, data: PharmacyStockUpdate): Promise<PharmacyStock> => {
    return api.put<PharmacyStock>(`/pharmacy/stock/${id}`, data);
  },

  deletePharmacyStock: async (id: number): Promise<void> => {
    return api.delete<void>(`/pharmacy/stock/${id}`);
  },

  getUsers: async (params?: { skip?: number; limit?: number; role?: string }): Promise<User[]> => {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      }
    }
    return api.get<User[]>(`/admin/users?${query.toString()}`);
  },

  getMyEmailSettings: async (): Promise<AdminEmailSettings> => {
    return api.get<AdminEmailSettings>("/admin/me/email-settings");
  },

  saveMyEmailSettings: async (data: AdminEmailSettingsUpdate): Promise<AdminEmailSettings> => {
    return api.put<AdminEmailSettings>("/admin/me/email-settings", data);
  },

  sendMyEmailSettingsTest: async (recipient_email: string): Promise<{ message: string }> => {
    return api.post<{ message: string }>("/admin/me/email-settings/test", { recipient_email });
  },
};
