import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupplierStore } from "@/store/supplier-store";
import { useSupplierPaymentStore } from "@/store/supplier-payment-store";
import { usePurchaseStore } from "@/store/purchase-store";
import { useFuelPurchaseStore } from "@/store/fuel-purchase-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { CreateSupplierPaymentForm } from "./CreateSupplierPaymentForm";
import { UpdateSupplierPaymentForm } from "./UpdateSupplierPaymentForm";
import {
  Loader2,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Receipt,
  CreditCard,
  BookOpen,
} from "lucide-react";
import type { SupplierPaymentResponse } from "@/types";

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    suppliers,
    loading: suppliersLoading,
    fetchSuppliers,
  } = useSupplierStore();
  const {
    payments,
    loading: paymentsLoading,
    fetchPaymentsBySupplierId,
    removePayment,
  } = useSupplierPaymentStore();
  const {
    purchases,
    loading: purchasesLoading,
    fetchPurchasesByPumpMasterId,
  } = usePurchaseStore();
  const {
    fuelPurchases,
    loading: fuelPurchasesLoading,
    fetchFuelPurchasesByPumpMasterId,
  } = useFuelPurchaseStore();

  const [activeTab, setActiveTab] = useState("payments");
  const [isCreatePaymentDialogOpen, setIsCreatePaymentDialogOpen] =
    useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<SupplierPaymentResponse | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null
  );

  const supplier = suppliers.find((s) => s.id === id);

  useEffect(() => {
    if (!suppliers.length) {
      fetchSuppliers();
    }
  }, [suppliers.length, fetchSuppliers]);

  useEffect(() => {
    if (id && supplier?.pumpMasterId) {
      fetchPaymentsBySupplierId(id, supplier.pumpMasterId);
      fetchPurchasesByPumpMasterId(supplier.pumpMasterId);
      fetchFuelPurchasesByPumpMasterId(supplier.pumpMasterId);
    }
  }, [
    id,
    supplier?.pumpMasterId,
    fetchPaymentsBySupplierId,
    fetchPurchasesByPumpMasterId,
    fetchFuelPurchasesByPumpMasterId,
  ]);

  const handleDeletePayment = async () => {
    if (!deletingPaymentId) return;

    try {
      await removePayment(deletingPaymentId);
      setDeletingPaymentId(null);
    } catch (error) {
      console.error("Failed to delete payment:", error);
      alert("Failed to delete payment. Please try again.");
    }
  };

  if (suppliersLoading && !supplier) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading supplier...</span>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-2xl font-bold">Supplier Not Found</h2>
        <p className="text-muted-foreground">
          The supplier you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/suppliers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Suppliers
        </Button>
      </div>
    );
  }

  const totalPaymentsAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  // Filter purchases and fuel purchases by supplier ID
  const supplierPurchases = purchases.filter(
    (purchase) => purchase.supplierId === id
  );
  const supplierFuelPurchases = fuelPurchases.filter(
    (fuelPurchase) => fuelPurchase.supplierId === id
  );

  // Calculate total purchases amount
  const totalPurchasesAmount =
    supplierPurchases.reduce((sum, purchase) => sum + purchase.amount, 0) +
    supplierFuelPurchases.reduce(
      (sum, fuelPurchase) => sum + fuelPurchase.amount,
      0
    );

  const outstandingBalance =
    (supplier.openingBalance || 0) - totalPaymentsAmount + totalPurchasesAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {supplier.supplierName}
          </h1>
          <p className="text-muted-foreground">
            Supplier Details & Payment History
          </p>
        </div>
      </div>

      {/* Supplier Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supplier Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Contact Person:</span>
                <span>{supplier.contactPersonName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone:</span>
                <span>{supplier.contactNumber}</span>
              </div>
              {supplier.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email:</span>
                  <span>{supplier.email}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">GST:</span>
                <span className="font-mono text-sm">{supplier.gstNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">TIN:</span>
                <span className="font-mono text-sm">
                  {supplier.taxIdentificationNumber}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Opening Balance:</span>
                <span
                  className={`font-mono font-semibold ${
                    supplier.openingBalance && supplier.openingBalance > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  ₹{supplier.openingBalance?.toLocaleString() || "0"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {supplier.openingBalance && supplier.openingBalance > 0
                    ? "(Amount to pay)"
                    : supplier.openingBalance && supplier.openingBalance < 0
                    ? "(Credit balance)"
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Opening Balance Date:
                </span>
                <span>
                  {supplier.openingBalanceDate
                    ? new Date(supplier.openingBalanceDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Address:</span>
              <span className="truncate max-w-lg" title={supplier.address}>
                {supplier.address}
              </span>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{(supplier.openingBalance || 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Opening Balance
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ₹{totalPurchasesAmount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Purchases
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalPaymentsAmount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Payments Made
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    outstandingBalance >= 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ₹{Math.abs(outstandingBalance).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {outstandingBalance >= 0
                    ? "Amount Due to Supplier"
                    : "Supplier Credit Balance"}
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Amount Due = Opening Balance + Total Purchases - Total Payments
              Made
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="space-y-4">
          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/suppliers/${id}/ledger`)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Ledger
            </Button>
            <Dialog
              open={isCreatePaymentDialogOpen}
              onOpenChange={setIsCreatePaymentDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Supplier Payment</DialogTitle>
                  <DialogDescription>
                    Record a new payment to this supplier
                  </DialogDescription>
                </DialogHeader>
                <CreateSupplierPaymentForm
                  supplierId={supplier.id!}
                  pumpMasterId={supplier.pumpMasterId!}
                  onSuccess={() => {
                    setIsCreatePaymentDialogOpen(false);
                    // Refresh payments data
                    fetchPaymentsBySupplierId(
                      supplier.id!,
                      supplier.pumpMasterId!
                    );
                  }}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Payment Dialog */}
            <Dialog
              open={isEditPaymentDialogOpen}
              onOpenChange={(open) => {
                setIsEditPaymentDialogOpen(open);
                if (!open) {
                  setEditingPayment(null);
                }
              }}
            >
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Update Supplier Payment</DialogTitle>
                  <DialogDescription>
                    Modify the payment details
                  </DialogDescription>
                </DialogHeader>
                {editingPayment && (
                  <UpdateSupplierPaymentForm
                    payment={editingPayment}
                    onSuccess={() => {
                      setIsEditPaymentDialogOpen(false);
                      setEditingPayment(null);
                      // Refresh payments data
                      fetchPaymentsBySupplierId(
                        supplier.id!,
                        supplier.pumpMasterId!
                      );
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>

            {/* Delete Payment Confirmation Dialog */}
            <Dialog
              open={!!deletingPaymentId}
              onOpenChange={(open) => {
                if (!open) setDeletingPaymentId(null);
              }}
            >
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Payment</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this payment? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeletingPaymentId(null)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeletePayment}>
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs List */}
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
              <span className="sm:hidden">Payments</span>
              <span>({payments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Purchases</span>
              <span className="sm:hidden">Purchases</span>
              <span>({supplierPurchases.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="fuel-purchases"
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Fuel Purchases</span>
              <span className="sm:hidden">Fuel</span>
              <span>({supplierFuelPurchases.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading payments...</span>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payments found for this supplier
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Purchase ID</TableHead>
                      <TableHead>Fuel Purchase ID</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium font-mono text-sm">
                          {payment.referenceNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.paymentMethod.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.purchaseId ? (
                            <div className="flex items-center gap-1">
                              <Receipt className="h-3 w-3 opacity-50" />
                              {payment.purchaseId}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.fuelPurchaseId ? (
                            <div className="flex items-center gap-1">
                              <Receipt className="h-3 w-3 opacity-50" />
                              {payment.fuelPurchaseId}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-green-600">
                          ₹{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingPayment(payment);
                                setIsEditPaymentDialogOpen(true);
                              }}
                              title="Edit Payment"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingPaymentId(payment.id)}
                              title="Delete Payment"
                            >
                              <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              {purchasesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading purchases...</span>
                </div>
              ) : supplierPurchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No purchases found for this supplier
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierPurchases.map((purchase) => (
                      <TableRow key={`purchase-${purchase.id}`}>
                        <TableCell className="font-medium font-mono text-sm">
                          {purchase.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{purchase.productName}</TableCell>
                        <TableCell>
                          {purchase.quantity} {purchase.purchaseUnit}
                        </TableCell>
                        <TableCell className="font-mono">
                          ₹{purchase.purchaseRate.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          ₹{purchase.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel-purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fuel Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              {fuelPurchasesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading fuel purchases...</span>
                </div>
              ) : supplierFuelPurchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No fuel purchases found for this supplier
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierFuelPurchases.map((fuelPurchase) => (
                      <TableRow key={`fuel-${fuelPurchase.id}`}>
                        <TableCell className="font-medium font-mono text-sm">
                          {fuelPurchase.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            fuelPurchase.purchaseDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{fuelPurchase.productName}</TableCell>
                        <TableCell>
                          {fuelPurchase.quantity} {fuelPurchase.purchaseUnit}
                        </TableCell>
                        <TableCell className="font-mono">
                          ₹{fuelPurchase.purchaseRate.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          ₹{fuelPurchase.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
