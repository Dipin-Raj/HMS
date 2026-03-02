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
import { adminService, PatientCreate, PatientUpdate } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
 from "@/components/ui/dialog";
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

export default function PatientsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<PatientUpdate & { id: number } | null>(null);

  // Fetch patients
  const {
    data: patients,
    isLoading: isLoadingPatients,
    isError: isErrorPatients,
    error: errorPatients,
  } = useQuery({
    queryKey: ["adminPatients"],
    queryFn: () => adminService.getPatients(),
  });

  // Fetch users for dropdown (to link patient to a user account)
  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: errorUsers,
  } = useQuery({
    queryKey: ["adminUsersList"],
    queryFn: () => adminService.getUsers(), // Fetch all users, filterable if needed
  });

  // Create Patient Mutation
  const createPatientMutation = useMutation({
    mutationFn: adminService.createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPatients"] });
      toast({
        title: "Success",
        description: "Patient created successfully.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to create patient.",
        variant: "destructive",
      });
    },
  });

  // Update Patient Mutation
  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatientUpdate }) =>
      adminService.updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPatients"] });
      toast({
        title: "Success",
        description: "Patient updated successfully.",
      });
      setIsEditDialogOpen(false);
      setCurrentPatient(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update patient.",
        variant: "destructive",
      });
    },
  });

  // Delete Patient Mutation
  const deletePatientMutation = useMutation({
    mutationFn: adminService.deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPatients"] });
      toast({
        title: "Success",
        description: "Patient deleted successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete patient.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePatient = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const patientData: PatientCreate = {
      user_id: parseInt(formData.get("user_id") as string),
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      date_of_birth: formData.get("date_of_birth") as string,
      gender: formData.get("gender") as string,
      phone_number: formData.get("phone_number") as string,
      address: formData.get("address") as string,
    };
    createPatientMutation.mutate(patientData);
  };

  const handleUpdatePatient = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentPatient) return;

    const formData = new FormData(event.currentTarget);
    const patientData: PatientUpdate = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      date_of_birth: formData.get("date_of_birth") as string,
      gender: formData.get("gender") as string,
      phone_number: formData.get("phone_number") as string,
      address: formData.get("address") as string,
    };
    updatePatientMutation.mutate({ id: currentPatient.id, data: patientData });
  };

  const handleDeletePatient = (id: number) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      deletePatientMutation.mutate(id);
    }
  };

  if (isLoadingPatients || isLoadingUsers) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Loading patients and users data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isErrorPatients || isErrorUsers) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
            <CardDescription>Error loading data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Error: {errorPatients?.message || errorUsers?.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Patient</DialogTitle>
              <DialogDescription>
                Fill in the details for the new patient.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePatient} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user_id" className="text-right">
                  User
                </Label>
                <Select name="user_id" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="date_of_birth" className="text-right">
                  Date of Birth
                </Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-right">
                  Gender
                </Label>
                <Select name="gender" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  className="col-span-3"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createPatientMutation.isPending}>
                {createPatientMutation.isPending ? "Creating..." : "Create Patient"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
          <CardDescription>
            A list of all patients currently admitted to the hospital.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients?.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.first_name} {patient.last_name}</TableCell>
                  <TableCell>{new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{new Date(patient.date_of_birth).toLocaleDateString()}</TableCell>
                  <TableCell>{patient.phone_number}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 mr-1"
                      onClick={() => {
                        setCurrentPatient(patient);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeletePatient(patient.id)}
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

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Modify the details of the patient.
            </DialogDescription>
          </DialogHeader>
          {currentPatient && (
            <form onSubmit={handleUpdatePatient} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="col-span-3"
                  defaultValue={currentPatient.first_name}
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
                  defaultValue={currentPatient.last_name}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date_of_birth" className="text-right">
                  Date of Birth
                </Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  className="col-span-3"
                  defaultValue={currentPatient.date_of_birth}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-right">
                  Gender
                </Label>
                <Select name="gender" defaultValue={currentPatient.gender} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
                  defaultValue={currentPatient.phone_number || ""}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  className="col-span-3"
                  defaultValue={currentPatient.address || ""}
                />
              </div>
              <Button type="submit" className="w-full" disabled={updatePatientMutation.isPending}>
                {updatePatientMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
