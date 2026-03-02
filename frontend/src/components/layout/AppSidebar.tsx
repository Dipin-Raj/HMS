import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  UserCog,
  Stethoscope,
  Pill,
  ClipboardList,
  BarChart3,
  Clock,
  BrainCircuit,
  Settings,
  Activity,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  patient: [
    { label: 'Dashboard', href: '/patient', icon: LayoutDashboard },
    { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'Medical Records', href: '/patient/records', icon: FileText },
    { label: 'Reports', href: '/patient/reports', icon: ClipboardList },
    { label: 'Profile', href: '/patient/profile', icon: Settings },
  ],
  doctor: [
    { label: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
    { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { label: 'Patients', href: '/doctor/patients', icon: Users },
    { label: 'Consultations', href: '/doctor/consultations', icon: Stethoscope },
    { label: 'Schedule', href: '/doctor/schedule', icon: Clock },
    { label: 'Analytics', href: '/doctor/analytics', icon: BarChart3 },
  ],
  staff: [
    { label: 'Dashboard', href: '/staff', icon: LayoutDashboard },
    { label: 'Appointments', href: '/staff/appointments', icon: Calendar },
    { label: 'Attendance', href: '/staff/attendance', icon: ClipboardList },
    { label: 'Duties', href: '/staff/duties', icon: Clock },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { label: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
    { label: 'Staff', href: '/admin/staff', icon: UserCog },
    { label: 'Patients', href: '/admin/patients', icon: Users },
    { label: 'Pharmacy', href: '/admin/pharmacy', icon: Pill },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'AI Insights', href: '/admin/ai-insights', icon: BrainCircuit },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  pharmacy: [
    { label: 'Dashboard', href: '/pharmacy', icon: LayoutDashboard },
    { label: 'Inventory', href: '/pharmacy/inventory', icon: Pill },
    { label: 'Stock Alerts', href: '/pharmacy/alerts', icon: Activity },
    { label: 'Demand Forecast', href: '/pharmacy/forecast', icon: BrainCircuit },
    { label: 'Analytics', href: '/pharmacy/analytics', icon: BarChart3 },
  ],
};

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  const navItems = NAV_ITEMS[user.role] || [];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 sidebar-gradient border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            H
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">HealthCare</h1>
            <p className="text-xs text-sidebar-foreground/60">Management System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== `/${user.role}` && location.pathname.startsWith(item.href));
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-primary text-sm font-medium">
              {user.avatar || user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
