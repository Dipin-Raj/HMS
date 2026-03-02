import { api } from '@/lib/api';

export type AppointmentEvent = {
  id: number;
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  event_type: string;
  event_time: string;
  payload?: Record<string, unknown> | null;
};

export type AttendanceEvent = {
  id: number;
  staff_id: number;
  event_type: string;
  event_time: string;
  payload?: Record<string, unknown> | null;
};

export type InventoryEvent = {
  id: number;
  stock_id: number;
  medicine_name: string;
  event_type: string;
  quantity_delta: number;
  event_time: string;
  payload?: Record<string, unknown> | null;
};

export type PatientVital = {
  id: number;
  patient_id: number;
  vital_type: string;
  value: string;
  unit?: string | null;
  source?: string | null;
  recorded_at: string;
  payload?: Record<string, unknown> | null;
};

type EventsQuery = {
  start_time?: string;
  end_time?: string;
  skip?: number;
  limit?: number;
};

function toQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export const eventsService = {
  getAppointmentEvents: async (params?: EventsQuery & { patient_id?: number; doctor_id?: number; event_type?: string }) => {
    const response = await api.get<AppointmentEvent[]>(
      `/events/appointments${toQuery(params)}`
    );
    return response.data;
  },

  getAttendanceEvents: async (params?: EventsQuery & { staff_id?: number; event_type?: string }) => {
    const response = await api.get<AttendanceEvent[]>(
      `/events/attendance${toQuery(params)}`
    );
    return response.data;
  },

  getInventoryEvents: async (params?: EventsQuery & { stock_id?: number; medicine_name?: string; event_type?: string }) => {
    const response = await api.get<InventoryEvent[]>(
      `/events/inventory${toQuery(params)}`
    );
    return response.data;
  },

  getPatientVitals: async (params?: EventsQuery & { patient_id?: number; vital_type?: string }) => {
    const response = await api.get<PatientVital[]>(
      `/events/vitals${toQuery(params)}`
    );
    return response.data;
  },
};
