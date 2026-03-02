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
import { adminService, PharmacyStockCreate, PharmacyStockUpdate } from "@/services/adminService";
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

export default function PharmacyPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStockItem, setCurrentStockItem] = useState<PharmacyStockUpdate & { id: number } | null>(null);

  // Fetch pharmacy stock
  const {
    data: medicines,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminPharmacyStock"],
    queryFn: () => adminService.getPharmacyStock(),
  });

  // Create Pharmacy Stock Mutation
  const createPharmacyStockMutation = useMutation({
    mutationFn: adminService.createPharmacyStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPharmacyStock"] });
      toast({
        title: "Success",
        description: "Stock item created successfully.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to create stock item.",
        variant: "destructive",
      });
    },
  });

  // Update Pharmacy Stock Mutation
  const updatePharmacyStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PharmacyStockUpdate }) =>
      adminService.updatePharmacyStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPharmacyStock"] });
      toast({
        title: "Success",
        description: "Stock item updated successfully.",
      });
      setIsEditDialogOpen(false);
      setCurrentStockItem(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update stock item.",
        variant: "destructive",
      });
    },
  });

  // Delete Pharmacy Stock Mutation
  const deletePharmacyStockMutation = useMutation({
    mutationFn: adminService.deletePharmacyStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPharmacyStock"] });
      toast({
        title: "Success",
        description: "Stock item deleted successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete stock item.",
        variant: "destructive",
      });
    },
  });

  const handleCreateStockItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const stockItemData: PharmacyStockCreate = {
      medicine_name: formData.get("medicine_name") as string,
      quantity: parseInt(formData.get("quantity") as string),
      unit_price: parseFloat(formData.get("unit_price") as string),
    };
    createPharmacyStockMutation.mutate(stockItemData);
  };

  const handleUpdateStockItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentStockItem) return;

    const formData = new FormData(event.currentTarget);
    const stockItemData: PharmacyStockUpdate = {
      medicine_name: formData.get("medicine_name") as string,
      quantity: parseInt(formData.get("quantity") as string),
      unit_price: parseFloat(formData.get("unit_price") as string),
    };
    updatePharmacyStockMutation.mutate({ id: currentStockItem.id, data: stockItemData });
  };

  const handleDeleteStockItem = (id: number) => {
    if (window.confirm("Are you sure you want to delete this stock item?")) {
      deletePharmacyStockMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pharmacy</CardTitle>
            <CardDescription>Loading pharmacy stock...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Loading pharmacy stock data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pharmacy</CardTitle>
            <CardDescription>Error loading pharmacy stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Error: {error?.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Pharmacy Stock</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Stock Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Stock Item</DialogTitle>
              <DialogDescription>
                Fill in the details for the new pharmacy stock item.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateStockItem} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="medicine_name" className="text-right">
                  Medicine Name
                </Label>
                <Input
                  id="medicine_name"
                  name="medicine_name"
                  type="text"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit_price" className="text-right">
                  Unit Price
                </Label>
                <Input
                  id="unit_price"
                  name="unit_price"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createPharmacyStockMutation.isPending}>
                {createPharmacyStockMutation.isPending ? "Creating..." : "Create Stock Item"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pharmacy Stock</CardTitle>
          <CardDescription>
            A list of all medicines in the pharmacy stock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines?.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell>{medicine.medicine_name}</TableCell>
                  <TableCell>{medicine.quantity}</TableCell>
                  <TableCell>${medicine.unit_price.toFixed(2)}</TableCell>
                  <TableCell>{new Date(medicine.last_updated).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 mr-1"
                      onClick={() => {
                        setCurrentStockItem(medicine);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteStockItem(medicine.id)}
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

      {/* Edit Pharmacy Stock Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Stock Item</DialogTitle>
            <DialogDescription>
              Modify the details of the pharmacy stock item.
            </DialogDescription>
          </DialogHeader>
          {currentStockItem && (
            <form onSubmit={handleUpdateStockItem} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="medicine_name" className="text-right">
                  Medicine Name
                </Label>
                <Input
                  id="medicine_name"
                  name="medicine_name"
                  type="text"
                  className="col-span-3"
                  defaultValue={currentStockItem.medicine_name}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  className="col-span-3"
                  defaultValue={currentStockItem.quantity}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit_price" className="text-right">
                  Unit Price
                </Label>
                <Input
                  id="unit_price"
                  name="unit_price"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  defaultValue={currentStockItem.unit_price}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={updatePharmacyStockMutation.isPending}>
                {updatePharmacyStockMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
