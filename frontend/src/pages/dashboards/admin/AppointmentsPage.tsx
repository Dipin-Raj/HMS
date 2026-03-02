import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, AppointmentCreate, AppointmentUpdate } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<AppointmentUpdate & { id: number } | null>(null);

  // Fetch appointments
  const {
    data: appointments,
    isLoading: isLoadingAppointments,
    isError: isErrorAppointments,
    error: errorAppointments,
  } = useQuery({
    queryKey: ["adminAppointments"],
    queryFn: () => adminService.getAppointments(),
  });

  // Fetch patients for dropdown
  const {
    data: patients,
    isLoading: isLoadingPatients,
    isError: isErrorPatients,
    error: errorPatients,
  } = useQuery({
    queryKey: ["adminPatientsList"],
    queryFn: () => adminService.getPatients({ limit: 1000 }), // Fetch all or a large number
  });

  // Fetch doctors for dropdown
  const {
    data: doctors,
    isLoading: isLoadingDoctors,
    isError: isErrorDoctors,
    error: errorDoctors,
  } = useQuery({
    queryKey: ["adminDoctorsList"],
    queryFn: () => adminService.getDoctors({ limit: 1000 }), // Fetch all or a large number
  });

  // Create Appointment Mutation
  const createAppointmentMutation = useMutation({
    mutationFn: adminService.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAppointments"] });
      toast({
        title: "Success",
        description: "Appointment created successfully.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to create appointment.",
        variant: "destructive",
      });
    },
  });

  // Update Appointment Mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AppointmentUpdate }) =>
      adminService.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAppointments"] });
      toast({
        title: "Success",
        description: "Appointment updated successfully.",
      });
      setIsEditDialogOpen(false);
      setCurrentAppointment(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update appointment.",
        variant: "destructive",
      });
    },
  });

  // Delete Appointment Mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: adminService.deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAppointments"] });
      toast({
        title: "Success",
        description: "Appointment deleted successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete appointment.",
        variant: "destructive",
      });
    },
  });

  const handleCreateAppointment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const appointmentData: AppointmentCreate = {
      patient_id: parseInt(formData.get("patient_id") as string),
      doctor_id: parseInt(formData.get("doctor_id") as string),
      appointment_time: new Date(formData.get("appointment_time") as string).toISOString(),
      status: formData.get("status") as string,
      notes: formData.get("notes") as string,
    };
    createAppointmentMutation.mutate(appointmentData);
  };

  const handleUpdateAppointment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentAppointment) return;

    const formData = new FormData(event.currentTarget);
    const appointmentData: AppointmentUpdate = {
      patient_id: parseInt(formData.get("patient_id") as string),
      doctor_id: parseInt(formData.get("doctor_id") as string),
      appointment_time: new Date(formData.get("appointment_time") as string).toISOString(),
      status: formData.get("status") as string,
      notes: formData.get("notes") as string,
    };
    updateAppointmentMutation.mutate({ id: currentAppointment.id, data: appointmentData });
  };

  const handleDeleteAppointment = (id: number) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      deleteAppointmentMutation.mutate(id);
    }
  };

  if (isLoadingAppointments || isLoadingPatients || isLoadingDoctors) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Loading appointments, patients, and doctors data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isErrorAppointments || isErrorPatients || isErrorDoctors) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Error loading data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Error: {errorAppointments?.message || errorPatients?.message || errorDoctors?.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
              <DialogDescription>
                Fill in the details for the new appointment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAppointment} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patient_id" className="text-right">
                  Patient
                </Label>
                <Select name="patient_id" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients?.map((patient) => (
                      <SelectItem key={patient.id} value={String(patient.id)}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctor_id" className="text-right">
                  Doctor
                </Label>
                <Select name="doctor_id" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((doctor) => (
                      <SelectItem key={doctor.id} value={String(doctor.id)}>
                        {doctor.first_name} {doctor.last_name} ({doctor.specialization})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appointment_time" className="text-right">
                  Appointment Time
                </Label>
                <Input
                  id="appointment_time"
                  name="appointment_time"
                  type="datetime-local"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select name="status" defaultValue="scheduled" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  type="text"
                  className="col-span-3"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createAppointmentMutation.isPending}>
                {createAppointmentMutation.isPending ? "Creating..." : "Create Appointment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>
            A list of all scheduled appointments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments?.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.patient.first_name} {appointment.patient.last_name}</TableCell>
                  <TableCell>{appointment.doctor.first_name} {appointment.doctor.last_name}</TableCell>
                  <TableCell>{new Date(appointment.appointment_time).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(appointment.appointment_time).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        appointment.status === "scheduled"
                          ? "default"
                          : appointment.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 mr-1"
                      onClick={() => {
                        setCurrentAppointment(appointment);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Modify the details of the appointment.
            </DialogDescription>
          </DialogHeader>
          {currentAppointment && (
            <form onSubmit={handleUpdateAppointment} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patient_id" className="text-right">
                  Patient
                </Label>
                <Select
                  name="patient_id"
                  required
                  defaultValue={String(currentAppointment.patient_id)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients?.map((patient) => (
                      <SelectItem key={patient.id} value={String(patient.id)}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctor_id" className="text-right">
                  Doctor
                </Label>
                <Select
                  name="doctor_id"
                  required
                  defaultValue={String(currentAppointment.doctor_id)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((doctor) => (
                      <SelectItem key={doctor.id} value={String(doctor.id)}>
                        {doctor.first_name} {doctor.last_name} ({doctor.specialization})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appointment_time" className="text-right">
                  Appointment Time
                </Label>
                <Input
                  id="appointment_time"
                  name="appointment_time"
                  type="datetime-local"
                  className="col-span-3"
                  defaultValue={
                    currentAppointment.appointment_time
                      ? new Date(currentAppointment.appointment_time).toISOString().slice(0, 16)
                      : ""
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  name="status"
                  defaultValue={currentAppointment.status}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  type="text"
                  className="col-span-3"
                  defaultValue={currentAppointment.notes || ""}
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateAppointmentMutation.isPending}>
                {updateAppointmentMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
