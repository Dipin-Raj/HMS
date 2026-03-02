import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  UserCog,
  Stethoscope,
  Pill,
  TrendingUp,
  Activity,
  AlertTriangle,
  ChevronRight,
  BrainCircuit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data
const appointmentTrends = [
  { date: 'Jan 1', appointments: 45, completed: 42 },
  { date: 'Jan 2', appointments: 52, completed: 48 },
  { date: 'Jan 3', appointments: 48, completed: 45 },
  { date: 'Jan 4', appointments: 61, completed: 58 },
  { date: 'Jan 5', appointments: 55, completed: 52 },
  { date: 'Jan 6', appointments: 67, completed: 63 },
  { date: 'Jan 7', appointments: 38, completed: 35 },
];

const departmentData = [
  { name: 'Cardiology', value: 28, color: 'hsl(var(--chart-1))' },
  { name: 'Orthopedics', value: 22, color: 'hsl(var(--chart-2))' },
  { name: 'Pediatrics', value: 18, color: 'hsl(var(--chart-3))' },
  { name: 'Dermatology', value: 15, color: 'hsl(var(--chart-4))' },
  { name: 'General', value: 17, color: 'hsl(var(--chart-5))' },
];

const rushPredictions = [
  { day: 'Mon', predicted: 55, actual: 52, risk: 'moderate' },
  { day: 'Tue', predicted: 72, actual: null, risk: 'high' },
  { day: 'Wed', predicted: 48, actual: null, risk: 'low' },
  { day: 'Thu', predicted: 65, actual: null, risk: 'moderate' },
  { day: 'Fri', predicted: 80, actual: null, risk: 'critical' },
];

const stockAlerts = [
  { medicine: 'Amoxicillin 500mg', current: 45, reorder: 100, severity: 'critical' },
  { medicine: 'Ibuprofen 400mg', current: 78, reorder: 150, severity: 'low' },
  { medicine: 'Paracetamol 500mg', current: 23, reorder: 200, severity: 'critical' },
  { medicine: 'Omeprazole 20mg', current: 120, reorder: 100, severity: 'ok' },
];

const doctorUtilization = [
  { name: 'Dr. Wilson', utilization: 92, appointments: 24 },
  { name: 'Dr. Chen', utilization: 85, appointments: 21 },
  { name: 'Dr. Davis', utilization: 78, appointments: 19 },
  { name: 'Dr. Brown', utilization: 65, appointments: 16 },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Hospital overview and AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/analytics">
              View Analytics
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/ai-insights">
              <BrainCircuit className="mr-2 h-4 w-4" />
              AI Insights
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Today's Appointments"
          value={67}
          change={8}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Total Patients"
          value="2,547"
          change={3}
          icon={Users}
          variant="info"
        />
        <StatCard
          title="Active Doctors"
          value={24}
          subtitle="3 on leave"
          icon={Stethoscope}
          variant="success"
        />
        <StatCard
          title="Staff Present"
          value="45/52"
          subtitle="86.5% attendance"
          icon={UserCog}
          variant="warning"
        />
        <StatCard
          title="Stock Alerts"
          value={3}
          subtitle="2 critical"
          icon={Pill}
          variant="primary"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Appointment Trends */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Appointment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Bar dataKey="appointments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">By Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {departmentData.slice(0, 4).map((dept) => (
                  <div key={dept.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="text-muted-foreground">{dept.name}</span>
                    <span className="font-medium ml-auto">{dept.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Predictions & Alerts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rush Prediction */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                AI Rush Prediction
              </CardTitle>
              <StatusBadge variant="info">Live</StatusBadge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rushPredictions.map((day) => (
                  <div key={day.day} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-foreground">{day.day}</div>
                    <div className="flex-1">
                      <Progress
                        value={(day.predicted / 100) * 100}
                        className={`h-3 ${
                          day.risk === 'critical'
                            ? '[&>div]:bg-destructive'
                            : day.risk === 'high'
                            ? '[&>div]:bg-warning'
                            : day.risk === 'moderate'
                            ? '[&>div]:bg-info'
                            : '[&>div]:bg-success'
                        }`}
                      />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-semibold">{day.predicted}</span>
                      <span className="text-xs text-muted-foreground"> apt</span>
                    </div>
                    <StatusBadge
                      variant={
                        day.risk === 'critical'
                          ? 'destructive'
                          : day.risk === 'high'
                          ? 'warning'
                          : day.risk === 'moderate'
                          ? 'info'
                          : 'success'
                      }
                      size="sm"
                    >
                      {day.risk}
                    </StatusBadge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Predictions based on historical patterns • 85% accuracy
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Alerts */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Stock Alerts
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/pharmacy">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockAlerts.map((alert) => (
                  <div
                    key={alert.medicine}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{alert.medicine}</p>
                      <p className="text-xs text-muted-foreground">
                        {alert.current} / {alert.reorder} units
                      </p>
                    </div>
                    <StatusBadge
                      variant={
                        alert.severity === 'critical'
                          ? 'destructive'
                          : alert.severity === 'low'
                          ? 'warning'
                          : 'success'
                      }
                      dot
                    >
                      {alert.severity}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Doctor Utilization */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Doctor Utilization</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/doctors">View All Doctors</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {doctorUtilization.map((doctor) => (
                <div key={doctor.name} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-foreground">{doctor.name}</p>
                    <span className="text-sm font-semibold text-primary">
                      {doctor.utilization}%
                    </span>
                  </div>
                  <Progress value={doctor.utilization} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {doctor.appointments} appointments today
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
