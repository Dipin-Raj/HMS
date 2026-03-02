export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  department: string;
  experience: number;
  rating: number;
  availableDays: string[];
  avatar?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'active' | 'on-leave' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  hoursWorked?: number;
}
