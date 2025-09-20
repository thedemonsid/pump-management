import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerStore } from '@/store/customer-store';
import { useBillStore } from '@/store/bill-store';
import { useCustomerBillPaymentStore } from '@/store/customer-bill-payment-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from 'lucide-react';
import { CreateCustomerBillPaymentForm } from './CreateCustomerBillPaymentForm';
import { UpdateCustomerBillPaymentForm } from './UpdateCustomerBillPaymentForm';
import type { CustomerBillPaymentResponse } from '@/types';

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

  const [activeTab, setActiveTab] = useState('bills');
  const [isCreatePaymentDialogOpen, setIsCreatePaymentDialogOpen] =
    useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<CustomerBillPaymentResponse | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null
  );

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
    }
  }, [
    id,
    fetchBillsByCustomerId,
    fetchPaymentsByCustomerId,
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
      console.error('Failed to delete payment:', error);
      alert('Failed to delete payment. Please try again.');
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
        <Button onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const totalBillsAmount = bills.reduce((sum, bill) => sum + bill.netAmount, 0);
  const totalPaymentsAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const outstandingBalance =
    totalBillsAmount - totalPaymentsAmount - (customer.openingBalance || 0);

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
                  {customer.gstNumber || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">PAN:</span>
                <span className="font-mono text-sm">
                  {customer.panNumber || 'N/A'}
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
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  ₹{customer.openingBalance?.toLocaleString() || '0'}
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
                    outstandingBalance >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  ₹{Math.abs(outstandingBalance).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {outstandingBalance >= 0 ? 'Outstanding' : 'Credit Balance'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills and Payments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Bills ({bills.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments ({payments.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
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
                <Button>
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
                          <Badge variant="secondary">{bill.billType}</Badge>
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
      </Tabs>
    </div>
  );
}
