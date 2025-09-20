import { useEffect, useState } from 'react';
import { useCustomerStore } from '@/store/customer-store';
import { useBillStore } from '@/store/bill-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  RefreshCw,
  Calendar,
  User,
  Receipt,
  CreditCard,
  FileText,
  Eye,
  AlertCircle,
} from 'lucide-react';
import type { BillResponse } from '@/types';

export function BillsDetailsPage() {
  const { customers, fetchCustomers } = useCustomerStore();
  const {
    loading,
    error,
    startDate,
    endDate,
    selectedCustomerId,
    setStartDate,
    setEndDate,
    setSelectedCustomerId,
    fetchBillsByDateRange,
    getFilteredDateRangeBills,
  } = useBillStore();

  const [selectedBill, setSelectedBill] = useState<BillResponse | null>(null);
  const [isBillItemsDialogOpen, setIsBillItemsDialogOpen] = useState(false);
  const [isPaymentsDialogOpen, setIsPaymentsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    fetchBillsByDateRange();
  }, [fetchBillsByDateRange]);

  const filteredBills = getFilteredDateRangeBills();

  return (
    <div className="container mx-auto space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Receipt className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bills Details</h1>
            <p className="text-muted-foreground">
              View and filter bills by date range and customer
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </Label>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-customers">
                    <span className="text-muted-foreground">All Customers</span>
                  </SelectItem>
                  {customers.map((customer) => (
                    <SelectItem
                      key={customer.id || customer.customerName}
                      value={customer.id || customer.customerName}
                    >
                      {customer.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <Button
                onClick={fetchBillsByDateRange}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bills List
            </span>
            <Badge variant="secondary" className="text-sm">
              {filteredBills.length} bills found
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Bill No</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Bill Type</TableHead>
                  <TableHead className="font-semibold">Rate Type</TableHead>
                  <TableHead className="font-semibold text-right">
                    Total Amount
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Discount
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Tax
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Net Amount
                  </TableHead>
                  <TableHead className="font-semibold">Vehicle No</TableHead>
                  <TableHead className="font-semibold">Driver</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Updated</TableHead>
                  <TableHead className="font-semibold text-center">
                    Items
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Payments
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{bill.billNo}</TableCell>
                    <TableCell>{bill.billDate}</TableCell>
                    <TableCell
                      className="max-w-[150px] truncate"
                      title={bill.customerName}
                    >
                      {bill.customerName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{bill.billType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{bill.rateType}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{bill.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{bill.discountAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{bill.taxAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{bill.netAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm bg-muted px-2 py-1 rounded">
                        {bill.vehicleNo || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell
                      className="max-w-[120px] truncate"
                      title={bill.driverName}
                    >
                      {bill.driverName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(bill.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBill(bill);
                          setIsBillItemsDialogOpen(true);
                        }}
                        className="h-8 px-2"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        {bill.billItems.length}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBill(bill);
                          setIsPaymentsDialogOpen(true);
                        }}
                        className="h-8 px-2"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        {bill.payments?.length || 0}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredBills.length === 0 && !loading && (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-muted rounded-full">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-medium">No bills found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or date range
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Items Dialog */}
      <Dialog
        open={isBillItemsDialogOpen}
        onOpenChange={setIsBillItemsDialogOpen}
      >
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bill Items - Bill #{selectedBill?.billNo}
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of all items in this bill
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {selectedBill?.billItems.map((item, index) => (
              <Card key={item.id} className="border-l-4 border-l-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {item.productName}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.salesUnit}</Badge>
                        {item.hsnCode && (
                          <Badge variant="secondary">HSN: {item.hsnCode}</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          Item #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Quantity
                      </p>
                      <p className="text-lg font-semibold">{item.quantity}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Rate
                      </p>
                      <p className="text-lg font-semibold">
                        ₹{item.rate.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Amount
                      </p>
                      <p className="text-lg font-semibold">
                        ₹{item.amount?.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Discount
                      </p>
                      <p className="text-lg">
                        {item.discount.toFixed(2)}% <br />
                        <span className="text-sm text-muted-foreground">
                          (₹{item.discountAmount?.toFixed(2)})
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Tax
                      </p>
                      <p className="text-lg">
                        {item.taxPercentage.toFixed(2)}% <br />
                        <span className="text-sm text-muted-foreground">
                          (₹{item.taxAmount?.toFixed(2)})
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Net Amount
                      </p>
                      <p className="text-lg font-semibold">
                        ₹{item.netAmount?.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-xl font-bold">
                        ₹{item.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {item.description && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Description
                        </p>
                        <p className="text-sm bg-muted p-3 rounded-md">
                          {item.description}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payments Dialog */}
      <Dialog
        open={isPaymentsDialogOpen}
        onOpenChange={setIsPaymentsDialogOpen}
      >
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payments - Bill #{selectedBill?.billNo}
            </DialogTitle>
            <DialogDescription>
              Payment history and details for this bill
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {selectedBill?.payments?.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-muted rounded-full">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-medium">No payments found</p>
                    <p className="text-sm text-muted-foreground">
                      This bill has no payment records yet
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              selectedBill?.payments?.map((payment, index) => (
                <Card
                  key={payment.id}
                  className="border-l-4 border-l-primary/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          Payment #{index + 1}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {payment.paymentMethod}
                          </Badge>
                          <span className="text-sm text-muted-foreground font-mono">
                            {payment.referenceNumber}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          ₹{payment.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Payment Date
                        </p>
                        <p className="text-lg font-semibold">
                          {payment.paymentDate}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Created At
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {payment.notes && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Notes
                          </p>
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {payment.notes}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
