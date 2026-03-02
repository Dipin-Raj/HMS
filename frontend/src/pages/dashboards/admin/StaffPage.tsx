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
import { adminService, StaffCreate, StaffUpdate } from "@/services/adminService";
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
    case "break":
      return "warning" as const;
    case "off-duty":
      return "muted" as const;
    case "on-leave":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
};

export default function StaffPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffUpdate & { id: number } | null>(null);

  // Fetch staff members
  const {
    data: staff,
    isLoading: isLoadingStaff,
    isError: isErrorStaff,
    error: errorStaff,
  } = useQuery({
    queryKey: ["adminStaff"],
    queryFn: () => adminService.getStaff(),
  });

  // Create Staff Mutation
  const createStaffMutation = useMutation({
    mutationFn: adminService.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStaff"] });
      toast({
        title: "Success",
        description: "Staff member invited successfully. Setup email sent.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to invite staff member.",
        variant: "destructive",
      });
    },
  });

  // Update Staff Mutation
  const updateStaffMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: StaffUpdate }) =>
      adminService.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStaff"] });
      toast({
        title: "Success",
        description: "Staff member updated successfully.",
      });
      setIsEditDialogOpen(false);
      setCurrentStaff(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update staff member.",
        variant: "destructive",
      });
    },
  });

  // Delete Staff Mutation
  const deleteStaffMutation = useMutation({
    mutationFn: adminService.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStaff"] });
      toast({
        title: "Success",
        description: "Staff member deleted successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete staff member.",
        variant: "destructive",
      });
    },
  });

  const handleCreateStaff = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const staffData: StaffCreate = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      job_title: formData.get("job_title") as string,
    };
    createStaffMutation.mutate(staffData);
  };

  const handleUpdateStaff = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentStaff) return;

    const formData = new FormData(event.currentTarget);
    const staffData: StaffUpdate = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      job_title: formData.get("job_title") as string,
    };
    updateStaffMutation.mutate({ id: currentStaff.id, data: staffData });
  };

  const handleDeleteStaff = (id: number) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      deleteStaffMutation.mutate(id);
    }
  };

  if (isLoadingStaff) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Staff</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Loading staff data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isErrorStaff) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Staff</CardTitle>
            <CardDescription>Error loading data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Error: {errorStaff?.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Staff</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Staff Member</DialogTitle>
              <DialogDescription>
                Invite a staff account and send a password setup email.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStaff} className="grid gap-4 py-4">
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
                <Label htmlFor="job_title" className="text-right">
                  Job Title
                </Label>
                <Input
                  id="job_title"
                  name="job_title"
                  type="text"
                  className="col-span-3"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createStaffMutation.isPending}>
                {createStaffMutation.isPending ? "Sending Invite..." : "Send Invite"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff</CardTitle>
          <CardDescription>
            A list of all staff members in the hospital.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.first_name} {member.last_name}</TableCell>
                  <TableCell>{member.job_title}</TableCell>
                  <TableCell>
                    <StatusBadge variant={statusVariant(member.current_status)} dot>
                      {member.current_status || "off-duty"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 mr-1"
                      onClick={() => {
                        setCurrentStaff(member);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteStaff(member.id)}
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

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Modify the details of the staff member.
            </DialogDescription>
          </DialogHeader>
          {currentStaff && (
            <form onSubmit={handleUpdateStaff} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="col-span-3"
                  defaultValue={currentStaff.first_name}
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
                  defaultValue={currentStaff.last_name}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="job_title" className="text-right">
                  Job Title
                </Label>
                <Input
                  id="job_title"
                  name="job_title"
                  type="text"
                  className="col-span-3"
                  defaultValue={currentStaff.job_title}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateStaffMutation.isPending}>
                {updateStaffMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
