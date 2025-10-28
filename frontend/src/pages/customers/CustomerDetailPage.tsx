import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerStore } from "@/store/customer-store";
import { useBillStore } from "@/store/bill-store";
import { useCustomerBillPaymentStore } from "@/store/customer-bill-payment-store";
import { useSalesmanBillStore } from "@/store/salesman-bill-store";
import { useSalesmanBillPaymentStore } from "@/store/salesman-bill-payment-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Loader2,
  Receipt,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
} from "lucide-react";
import { CreateCustomerBillPaymentForm } from "./CreateCustomerBillPaymentForm";
import { UpdateCustomerBillPaymentForm } from "./UpdateCustomerBillPaymentForm";
import { SalesmanBillPaymentsManager } from "./SalesmanBillPaymentsManager";
import { CreateSalesmanBillPaymentForm } from "./CreateSalesmanBillPaymentForm";
import type { CustomerBillPaymentResponse } from "@/types";

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    customers,
    loading: customersLoading,
    fetchCustomers,
  } = useCustomerStore();
  const {
    bills,
    loading: billsLoading,
    fetchBillsByCustomerId,
  } = useBillStore();

  const {
    payments,
    loading: paymentsLoading,
    fetchPaymentsByCustomerId,
  } = useCustomerBillPaymentStore();

  const {
    customerBills: salesmanBills,
    loading: salesmanBillsLoading,
    fetchBillsByCustomerId: fetchSalesmanBillsByCustomerId,
  } = useSalesmanBillStore();

  const {
    customerPayments: salesmanBillPayments,
    loading: salesmanBillPaymentsLoading,
    fetchPaymentsByCustomerId: fetchSalesmanBillPaymentsByCustomerId,
  } = useSalesmanBillPaymentStore();

  const [activeTab, setActiveTab] = useState("bills");
  const [isCreatePaymentDialogOpen, setIsCreatePaymentDialogOpen] =
    useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<CustomerBillPaymentResponse | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null
  );
  const [selectedSalesmanBillId, setSelectedSalesmanBillId] = useState<
    string | null
  >(null);
  const [isPaymentsDialogOpen, setIsPaymentsDialogOpen] = useState(false);
  const [
    isCreateSalesmanBillPaymentDialogOpen,
    setIsCreateSalesmanBillPaymentDialogOpen,
  ] = useState(false);

  const customer = customers.find((c) => c.id === id);

  useEffect(() => {
    if (!customers.length) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  useEffect(() => {
    if (id) {
      fetchBillsByCustomerId(id);
      fetchPaymentsByCustomerId(id, customer?.pumpMasterId);
      fetchSalesmanBillsByCustomerId(id);
      fetchSalesmanBillPaymentsByCustomerId(id);
    }
  }, [
    id,
    fetchBillsByCustomerId,
    fetchPaymentsByCustomerId,
    fetchSalesmanBillsByCustomerId,
    fetchSalesmanBillPaymentsByCustomerId,
    customer?.pumpMasterId,
  ]);

  const handleDeletePayment = async () => {
    if (!deletingPaymentId) return;

    try {
      await useCustomerBillPaymentStore
        .getState()
        .removePayment(deletingPaymentId);
      // Refresh payments data
      if (id && customer?.pumpMasterId) {
        fetchPaymentsByCustomerId(id, customer.pumpMasterId);
      }
      setDeletingPaymentId(null);
    } catch (error) {
      console.error("Failed to delete payment:", error);
      alert("Failed to delete payment. Please try again.");
    }
  };

  if (customersLoading && !customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading customer...</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-2xl font-bold">Customer Not Found</h2>
        <p className="text-muted-foreground">
          The customer you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const totalBillsAmount =
    bills.reduce((sum, bill) => sum + bill.netAmount, 0) +
    salesmanBills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaymentsAmount =
    payments.reduce((sum, payment) => sum + payment.amount, 0) +
    salesmanBillPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstandingBalance =
    (customer.openingBalance || 0) + totalBillsAmount - totalPaymentsAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {customer.customerName}
          </h1>
          <p className="text-muted-foreground">
            Customer Details & Transaction History
          </p>
        </div>
      </div>

      {/* Customer Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone:</span>
                <span>{customer.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Address:</span>
                <span className="truncate max-w-48" title={customer.address}>
                  {customer.address}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">GST:</span>
                <span className="font-mono text-sm">
                  {customer.gstNumber || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">PAN:</span>
                <span className="font-mono text-sm">
                  {customer.panNumber || "N/A"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Credit Limit:</span>
                <span className="font-mono">
                  ₹{customer.creditLimit.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Opening Balance:</span>
                <span
                  className={`font-mono ${
                    customer.openingBalance && customer.openingBalance > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  ₹{customer.openingBalance?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{totalBillsAmount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Bills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalPaymentsAmount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Payments
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
                  {outstandingBalance >= 0 ? "Outstanding" : "Credit Balance"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills and Payments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="space-y-4">
          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/customers/${id}/ledger`)}
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
                  <DialogTitle>Create Customer Payment</DialogTitle>
                  <DialogDescription>
                    Record a new payment from this customer
                  </DialogDescription>
                </DialogHeader>
                <CreateCustomerBillPaymentForm
                  customerId={customer.id!}
                  pumpMasterId={customer.pumpMasterId!}
                  onSuccess={() => {
                    setIsCreatePaymentDialogOpen(false);
                    // Refresh payments data
                    fetchPaymentsByCustomerId(customer.id!);
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
                  <DialogTitle>Update Customer Payment</DialogTitle>
                  <DialogDescription>
                    Modify the payment details
                  </DialogDescription>
                </DialogHeader>
                {editingPayment && (
                  <UpdateCustomerBillPaymentForm
                    payment={editingPayment}
                    onSuccess={() => {
                      setIsEditPaymentDialogOpen(false);
                      setEditingPayment(null);
                      // Refresh payments data
                      fetchPaymentsByCustomerId(customer.id!);
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>

            <Dialog
              open={isCreateSalesmanBillPaymentDialogOpen}
              onOpenChange={setIsCreateSalesmanBillPaymentDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Salesman Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Salesman Bill Payment</DialogTitle>
                  <DialogDescription>
                    Record a new payment for salesman bills from this customer
                  </DialogDescription>
                </DialogHeader>
                <CreateSalesmanBillPaymentForm
                  customerId={customer.id!}
                  pumpMasterId={customer.pumpMasterId!}
                  onSuccess={() => {
                    setIsCreateSalesmanBillPaymentDialogOpen(false);
                    // Refresh payments data
                    fetchSalesmanBillPaymentsByCustomerId(customer.id!);
                  }}
                />
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

            {/* Salesman Bill Payments Dialog */}
            <Dialog
              open={isPaymentsDialogOpen}
              onOpenChange={setIsPaymentsDialogOpen}
            >
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Salesman Bill Payments</DialogTitle>
                </DialogHeader>
                {selectedSalesmanBillId && (
                  <SalesmanBillPaymentsManager customerId={id} />
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabs List */}
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Bills</span>
              <span className="sm:hidden">Bills</span>
              <span>({bills.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="salesman-bills"
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Salesman Bills</span>
              <span className="sm:hidden">S. Bills</span>
              <span>({salesmanBills.length})</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
              <span className="sm:hidden">Payments</span>
              <span>({payments.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="salesman-payments"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Salesman Payments</span>
              <span className="sm:hidden">S. Payments</span>
              <span>({salesmanBillPayments.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              {billsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading bills...</span>
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bills found for this customer
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <Receipt className="h-3 w-3 opacity-50" />
                            {bill.billNo}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(bill.billDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{bill.rateType}</Badge>
                        </TableCell>
                        <TableCell>{bill.billItems.length} items</TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          ₹{bill.netAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salesman-bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salesman Bills</CardTitle>
              <CardDescription>
                Credit bills created by salesmen during fuel dispensing shifts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesmanBillsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading salesman bills...</span>
                </div>
              ) : salesmanBills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No salesman bills found for this customer
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesmanBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <Receipt className="h-3 w-3 opacity-50" />
                            {bill.billNo}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(bill.billDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {bill.productName || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>{bill.quantity.toFixed(3)} L</TableCell>
                        <TableCell>₹{bill.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          ₹{bill.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSalesmanBillId(bill.id);
                              setIsPaymentsDialogOpen(true);
                            }}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Payments
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                  No payments found for this customer
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Bill No</TableHead>
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
                            {payment.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.billNo ? (
                            <div className="flex items-center gap-1">
                              <Receipt className="h-3 w-3 opacity-50" />
                              {payment.billNo}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              General
                            </span>
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

        <TabsContent value="salesman-payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Salesman Bill Payment History
              </CardTitle>
              <CardDescription>
                Payments made for salesman bills during fuel dispensing shifts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesmanBillPaymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading salesman payments...</span>
                </div>
              ) : salesmanBillPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No salesman bill payments found for this customer
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesmanBillPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium font-mono text-sm">
                          {payment.referenceNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">
                              Shift {payment.salesmanShiftId.slice(-8)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-green-600">
                          ₹{payment.amount.toLocaleString()}
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
