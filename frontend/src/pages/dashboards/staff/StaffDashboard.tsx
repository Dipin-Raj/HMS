import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle, ClipboardList, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkIn, checkOut, getStaffAttendance, getStaffStatus, updateStaffStatus } from '@/services/staffService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data
const attendanceHistory = [
  { date: '2024-01-18', checkIn: '08:55', checkOut: '17:05', status: 'present', hours: 8.2 },
  { date: '2024-01-17', checkIn: '09:10', checkOut: '17:30', status: 'late', hours: 8.3 },
  { date: '2024-01-16', checkIn: '08:50', checkOut: '17:00', status: 'present', hours: 8.2 },
  { date: '2024-01-15', checkIn: '08:45', checkOut: '13:00', status: 'half-day', hours: 4.25 },
  { date: '2024-01-12', checkIn: null, checkOut: null, status: 'absent', hours: 0 },
];

const assignedDuties = [
  { id: '1', task: 'Front Desk Reception', time: '08:00 - 12:00', status: 'completed' },
  { id: '2', task: 'Patient Registration', time: '12:00 - 14:00', status: 'in-progress' },
  { id: '3', task: 'Records Management', time: '14:00 - 17:00', status: 'pending' },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'present':
      return 'success' as const;
    case 'late':
      return 'warning' as const;
    case 'absent':
      return 'destructive' as const;
    case 'half-day':
      return 'info' as const;
    default:
      return 'default' as const;
  }
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: staffProfile } = useQuery({
    queryKey: ['staffStatus'],
    queryFn: getStaffStatus,
  });
  const { data: attendance } = useQuery({
    queryKey: ['staffAttendance'],
    queryFn: getStaffAttendance,
  });

  const checkInMutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffStatus'] });
      queryClient.invalidateQueries({ queryKey: ['staffAttendance'] });
    },
  });
  const checkOutMutation = useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffStatus'] });
      queryClient.invalidateQueries({ queryKey: ['staffAttendance'] });
    },
  });
  const updateStatusMutation = useMutation({
    mutationFn: updateStaffStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffStatus'] });
    },
  });

  const latestAttendance = attendance?.[attendance.length - 1];
  const isCheckedIn = staffProfile?.current_status === 'on-duty';
  const checkInTime = latestAttendance?.check_in_time
    ? format(new Date(latestAttendance.check_in_time), 'h:mm a')
    : null;

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

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const currentTime = format(new Date(), 'h:mm a');

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
          <h1 className="text-2xl font-bold text-foreground">Hello, {user?.name}</h1>
          <p className="text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Status</p>
            <Select
              value={staffProfile?.current_status || "off-duty"}
              onValueChange={(value) => updateStatusMutation.mutate({ current_status: value })}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on-duty">On Duty</SelectItem>
                <SelectItem value="break">Break</SelectItem>
                <SelectItem value="off-duty">Off Duty</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Time</p>
            <p className="text-2xl font-semibold text-foreground">{currentTime}</p>
          </div>
        </div>
      </motion.div>

      {/* Check-in/out Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Today's Attendance</h2>
                {isCheckedIn ? (
                  <div className="mt-2">
                    <StatusBadge variant="success" dot size="lg">
                      Checked In {checkInTime ? `at ${checkInTime}` : ''}
                    </StatusBadge>
                  </div>
                ) : (
                  <StatusBadge variant="muted" size="lg">
                    Not Checked In
                  </StatusBadge>
                )}
              </div>
              <div className="flex gap-3">
                {isCheckedIn ? (
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={() => checkOutMutation.mutate()}
                    disabled={checkOutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Check Out
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => checkInMutation.mutate()}
                    disabled={checkInMutation.isPending}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Check In
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="This Month"
          value="18/22"
          subtitle="Days Present"
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title="Hours Worked"
          value="144.5"
          subtitle="This month"
          icon={Clock}
          variant="info"
        />
        <StatCard
          title="On-Time Rate"
          value="94%"
          subtitle="Last 30 days"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Tasks Completed"
          value={12}
          subtitle="This week"
          icon={ClipboardList}
          variant="warning"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Duties */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Today's Duties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignedDuties.map((duty) => (
                <div
                  key={duty.id}
                  className={`p-4 rounded-lg border ${
                    duty.status === 'in-progress'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{duty.task}</p>
                      <p className="text-sm text-muted-foreground">{duty.time}</p>
                    </div>
                    <StatusBadge
                      variant={
                        duty.status === 'completed'
                          ? 'success'
                          : duty.status === 'in-progress'
                          ? 'primary'
                          : 'muted'
                      }
                      dot
                    >
                      {duty.status}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance History */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceHistory.map((record) => (
                  <div
                    key={record.date}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(record.date), 'EEE, MMM d')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.checkIn
                          ? `${record.checkIn} - ${record.checkOut || 'Present'}`
                          : 'No record'}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge variant={getStatusVariant(record.status)} size="sm">
                        {record.status}
                      </StatusBadge>
                      {record.hours > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {record.hours}h
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
