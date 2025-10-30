import { useEffect, useState } from "react";
import { useCustomerStore } from "@/store/customer-store";
import { useBillStore } from "@/store/bill-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CalendarIcon,
  User,
  Receipt,
  CreditCard,
  FileText,
  Eye,
  AlertCircle,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { BillResponse } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { getBillsColumns } from "./BillsColumns";

// Helper functions for default date range
const getOneWeekAgo = () => subDays(new Date(), 7);
const getToday = () => new Date();

export function BillsDetailsPage() {
  const { customers, fetchCustomers } = useCustomerStore();
  const {
    error,
    selectedCustomerId,
    setSelectedCustomerId,
    setStartDate,
    setEndDate,
    fetchBillsByDateRange,
    getFilteredDateRangeBills,
  } = useBillStore();

  // Date filter states - Initialize with default dates (last 7 days)
  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);

  const [selectedBill, setSelectedBill] = useState<BillResponse | null>(null);
  const [isBillItemsDialogOpen, setIsBillItemsDialogOpen] = useState(false);
  const [isPaymentsDialogOpen, setIsPaymentsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Fetch data when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      const startDateStr = format(fromDate, "yyyy-MM-dd");
      const endDateStr = format(toDate, "yyyy-MM-dd");
      setStartDate(startDateStr);
      setEndDate(endDateStr);
      fetchBillsByDateRange();
    }
  }, [fromDate, toDate, setStartDate, setEndDate, fetchBillsByDateRange]);

  const handleClearFilters = () => {
    setFromDate(getOneWeekAgo());
    setToDate(getToday());
    setSelectedCustomerId("all-customers");
  };

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
            Filter by Date Range
          </CardTitle>
          <CardDescription>Select a date range to filter bills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* From Date */}
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm font-medium mb-2 block">
                From Date
              </Label>
              <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      setFromDate(date);
                      setIsFromDateOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm font-medium mb-2 block">To Date</Label>
              <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      setIsToDateOpen(false);
                    }}
                    disabled={(date) => {
                      if (date > new Date()) return true;
                      if (fromDate && date < fromDate) return true;
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Customer Filter */}
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
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

            <Button variant="outline" onClick={handleClearFilters}>
              Reset to Default
            </Button>
          </div>

          {(fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredBills.length} bills
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}
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
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bills List
          </CardTitle>
          <CardDescription>{filteredBills.length} bills found</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={getBillsColumns({
              onViewItems: (bill) => {
                setSelectedBill(bill);
                setIsBillItemsDialogOpen(true);
              },
              onViewPayments: (bill) => {
                setSelectedBill(bill);
                setIsPaymentsDialogOpen(true);
              },
            })}
            data={filteredBills}
            searchKey="customerName"
            searchPlaceholder="Search by customer name or bill number..."
            pageSize={10}
            enableRowSelection={false}
            enableColumnVisibility={true}
            enablePagination={true}
            enableSorting={true}
            enableFiltering={true}
          />
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
                      <p className="text-lg">{item.discount.toFixed(2)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        GST
                      </p>
                      <p className="text-lg">{item.gst.toFixed(2)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Net Amount
                      </p>
                      <p className="text-lg font-semibold">
                        ₹{item.netAmount?.toFixed(2)}
                      </p>
                    </div>
                  </div>
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
