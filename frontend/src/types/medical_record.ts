import { Doctor } from "./doctor";

export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id: number;
  visit_date: string; // Using string for date for now
  diagnosis: string;
  treatment?: string;
  notes?: string;
  doctor: Doctor;
}
