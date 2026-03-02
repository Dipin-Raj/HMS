import { UserRole } from '@/types/auth';

type Permission = 
  | 'view_dashboard'
  | 'view_appointments'
  | 'create_appointment'
  | 'cancel_appointment'
  | 'view_medical_records'
  | 'create_medical_record'
  | 'view_patients'
  | 'manage_patients'
  | 'view_staff'
  | 'manage_staff'
  | 'view_doctors'
  | 'manage_doctors'
  | 'view_pharmacy'
  | 'manage_pharmacy'
  | 'view_analytics'
  | 'view_ai_predictions'
  | 'manage_attendance';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  patient: [
    'view_dashboard',
    'view_appointments',
    'create_appointment',
    'cancel_appointment',
    'view_medical_records',
  ],
  doctor: [
    'view_dashboard',
    'view_appointments',
    'view_medical_records',
    'create_medical_record',
    'view_patients',
    'view_analytics',
    'view_ai_predictions',
  ],
  staff: [
    'view_dashboard',
    'view_appointments',
    'create_appointment',
    'view_patients',
    'manage_attendance',
  ],
  admin: [
    'view_dashboard',
    'view_appointments',
    'create_appointment',
    'cancel_appointment',
    'view_medical_records',
    'view_patients',
    'manage_patients',
    'view_staff',
    'manage_staff',
    'view_doctors',
    'manage_doctors',
    'view_pharmacy',
    'manage_pharmacy',
    'view_analytics',
    'view_ai_predictions',
  ],
  pharmacy: [
    'view_dashboard',
    'view_pharmacy',
    'manage_pharmacy',
    'view_analytics',
    'view_ai_predictions',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
