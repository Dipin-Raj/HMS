import { api } from '@/lib/api';
import { Appointment } from '@/types/appointment';

export const getDoctorAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get('/doctors/me/appointments');
  return response.data;
};

export const updateAppointmentStatus = async ({ id, status }: { id: number; status: string }): Promise<Appointment> => {
  const response = await api.put(`/appointments/${id}`, { status });
  return response.data;
};

export const getDoctorStatus = async () => {
  const response = await api.get('/doctors/me/status');
  return response.data;
};

export const updateDoctorStatus = async (payload: { current_status: string; status_note?: string }) => {
  const response = await api.put('/doctors/me/status', payload);
  return response.data;
};
