import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { eventsService, AppointmentEvent, AttendanceEvent, InventoryEvent, PatientVital } from '@/services/eventsService';

export default function AIInsightsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentEvents, setAppointmentEvents] = useState<AppointmentEvent[]>([]);
  const [attendanceEvents, setAttendanceEvents] = useState<AttendanceEvent[]>([]);
  const [inventoryEvents, setInventoryEvents] = useState<InventoryEvent[]>([]);
  const [patientVitals, setPatientVitals] = useState<PatientVital[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const now = new Date();
        const last30 = new Date(now);
        last30.setDate(now.getDate() - 30);
        const last7 = new Date(now);
        last7.setDate(now.getDate() - 7);

        const [appointments, attendance, inventory, vitals] = await Promise.all([
          eventsService.getAppointmentEvents({ start_time: last30.toISOString(), limit: 500 }),
          eventsService.getAttendanceEvents({ start_time: last7.toISOString(), limit: 500 }),
          eventsService.getInventoryEvents({ start_time: last30.toISOString(), limit: 500 }),
          eventsService.getPatientVitals({ start_time: last30.toISOString(), limit: 200 }),
        ]);

        setAppointmentEvents(appointments);
        setAttendanceEvents(attendance);
        setInventoryEvents(inventory);
        setPatientVitals(vitals);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    const created = appointmentEvents.filter((e) => e.event_type.startsWith('created')).length;
    const completed = appointmentEvents.filter((e) => e.event_type === 'status_completed').length;
    const cancelled = appointmentEvents.filter((e) => e.event_type === 'status_cancelled').length;
    const rescheduled = appointmentEvents.filter((e) => e.event_type === 'status_rescheduled').length;

    const checkIns = attendanceEvents.filter((e) => e.event_type === 'check_in').length;
    const checkOuts = attendanceEvents.filter((e) => e.event_type === 'check_out').length;

    const restocked = inventoryEvents
      .filter((e) => e.quantity_delta > 0)
      .reduce((sum, e) => sum + e.quantity_delta, 0);
    const dispensed = inventoryEvents
      .filter((e) => e.quantity_delta < 0)
      .reduce((sum, e) => sum + Math.abs(e.quantity_delta), 0);

    return {
      created,
      completed,
      cancelled,
      rescheduled,
      checkIns,
      checkOuts,
      restocked,
      dispensed,
    };
  }, [appointmentEvents, attendanceEvents, inventoryEvents]);

  const recentEvents = useMemo(() => {
    const normalized = [
      ...appointmentEvents.map((e) => ({
        id: `apt-${e.id}`,
        time: e.event_time,
        label: `Appointment ${e.event_type.replace('status_', '')}`,
        meta: `Patient ${e.patient_id}, Doctor ${e.doctor_id}`,
      })),
      ...attendanceEvents.map((e) => ({
        id: `att-${e.id}`,
        time: e.event_time,
        label: `Staff ${e.event_type.replace('_', ' ')}`,
        meta: `Staff ${e.staff_id}`,
      })),
      ...inventoryEvents.map((e) => ({
        id: `inv-${e.id}`,
        time: e.event_time,
        label: `Inventory ${e.event_type.replace('stock_', '')}`,
        meta: `${e.medicine_name} (${e.quantity_delta > 0 ? '+' : ''}${e.quantity_delta})`,
      })),
      ...patientVitals.map((e) => ({
        id: `vit-${e.id}`,
        time: e.recorded_at,
        label: `Vital ${e.vital_type}`,
        meta: `Patient ${e.patient_id} • ${e.value}${e.unit ? ` ${e.unit}` : ''}`,
      })),
    ];

    return normalized
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [appointmentEvents, attendanceEvents, inventoryEvents, patientVitals]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Insights</h1>
        <p className="text-muted-foreground">Live operational signals from event streams</p>
      </div>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Unable to Load Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Appointments (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.created}</div>
            <div className="text-xs text-muted-foreground">
              {summary.completed} completed • {summary.cancelled} cancelled
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.checkIns}</div>
            <div className="text-xs text-muted-foreground">
              {summary.checkOuts} check-outs recorded
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.dispensed}</div>
            <div className="text-xs text-muted-foreground">
              {summary.restocked} restocked units
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vitals Captured (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{patientVitals.length}</div>
            <div className="text-xs text-muted-foreground">
              Latest clinical telemetry signals
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Events</CardTitle>
          {isLoading ? <StatusBadge variant="info">Loading</StatusBadge> : <StatusBadge variant="success">Live</StatusBadge>}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading event stream...</p>
          ) : recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events available for the selected windows.</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{event.label}</p>
                    <p className="text-xs text-muted-foreground">{event.meta}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.time), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
