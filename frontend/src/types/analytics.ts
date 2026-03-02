export interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  newPatients: number;
  totalDoctors: number;
  averageWaitTime: number;
}

export interface RushPrediction {
  date: string;
  predictedLoad: 'low' | 'moderate' | 'high' | 'critical';
  expectedAppointments: number;
  confidence: number;
  recommendedStaff: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  change?: number;
}

export interface TrendData {
  period: string;
  appointments: number;
  patients: number;
  revenue?: number;
}
