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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Loader2, Package, CalendarIcon } from "lucide-react";
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
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { getPurchaseColumns } from "./PurchasesColumns";

// Helper functions for date defaults
const getOneWeekAgo = () => subDays(new Date(), 7);
const getToday = () => new Date();

export function PurchasesPage() {
  const { purchases, loading, error, fetchPurchases } = usePurchaseStore();
  const navigate = useNavigate();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Date filter states - Initialize with default dates
  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);

  // Fetch data when dates change
  useEffect(() => {
    fetchPurchases(fromDate, toDate);
  }, [fetchPurchases, fromDate, toDate]);

  const handleViewItems = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDialogOpen(true);
  };

  const handleEdit = (purchase: Purchase) => {
    if (purchase.id) {
      navigate(`/purchases/${purchase.id}/edit`);
    }
  };

  const handleClearFilters = () => {
    setFromDate(getOneWeekAgo());
    setToDate(getToday());
  };

  // Get columns for DataTable
  const columns = getPurchaseColumns({
    onEdit: handleEdit,
    onViewItems: handleViewItems,
  });

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

      {/* Date Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Date Range</CardTitle>
          <CardDescription>
            Select a date range to filter purchase records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* From Date */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                From Date
              </label>
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
                  <Calendar
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
              <label className="text-sm font-medium mb-2 block">To Date</label>
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
                  <Calendar
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

            <Button variant="outline" onClick={handleClearFilters}>
              Reset to Default
            </Button>
          </div>

          {(fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {purchases.length} record(s)
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DataTable Card */}
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
            <DataTable
              columns={columns}
              data={purchases}
              searchKey="supplierName"
              searchPlaceholder="Search by supplier..."
              pageSize={10}
              enableRowSelection={false}
              enableColumnVisibility={true}
              enablePagination={true}
              enableSorting={true}
              enableFiltering={true}
            />
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
