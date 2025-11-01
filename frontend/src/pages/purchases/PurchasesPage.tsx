import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseStore } from "@/store/purchase-store";
import type { Purchase, PurchaseItem } from "@/types/purchase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Loader2, Calendar, Package, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils/index";

export function PurchasesPage() {
  const { purchases, loading, error, fetchPurchases } = usePurchaseStore();
  const navigate = useNavigate();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleViewItems = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDialogOpen(true);
  };

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
        <Button onClick={() => navigate("/purchases/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Purchase
        </Button>
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
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      {purchase.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(purchase.purchaseDate)}
                      </div>
                    </TableCell>
                    <TableCell>{purchase.supplierName}</TableCell>
                    <TableCell>
                      {purchase.purchaseItems &&
                      purchase.purchaseItems.length > 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewItems(purchase)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View {purchase.purchaseItems.length} item(s)
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No items
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(purchase.totalAmount || 0)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(purchase.netAmount || 0)}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/purchases/${purchase.id}/edit`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-[1400px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Items</DialogTitle>
            <DialogDescription>
              {selectedPurchase && (
                <div className="space-y-1 mt-2">
                  <p>
                    <strong>Invoice:</strong> {selectedPurchase.invoiceNumber}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDate(selectedPurchase.purchaseDate)}
                  </p>
                  <p>
                    <strong>Supplier:</strong> {selectedPurchase.supplierName}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && selectedPurchase.purchaseItems && (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Tax %</TableHead>
                    <TableHead className="text-right">Tax Amount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Add to Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPurchase.purchaseItems.map(
                    (item: PurchaseItem, idx: number) => (
                      <TableRow key={item.id || idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          {item.productName || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell>{item.purchaseUnit}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.purchaseRate)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.taxPercentage}%
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.taxAmount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.amount + item.taxAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={item.addToStock ? "default" : "secondary"}
                          >
                            {item.addToStock ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>

              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedPurchase.totalAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tax Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedPurchase.taxAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Net Amount:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(selectedPurchase.netAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
