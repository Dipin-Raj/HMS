import { motion } from 'framer-motion';
import { Calendar, FileText, Clock, AlertCircle, ChevronRight, Plus, Stethoscope, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatTime, getRelativeDay } from '@/utils/dateUtils';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPatientAppointments, getPatientMedicalRecords } from '@/services/patientService';
import { Appointment } from '@/types/appointment';
import { MedicalRecord } from '@/types/medical_record';

// Mock data for demo
const notifications = [
  { id: '1', type: 'reminder', message: 'Upcoming appointment tomorrow at 10:00 AM', time: '2h ago' },
  { id: '2', type: 'result', message: 'Your lab results are now available', time: '5h ago' },
  { id: '3', type: 'prescription', message: 'Prescription renewed by Dr. Wilson', time: '1d ago' },
];

export default function PatientDashboard() {
  const { user } = useAuth();

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['patientAppointments'],
    queryFn: getPatientAppointments,
  });

  const { data: medicalRecords, isLoading: isLoadingMedicalRecords } = useQuery<MedicalRecord[]>({
    queryKey: ['patientMedicalRecords'],
    queryFn: getPatientMedicalRecords,
  });

  const upcomingAppointments = appointments?.filter(a => new Date(a.appointment_time) > new Date()) || [];
  const recentVisits = medicalRecords?.slice(0, 2) || [];


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">Here's an overview of your health dashboard</p>
        </div>
        <Button asChild>
          <Link to="/patient/appointments/book">
            <Plus className="mr-2 h-4 w-4" />
            Book Appointment
          </Link>
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming Appointments"
          value={upcomingAppointments.length}
          subtitle={`Next: ${upcomingAppointments.length > 0 ? getRelativeDay(upcomingAppointments[0].appointment_time) : 'None'}`}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Medical Records"
          value={medicalRecords?.length || 0}
          subtitle={`Last updated: ${medicalRecords && medicalRecords.length > 0 ? formatDate(medicalRecords[0].visit_date) : 'N/A'}`}
          icon={FileText}
          variant="info"
        />
        <StatCard
          title="Pending Reports"
          value={2}
          subtitle="Blood work & X-Ray"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Active Prescriptions"
          value={3}
          subtitle="1 renewal needed"
          icon={Pill}
          variant="success"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/patient/appointments">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAppointments ? <p>Loading...</p> : upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{`Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`}</p>
                      <p className="text-sm text-muted-foreground">{appointment.doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{getRelativeDay(appointment.appointment_time)}</p>
                    <p className="text-sm text-muted-foreground">{formatTime(new Date(appointment.appointment_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))}</p>
                  </div>
                  <StatusBadge variant="primary" dot>
                    Scheduled
                  </StatusBadge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <p className="text-sm text-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Visits */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Visits</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/records">
                View Medical History
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
            {isLoadingMedicalRecords ? <p>Loading...</p> : recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <UserAvatar name={`Dr. ${visit.doctor.first_name} ${visit.doctor.last_name}`} size="md" />
                    <div>
                      <p className="font-medium text-foreground">{`Dr. ${visit.doctor.first_name} ${visit.doctor.last_name}`}</p>
                      <p className="text-sm text-muted-foreground">{visit.doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{visit.diagnosis}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(visit.visit_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

