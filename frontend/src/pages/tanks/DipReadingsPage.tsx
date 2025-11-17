import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DipReadingService, TankService } from "@/services";
import type { DipReading, Tank } from "@/types";
import { DipReadingForm } from "./DipReadingForm";
import { DataTable } from "@/components/ui/data-table";
import { getDipReadingColumns } from "./DipReadingColumns";
import { toast } from "sonner";
import { useTankLedgerStore } from "@/store/tank-ledger-store";
import { formatOpeningLevelDate } from "@/store/tank-store";

export function DipReadingsPage() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [selectedTankId, setSelectedTankId] = useState<string>("");
  const [readings, setReadings] = useState<DipReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [tanksLoading, setTanksLoading] = useState(false);
  const [currentLevelLoading, setCurrentLevelLoading] = useState(false);
  const [calculatedCurrentLevel, setCalculatedCurrentLevel] = useState<
    number | null
  >(null);

  const { getCurrentLevel } = useTankLedgerStore();

  // Date range state
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    date.setHours(0, 0, 0, 0); // Start of day
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999); // End of day
    return date;
  });

  // Sheet state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<DipReading | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch tanks on mount
  useEffect(() => {
    const fetchTanks = async () => {
      setTanksLoading(true);
      try {
        const data = await TankService.getAll();
        setTanks(data);
        if (data.length > 0 && !selectedTankId) {
          setSelectedTankId(data[0].id!);
        }
      } catch (error) {
        console.error("Failed to fetch tanks:", error);
        toast.error("Failed to fetch tanks");
      } finally {
        setTanksLoading(false);
      }
    };

    fetchTanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch readings when tank or date range changes
  const fetchReadings = async () => {
    if (!selectedTankId) return;

    setLoading(true);
    try {
      const data = await DipReadingService.getByTankId(selectedTankId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setReadings(data);
    } catch (error) {
      console.error("Failed to fetch dip readings:", error);
      toast.error("Failed to fetch dip readings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTankId) {
      fetchReadings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTankId, startDate, endDate]);

  // Calculate current level for selected tank
  useEffect(() => {
    const calculateCurrentLevel = async () => {
      if (!selectedTank?.id) {
        setCalculatedCurrentLevel(null);
        return;
      }

      setCurrentLevelLoading(true);
      try {
        const today = new Date().toISOString().split("T")[0];
        const fromDate = selectedTank.openingLevelDate
          ? formatOpeningLevelDate(selectedTank.openingLevelDate) || today
          : today;

        const currentLevel = await getCurrentLevel({
          tankId: selectedTank.id,
          fromDate,
          toDate: today,
        });

        setCalculatedCurrentLevel(currentLevel);
      } catch (error) {
        console.error("Failed to calculate current level:", error);
        // Fallback to tank's current level if available
        setCalculatedCurrentLevel(selectedTank.currentLevel || null);
      } finally {
        setCurrentLevelLoading(false);
      }
    };

    calculateCurrentLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTankId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dip reading?")) return;

    setDeletingId(id);
    try {
      await DipReadingService.delete(id);
      toast.success("Dip reading deleted successfully");
      fetchReadings();
    } catch (error) {
      console.error("Failed to delete dip reading:", error);
      toast.error("Failed to delete dip reading");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingReading(null);
    fetchReadings();
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(num);
  };

  const columns = getDipReadingColumns({
    onEdit: setEditingReading,
    onDelete: handleDelete,
    deletingId,
  });

  const selectedTank = tanks.find((t) => t.id === selectedTankId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dip Readings</h1>
          <p className="text-muted-foreground">
            Record and manage tank dip readings with date filters
          </p>
        </div>

        <Button
          onClick={() => setIsFormOpen(true)}
          disabled={!selectedTankId || tanksLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Dip Reading
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Select tank and date range to view dip readings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tank Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tank</label>
              <Select
                value={selectedTankId}
                onValueChange={setSelectedTankId}
                disabled={tanksLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tank" />
                </SelectTrigger>
                <SelectContent>
                  {tanks.map((tank) => (
                    <SelectItem key={tank.id} value={tank.id!}>
                      {tank.tankName} - {tank.product?.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        date.setHours(0, 0, 0, 0); // Start of day
                        setStartDate(date);
                      }
                    }}
                    disabled={(date) => date > endDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        date.setHours(23, 59, 59, 999); // End of day
                        setEndDate(date);
                      }
                    }}
                    disabled={(date) => date < startDate || date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Tank Info */}
      {selectedTank && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tank Name</p>
                <p className="text-lg font-semibold">{selectedTank.tankName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="text-lg font-semibold">
                  {selectedTank.product?.productName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="text-lg font-semibold">
                  {formatNumber(selectedTank.capacity)} L
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                {currentLevelLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Calculating...
                    </span>
                  </div>
                ) : (
                  <p className="text-lg font-semibold">
                    {formatNumber(calculatedCurrentLevel ?? undefined)} L
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Readings List */}
      <Card>
        <CardHeader>
          <CardTitle>Dip Readings</CardTitle>
          <CardDescription>
            Showing {readings.length} reading(s) from {format(startDate, "PPP")}{" "}
            to {format(endDate, "PPP")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading dip readings...</span>
              </div>
            </div>
          ) : readings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-lg font-semibold mb-2">
                No Dip Readings Found
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedTankId
                  ? "No readings found for the selected date range"
                  : "Please select a tank to view dip readings"}
              </p>
              {selectedTankId && (
                <Button onClick={() => setIsFormOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Reading
                </Button>
              )}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={readings}
              searchKey="remarks"
              searchPlaceholder="Search remarks..."
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

      {/* Form Sheet */}
      <Sheet
        open={isFormOpen || editingReading !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingReading(null);
          }
        }}
      >
        <SheetContent className="sm:max-w-[600px] w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingReading ? "Edit" : "Add"} Dip Reading
            </SheetTitle>
            <SheetDescription>
              {editingReading ? "Update" : "Record"} dip reading for{" "}
              {selectedTank?.tankName}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedTank && (
              <DipReadingForm
                tank={selectedTank}
                reading={editingReading}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingReading(null);
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
