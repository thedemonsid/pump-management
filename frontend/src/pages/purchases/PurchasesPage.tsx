import { useEffect, useState } from "react";
import { usePurchaseStore } from "@/store/purchase-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Loader2, Calendar, Package } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { CreatePurchaseForm } from "./CreatePurchaseForm";
import { UpdatePurchaseForm } from "./UpdatePurchaseForm";
import type { Purchase } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils/index";

export function PurchasesPage() {
  const { purchases, loading, error, fetchPurchases } = usePurchaseStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  if (loading && purchases.length === 0) {
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
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">
            Manage your fuel and product purchases
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Purchase</DialogTitle>
              <DialogDescription>
                Add a new purchase record to the system.
              </DialogDescription>
            </DialogHeader>
            <CreatePurchaseForm
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
          <CardTitle>Purchase Records</CardTitle>
          <CardDescription>
            A list of all purchase transactions in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No purchases found</h3>
              <p className="text-muted-foreground">
                Get started by creating your first purchase record.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purchase ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      #{purchase.purchaseId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(purchase.purchaseDate)}
                      </div>
                    </TableCell>
                    <TableCell>{purchase.supplierName}</TableCell>
                    <TableCell>{purchase.productName}</TableCell>
                    <TableCell>
                      {purchase.quantity} {purchase.purchaseUnit}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(purchase.purchaseRate)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(purchase.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          purchase.paymentType === "CASH"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {purchase.paymentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog
                          open={!!editingPurchase}
                          onOpenChange={(open) => {
                            if (!open) setEditingPurchase(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPurchase(purchase)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Purchase</DialogTitle>
                              <DialogDescription>
                                Update the purchase details.
                              </DialogDescription>
                            </DialogHeader>
                            {editingPurchase && (
                              <UpdatePurchaseForm
                                purchase={editingPurchase}
                                onSuccess={() => setEditingPurchase(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
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
