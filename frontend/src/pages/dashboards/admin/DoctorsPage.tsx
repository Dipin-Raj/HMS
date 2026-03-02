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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, DoctorCreate, DoctorUpdate } from "@/services/adminService";
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
import { useToast } from "@/components/ui/use-toast";
import { StatusBadge } from "@/components/ui/status-badge";

const statusVariant = (status?: string) => {
  switch (status) {
    case "on-duty":
      return "success" as const;
    case "rounds":
      return "info" as const;
    case "surgery":
      return "warning" as const;
    case "break":
      return "muted" as const;
    case "off-duty":
    default:
      return "secondary" as const;
  }
};

export default function DoctorsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<DoctorUpdate & { id: number } | null>(null);

  // Fetch doctors
  const {
    data: doctors,
    isLoading: isLoadingDoctors,
    isError: isErrorDoctors,
    error: errorDoctors,
  } = useQuery({
    queryKey: ["adminDoctors"],
    queryFn: () => adminService.getDoctors(),
  });

  // Create Doctor Mutation
  const createDoctorMutation = useMutation({
    mutationFn: adminService.createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
      toast({
        title: "Success",
        description: "Doctor invited successfully. Setup email sent.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to invite doctor.",
        variant: "destructive",
      });
    },
  });

  // Update Doctor Mutation
  const updateDoctorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DoctorUpdate }) =>
      adminService.updateDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
      toast({
        title: "Success",
        description: "Doctor updated successfully.",
      });
      setIsEditDialogOpen(false);
      setCurrentDoctor(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update doctor.",
        variant: "destructive",
      });
    },
  });

  // Delete Doctor Mutation
  const deleteDoctorMutation = useMutation({
    mutationFn: adminService.deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDoctors"] });
      toast({
        title: "Success",
        description: "Doctor deleted successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete doctor.",
        variant: "destructive",
      });
    },
  });

  const handleCreateDoctor = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const doctorData: DoctorCreate = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      specialization: formData.get("specialization") as string,
      phone_number: formData.get("phone_number") as string,
    };
    createDoctorMutation.mutate(doctorData);
  };

  const handleUpdateDoctor = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentDoctor) return;

    const formData = new FormData(event.currentTarget);
    const doctorData: DoctorUpdate = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      specialization: formData.get("specialization") as string,
      phone_number: formData.get("phone_number") as string,
    };
    updateDoctorMutation.mutate({ id: currentDoctor.id, data: doctorData });
  };

  const handleDeleteDoctor = (id: number) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      deleteDoctorMutation.mutate(id);
    }
  };

  if (isLoadingDoctors) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Doctors</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Loading doctors data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isErrorDoctors) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Doctors</CardTitle>
            <CardDescription>Error loading data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Error: {errorDoctors?.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Doctor</DialogTitle>
              <DialogDescription>
                Invite a doctor account and send a password setup email.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDoctor} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last_name" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialization" className="text-right">
                  Specialization
                </Label>
                <Input
                  id="specialization"
                  name="specialization"
                  type="text"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone_number" className="text-right">
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  className="col-span-3"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createDoctorMutation.isPending}>
                {createDoctorMutation.isPending ? "Sending Invite..." : "Send Invite"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
          <CardDescription>
            A list of all doctors in the hospital.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Speciality</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors?.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>{doctor.first_name} {doctor.last_name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.phone_number}</TableCell>
                  <TableCell>
                    <StatusBadge variant={statusVariant(doctor.current_status)} dot>
                      {doctor.current_status || "off-duty"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 mr-1"
                      onClick={() => {
                        setCurrentDoctor(doctor);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteDoctor(doctor.id)}
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

      {/* Edit Doctor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Modify the details of the doctor.
            </DialogDescription>
          </DialogHeader>
          {currentDoctor && (
            <form onSubmit={handleUpdateDoctor} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="col-span-3"
                  defaultValue={currentDoctor.first_name}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last_name" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="col-span-3"
                  defaultValue={currentDoctor.last_name}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialization" className="text-right">
                  Specialization
                </Label>
                <Input
                  id="specialization"
                  name="specialization"
                  type="text"
                  className="col-span-3"
                  defaultValue={currentDoctor.specialization}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone_number" className="text-right">
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  className="col-span-3"
                  defaultValue={currentDoctor.phone_number || ""}
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateDoctorMutation.isPending}>
                {updateDoctorMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
