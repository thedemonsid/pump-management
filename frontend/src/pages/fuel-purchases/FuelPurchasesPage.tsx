import { useEffect, useState } from "react";
import { useFuelPurchaseStore } from "@/store/fuel-purchase-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2, Fuel, CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DataTable } from "@/components/ui/data-table";
import { CreateFuelPurchaseForm } from "./CreateFuelPurchaseForm";
import { UpdateFuelPurchaseForm } from "./UpdateFuelPurchaseForm";
import { getFuelPurchaseColumns } from "./FuelPurchasesColumns";
import type { FuelPurchase } from "@/types";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

// Helper function to get date from 7 days ago
const getOneWeekAgo = () => {
  return subDays(new Date(), 7);
};

// Helper function to get today's date
const getToday = () => {
  return new Date();
};

export function FuelPurchasesPage() {
  const { fuelPurchases, loading, error, fetchFuelPurchases } =
    useFuelPurchaseStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFuelPurchase, setEditingFuelPurchase] =
    useState<FuelPurchase | null>(null);

  // Date filter states - Initialize with 1 week ago to today
  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);

  // Fetch data when component mounts or when date filters change
  useEffect(() => {
    fetchFuelPurchases(fromDate, toDate);
  }, [fetchFuelPurchases, fromDate, toDate]);

  const handleClearFilters = () => {
    setFromDate(getOneWeekAgo());
    setToDate(getToday());
  };

  const columns = getFuelPurchaseColumns({
    onEdit: setEditingFuelPurchase,
  });

  if (loading && fuelPurchases.length === 0) {
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
          <h1 className="text-3xl font-bold tracking-tight">Fuel Purchases</h1>
          <p className="text-muted-foreground">
            Manage your fuel purchases and tank inventory
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Fuel Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Fuel Purchase</DialogTitle>
              <DialogDescription>
                Add a new fuel purchase record to the system.
              </DialogDescription>
            </DialogHeader>
            <CreateFuelPurchaseForm
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

      {/* Date Range Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Date Range</CardTitle>
          <CardDescription>
            Select a date range to filter fuel purchase records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
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
                      // Disable dates after today
                      if (date > new Date()) return true;
                      // Disable dates before fromDate if fromDate is set
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
              Showing {fuelPurchases.length} records
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fuel Purchase Records</CardTitle>
          <CardDescription>
            A list of all fuel purchase transactions in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fuelPurchases.length === 0 ? (
            <div className="text-center py-8">
              <Fuel className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No fuel purchases found
              </h3>
              <p className="text-muted-foreground">
                Get started by creating your first fuel purchase record.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={fuelPurchases}
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

      {/* Edit Dialog */}
      <Dialog
        open={!!editingFuelPurchase}
        onOpenChange={(open) => {
          if (!open) setEditingFuelPurchase(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Fuel Purchase</DialogTitle>
            <DialogDescription>
              Update the fuel purchase details.
            </DialogDescription>
          </DialogHeader>
          {editingFuelPurchase && (
            <UpdateFuelPurchaseForm
              fuelPurchase={editingFuelPurchase}
              onSuccess={() => setEditingFuelPurchase(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
