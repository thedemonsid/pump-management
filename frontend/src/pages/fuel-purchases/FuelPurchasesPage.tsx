import { useEffect, useState } from "react";
import { useFuelPurchaseStore } from "@/store/fuel-purchase-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2, Calendar, Fuel } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateFuelPurchaseForm } from "./CreateFuelPurchaseForm";
import { UpdateFuelPurchaseForm } from "./UpdateFuelPurchaseForm";
import type { FuelPurchase } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/index";

export function FuelPurchasesPage() {
  const {
    fuelPurchases,
    loading,
    error,
    fetchFuelPurchases,
    removeFuelPurchase,
  } = useFuelPurchaseStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFuelPurchase, setEditingFuelPurchase] =
    useState<FuelPurchase | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFuelPurchases();
  }, [fetchFuelPurchases]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this fuel purchase?")) {
      setDeletingId(id);
      try {
        await removeFuelPurchase(id);
      } catch (error) {
        console.error("Failed to delete fuel purchase:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading && fuelPurchases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Purchases</h1>
          <p className="text-muted-foreground">
            Manage your fuel purchases and tank inventory
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Fuel Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Fuel Purchase</DialogTitle>
              <DialogDescription>
                Add a new fuel purchase record to the system.
              </DialogDescription>
            </DialogHeader>
            <CreateFuelPurchaseForm
              onSuccess={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Fuel Purchase Records</CardTitle>
          <CardDescription>
            A list of all fuel purchase transactions in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fuelPurchases.length === 0 ? (
            <div className="text-center py-8">
              <Fuel className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No fuel purchases found
              </h3>
              <p className="text-muted-foreground">
                Get started by creating your first fuel purchase record.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purchase ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Tank</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Before Density</TableHead>
                  <TableHead>After Density</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelPurchases.map((fuelPurchase) => (
                  <TableRow key={fuelPurchase.id}>
                    <TableCell className="font-medium">
                      #{fuelPurchase.fuelPurchaseId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(fuelPurchase.purchaseDate)}
                      </div>
                    </TableCell>
                    <TableCell>{fuelPurchase.supplierName}</TableCell>
                    <TableCell>{fuelPurchase.tankName}</TableCell>
                    <TableCell>
                      {fuelPurchase.quantity} {fuelPurchase.purchaseUnit}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(fuelPurchase.purchaseRate)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(fuelPurchase.amount)}
                    </TableCell>
                    <TableCell>{fuelPurchase.vehicleNumber || "N/A"}</TableCell>
                    <TableCell>{fuelPurchase.bfrDensity}</TableCell>
                    <TableCell>{fuelPurchase.aftDensity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog
                          open={!!editingFuelPurchase}
                          onOpenChange={(open) => {
                            if (!open) setEditingFuelPurchase(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditingFuelPurchase(fuelPurchase)
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Fuel Purchase</DialogTitle>
                              <DialogDescription>
                                Update the fuel purchase details.
                              </DialogDescription>
                            </DialogHeader>
                            {editingFuelPurchase && (
                              <UpdateFuelPurchaseForm
                                fuelPurchase={editingFuelPurchase}
                                onSuccess={() => setEditingFuelPurchase(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            fuelPurchase.id && handleDelete(fuelPurchase.id)
                          }
                          disabled={deletingId === fuelPurchase.id}
                        >
                          {deletingId === fuelPurchase.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
