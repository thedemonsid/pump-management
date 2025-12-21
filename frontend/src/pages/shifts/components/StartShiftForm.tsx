import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ReactSelect from "react-select";
import { NozzleService } from "@/services/nozzle-service";
import { NozzleAssignmentService } from "@/services/nozzle-assignment-service";
import { SalesmanShiftService } from "@/services/salesman-shift-service";
import { SalesmanService } from "@/services/salesman-service";
import { toast } from "sonner";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SingleDatePicker } from "@/components/shared/SingleDatePicker";
import { useAuth } from "@/hooks/useAuth";
import type { Nozzle, Salesman } from "@/types";

interface StartShiftFormProps {
  salesmanId?: string; // Optional - if not provided, show salesman selector
  onSuccess: () => void;
  onCancel: () => void;
}

interface NozzleOption {
  value: string;
  label: string;
  data: Nozzle;
}

interface SalesmanOption {
  value: string;
  label: string;
}

export function StartShiftForm({
  salesmanId,
  onSuccess,
  onCancel,
}: StartShiftFormProps) {
  const { user } = useAuth();
  const [openingCash] = useState<string>("0");
  const [selectedSalesman, setSelectedSalesman] =
    useState<SalesmanOption | null>(null);
  const [salesmen, setSalesmen] = useState<SalesmanOption[]>([]);
  const [selectedNozzles, setSelectedNozzles] = useState<NozzleOption[]>([]);
  const [availableNozzles, setAvailableNozzles] = useState<NozzleOption[]>([]);
  const [shiftStartDate, setShiftStartDate] = useState<Date | undefined>(
    new Date()
  );
  const [shiftStartTime, setShiftStartTime] = useState<string>(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNozzles, setIsLoadingNozzles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const needsSalesmanSelector = !salesmanId; // Show selector if salesmanId not provided
  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  // Fetch salesmen if needed (for admin/manager)
  useEffect(() => {
    if (needsSalesmanSelector) {
      fetchSalesmen();
    }
  }, [needsSalesmanSelector]);

  // Fetch available nozzles on mount and clear error
  useEffect(() => {
    setError(null);
    fetchAvailableNozzles();
  }, []);

  const fetchSalesmen = async () => {
    try {
      const data = await SalesmanService.getAll();

      // Check each salesman for active shifts and filter them out
      const salesmenWithActiveShiftCheck = await Promise.all(
        data.map(async (s: Salesman) => {
          try {
            const activeShifts = await SalesmanShiftService.getActiveShifts(
              s.id!
            );
            return {
              salesman: s,
              hasActiveShift: activeShifts && activeShifts.length > 0,
            };
          } catch {
            // If error checking, assume no active shift
            return {
              salesman: s,
              hasActiveShift: false,
            };
          }
        })
      );

      // Filter out salesmen with active shifts
      const availableSalesmen = salesmenWithActiveShiftCheck
        .filter((item) => !item.hasActiveShift)
        .map((item) => ({
          value: item.salesman.id!,
          label: item.salesman.username,
        }));

      setSalesmen(availableSalesmen);
    } catch (err) {
      toast.error("Failed to load salesmen");
      console.error(err);
    }
  };

  const fetchAvailableNozzles = async () => {
    setIsLoadingNozzles(true);
    setError(null);
    try {
      // Fetch all nozzles
      const nozzles = await NozzleService.getAllForPump();

      // Get all assigned nozzle IDs in a single optimized API call
      const assignedNozzleIds = new Set(
        await NozzleAssignmentService.getAssignedNozzleIds()
      );

      console.log("Total assigned nozzle IDs:", Array.from(assignedNozzleIds));

      // Filter out nozzles that are assigned to open shifts
      const availableNozzlesData: NozzleOption[] = nozzles
        .filter((nozzle) => {
          const isAvailable = nozzle.id && !assignedNozzleIds.has(nozzle.id);
          if (nozzle.id) {
            console.log(
              `Nozzle: ${nozzle.nozzleName} (${nozzle.id}) - ${
                isAvailable ? "AVAILABLE" : "ASSIGNED"
              }`
            );
          }
          return isAvailable;
        })
        .map((nozzle) => ({
          value: nozzle.id!,
          label: `${nozzle.nozzleName} - ${nozzle.productName}`,
          data: nozzle,
        }));

      console.log(
        `Total nozzles: ${nozzles.length}, Available: ${availableNozzlesData.length}, Assigned: ${assignedNozzleIds.size}`
      );

      setAvailableNozzles(availableNozzlesData);
    } catch (err) {
      const errorMessage = "Failed to load available nozzles";
      toast.error(errorMessage);
      console.error(err);
      setError(errorMessage);
    } finally {
      setIsLoadingNozzles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (needsSalesmanSelector && !selectedSalesman) {
      setError("Please select a salesman");
      return;
    }

    // Check if there's already an error (like active shift detected)
    if (error) {
      toast.error(error);
      return;
    }

    if (selectedNozzles.length === 0) {
      setError("Please select at least one nozzle");
      return;
    }

    setIsLoading(true);

    try {
      // Determine which salesmanId to use
      const effectiveSalesmanId = salesmanId || selectedSalesman?.value;

      if (!effectiveSalesmanId) {
        throw new Error("Salesman ID is required");
      }

      // Step 1: Start the shift
      const shiftPayload: {
        salesmanId: string;
        openingCash: number;
        startDatetime?: string;
      } = {
        salesmanId: effectiveSalesmanId,
        openingCash: parseFloat(openingCash),
      };

      // Add custom start date only for admin/manager
      if (isAdminOrManager && shiftStartDate) {
        // Use the selected date and time
        const year = shiftStartDate.getFullYear();
        const month = String(shiftStartDate.getMonth() + 1).padStart(2, "0");
        const day = String(shiftStartDate.getDate()).padStart(2, "0");
        const [hours, minutes] = shiftStartTime.split(":");
        const seconds = "00";
        shiftPayload.startDatetime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }

      const shift = await SalesmanShiftService.startShift(shiftPayload);

      // Step 2: Assign nozzles to the shift
      const assignmentPromises = selectedNozzles.map((nozzle) =>
        NozzleAssignmentService.addNozzleToShift(shift.id, {
          nozzleId: nozzle.value,
          openingBalance: nozzle.data.currentReading || 0,
        })
      );

      await Promise.all(assignmentPromises);

      toast.success("Shift started successfully!");
      onSuccess();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to start shift";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Shift Start Date (for admin/manager only) */}
      {isAdminOrManager && (
        <>
          <SingleDatePicker
            date={shiftStartDate}
            onDateChange={setShiftStartDate}
            label="Shift Start Date"
            disabled={isLoading}
            disableFutureDates={true}
            placeholder="Select shift start date"
          />
          <div className="space-y-2">
            <Label htmlFor="shift-time" className="text-sm font-medium">
              Shift Start Time
            </Label>
            <Input
              id="shift-time"
              type="time"
              value={shiftStartTime}
              onChange={(e) => setShiftStartTime(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
        </>
      )}

      {/* Salesman Selection (for admin/manager) */}
      {needsSalesmanSelector && (
        <div className="space-y-2">
          <Label htmlFor="salesman">
            Select Salesman <span className="text-red-500">*</span>
          </Label>
          <ReactSelect
            id="salesman"
            options={salesmen}
            value={selectedSalesman}
            onChange={setSelectedSalesman}
            placeholder="Select salesman..."
            isDisabled={isLoading}
            className="text-base"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "40px",
                fontSize: "16px",
              }),
            }}
          />
          {salesmen.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No available salesmen. All salesmen have active shifts.
            </p>
          )}
        </div>
      )}

      {/* Nozzle Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="nozzles">
            Select Nozzles <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchAvailableNozzles}
            disabled={isLoadingNozzles || isLoading}
            className="h-8 gap-2"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isLoadingNozzles ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
        {isLoadingNozzles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ReactSelect
              id="nozzles"
              isMulti
              options={availableNozzles}
              value={selectedNozzles}
              onChange={(selected) =>
                setSelectedNozzles(selected as NozzleOption[])
              }
              placeholder="Select nozzles to assign..."
              isDisabled={isLoading}
              closeMenuOnSelect={false}
              className="text-base"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "40px",
                  fontSize: "16px",
                }),
                option: (base) => ({
                  ...base,
                  fontSize: "16px",
                }),
              }}
              noOptionsMessage={() =>
                availableNozzles.length === 0
                  ? "No available nozzles. All nozzles are currently assigned."
                  : "No nozzles found"
              }
            />
            <p className="text-sm text-muted-foreground">
              {availableNozzles.length === 0
                ? "All nozzles are currently in use"
                : `${availableNozzles.length} nozzle(s) available`}
            </p>
          </>
        )}
      </div>

      {/* Selected Nozzles Preview */}
      {selectedNozzles.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Nozzles</Label>
          <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
            {selectedNozzles.map((nozzle) => (
              <div
                key={nozzle.value}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">{nozzle.label}</span>
                <span className="text-muted-foreground">
                  Reading: {nozzle.data.currentReading?.toFixed(3) || "0.000"} L
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {isAdminOrManager
            ? "You can select a custom start date for the shift. Make sure to close all nozzles before ending the shift."
            : "The shift will start at the current date and time. Make sure to close all nozzles before ending your shift."}
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isLoadingNozzles}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Shift...
            </>
          ) : (
            "Start Shift"
          )}
        </Button>
      </div>
    </form>
  );
}
