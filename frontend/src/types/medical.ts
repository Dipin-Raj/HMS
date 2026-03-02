export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  prescription: Prescription[];
  notes?: string;
  followUpDate?: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  testName: string;
  date: string;
  status: 'pending' | 'completed' | 'reviewed';
  results?: Record<string, string | number>;
  doctorNotes?: string;
}
