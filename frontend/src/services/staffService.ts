import { api } from '@/lib/api';
import { Attendance } from '@/types/attendance';

export const getStaffAttendance = async (): Promise<Attendance[]> => {
  const response = await api.get('/staff/me/attendance');
  return response.data;
};

export const checkIn = async (): Promise<Attendance> => {
  const response = await api.post('/staff/attendance/check-in');
  return response.data;
};

export const checkOut = async (): Promise<Attendance> => {
  const response = await api.put('/staff/attendance/check-out');
  return response.data;
};

export const getStaffStatus = async () => {
  const response = await api.get('/staff/me/status');
  return response.data;
};

export const updateStaffStatus = async (payload: { current_status: string; status_note?: string }) => {
  const response = await api.put('/staff/me/status', payload);
  return response.data;
};
