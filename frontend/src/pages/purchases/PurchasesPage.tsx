import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils/index";

export function PurchasesPage() {
  const { purchases, loading, error, fetchPurchases } = usePurchaseStore();
  const navigate = useNavigate();

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
                      <div className="flex flex-col gap-1">
                        {purchase.purchaseItems &&
                        purchase.purchaseItems.length > 0 ? (
                          purchase.purchaseItems.map((item, idx) => (
                            <span key={idx} className="text-sm">
                              {item.productName || "Product"} ({item.quantity}{" "}
                              {item.purchaseUnit})
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No items
                          </span>
                        )}
                      </div>
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
    </div>
  );
}
