import { Patient } from "./patient";
import { Doctor } from "./doctor";

export interface Appointment {
  id: number;
  doctor_id: number;
  appointment_time: string; // Using string for datetime for now
  status: string;
  notes?: string;
  patient: Patient;
  doctor: Doctor;
}