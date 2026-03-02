import { api } from '@/lib/api';
import { Appointment } from '@/types/appointment';
import { MedicalRecord } from '@/types/medical_record';

export const getPatientAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get('/patients/me/appointments');
  return response.data;
};

export const getPatientMedicalRecords = async (): Promise<MedicalRecord[]> => {
  const response = await api.get('/patients/me/medical-records');
  return response.data;
};
