import { useEffect, useState } from "react";
import { useBillStore } from "@/store/bill-store";
import { useCustomerBillPaymentStore } from "@/store/customer-bill-payment-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
  Receipt,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { Customer } from "@/types";

interface CustomerDetailDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailDialog({
  customer,
  open,
  onOpenChange,
}: CustomerDetailDialogProps) {
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

  const [activeTab, setActiveTab] = useState("bills");

  useEffect(() => {
    if (customer?.id && open) {
      fetchBillsByCustomerId(customer.id);
      fetchPaymentsByCustomerId(customer.id);
    }
  }, [customer?.id, open, fetchBillsByCustomerId, fetchPaymentsByCustomerId]);

  if (!customer) return null;

  const totalBillsAmount = bills.reduce((sum, bill) => sum + bill.netAmount, 0);
  const totalPaymentsAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const outstandingBalance = totalBillsAmount - totalPaymentsAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Customer Details</span>
            <Badge variant="outline">{customer.customerName}</Badge>
          </DialogTitle>
          <DialogDescription>
            View customer's purchase history and payment records
          </DialogDescription>
        </DialogHeader>

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
                      customer.openingBalance && customer.openingBalance < 0
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
                  <div className="text-sm text-muted-foreground">
                    Total Bills
                  </div>
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
                      outstandingBalance >= 0
                        ? "text-red-600"
                        : "text-green-600"
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Bills ({bills.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments ({payments.length})
            </TabsTrigger>
          </TabsList>

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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
