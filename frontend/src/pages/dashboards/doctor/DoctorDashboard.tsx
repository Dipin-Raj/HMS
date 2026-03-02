import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  ChevronRight,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDoctorAppointments, updateAppointmentStatus, getDoctorStatus, updateDoctorStatus } from '@/services/doctorService';
import { Appointment } from '@/types/appointment';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data
const weeklyData: any[] = [
];

const rushPrediction = {
  tomorrow: { level: 'high' as const, appointments: 0, confidence: 0 },
  dayAfter: { level: 'moderate' as const, appointments: 0, confidence: 0 },
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'in-progress':
      return <Clock className="h-4 w-4 text-warning" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success' as const;
    case 'in-progress':
      return 'warning' as const;
    case 'cancelled':
      return 'destructive' as const;
    default:
      return 'primary' as const;
  }
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['doctorAppointments'],
    queryFn: getDoctorAppointments,
  });

  const { data: doctorProfile, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['doctorStatus'],
    queryFn: getDoctorStatus,
  });

  const updateDoctorStatusMutation = useMutation({
    mutationFn: updateDoctorStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorStatus'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
    },
  });

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const todayAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.appointment_time);
    const today = new Date();
    return appointmentDate.getDate() === today.getDate() &&
           appointmentDate.getMonth() === today.getMonth() &&
           appointmentDate.getFullYear() === today.getFullYear();
  }) || [];


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

  const completedCount = todayAppointments.filter((a) => a.status === 'completed').length;
  const remainingCount = todayAppointments.filter((a) => a.status === 'scheduled').length;

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
          <h1 className="text-2xl font-bold text-foreground">Good Morning, {user?.name}</h1>
          <p className="text-muted-foreground">
            You have {remainingCount} appointments remaining today
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Status</p>
            <Select
              value={doctorProfile?.current_status || "off-duty"}
              onValueChange={(value) => updateDoctorStatusMutation.mutate({ current_status: value })}
              disabled={isLoadingStatus || updateDoctorStatusMutation.isPending}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on-duty">On Duty</SelectItem>
                <SelectItem value="rounds">Rounds</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="break">Break</SelectItem>
                <SelectItem value="off-duty">Off Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients..." className="pl-9 w-64" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          subtitle={`${completedCount} completed, ${remainingCount} remaining`}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Weekly Patients"
          value={73}
          change={12}
          icon={Users}
          variant="info"
        />
        <StatCard
          title="Avg. Consultation Time"
          value="24 min"
          change={-8}
          icon={Clock}
          variant="success"
        />
        <StatCard
          title="Patient Satisfaction"
          value="4.8/5"
          subtitle="Based on 156 reviews"
          icon={TrendingUp}
          variant="warning"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
              <Button variant="ghost" size="sm">
                View Full Calendar
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {isLoading ? (
                  <p className="p-4">Loading appointments...</p>
                ) : (
                  todayAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                        appointment.status === 'in-progress' ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-semibold text-foreground">
                            {format(parseISO(appointment.appointment_time), 'p')}
                          </p>
                        </div>
                        <UserAvatar name={`${appointment.patient.first_name} ${appointment.patient.last_name}`} size="md" />
                        <div>
                          <p className="font-medium text-foreground">{`${appointment.patient.first_name} ${appointment.patient.last_name}`}</p>
                          <p className="text-sm text-muted-foreground">{appointment.notes || 'No reason provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge variant={getStatusVariant(appointment.status)} dot>
                          {appointment.status.replace('-', ' ')}
                        </StatusBadge>
                        {appointment.status === 'scheduled' && (
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(appointment.id, 'in-progress')}>
                            Start
                          </Button>
                        )}
                        {appointment.status === 'in-progress' && (
                          <Button size="sm" onClick={() => handleUpdateStatus(appointment.id, 'completed')}>
                            Complete
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Rush Prediction */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Rush Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Tomorrow</span>
                  <StatusBadge variant="destructive">High Load</StatusBadge>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {rushPrediction.tomorrow.appointments} appointments
                </p>
                <p className="text-xs text-muted-foreground">
                  {rushPrediction.tomorrow.confidence}% confidence
                </p>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Day After</span>
                  <StatusBadge variant="warning">Moderate</StatusBadge>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {rushPrediction.dayAfter.appointments} appointments
                </p>
                <p className="text-xs text-muted-foreground">
                  {rushPrediction.dayAfter.confidence}% confidence
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center pt-2">
                AI predictions based on historical patterns
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Overview Chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    stackId="2"
                    stroke="hsl(var(--info))"
                    fill="hsl(var(--info))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
