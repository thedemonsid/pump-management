import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactSelect from "react-select";
import { NozzleService } from "@/services/nozzle-service";
import { NozzleAssignmentService } from "@/services/nozzle-assignment-service";
import { SalesmanShiftService } from "@/services/salesman-shift-service";
import { SalesmanService } from "@/services/salesman-service";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [openingCash, setOpeningCash] = useState<string>("");
  const [selectedSalesman, setSelectedSalesman] =
    useState<SalesmanOption | null>(null);
  const [salesmen, setSalesmen] = useState<SalesmanOption[]>([]);
  const [selectedNozzles, setSelectedNozzles] = useState<NozzleOption[]>([]);
  const [availableNozzles, setAvailableNozzles] = useState<NozzleOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNozzles, setIsLoadingNozzles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const needsSalesmanSelector = !salesmanId; // Show selector if salesmanId not provided

  // Fetch salesmen if needed (for admin/manager)
  useEffect(() => {
    if (needsSalesmanSelector) {
      fetchSalesmen();
    }
  }, [needsSalesmanSelector]);

  // Fetch available nozzles on mount
  useEffect(() => {
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
    try {
      const nozzles = await NozzleService.getAllForPump();

      // Get all open shifts to find which nozzles are currently assigned
      const openShifts = await SalesmanShiftService.getAll({ status: "OPEN" });

      // Collect all nozzle IDs that are assigned to open shifts
      const assignedNozzleIds = new Set<string>();

      for (const shift of openShifts) {
        try {
          const assignments =
            await NozzleAssignmentService.getAssignmentsForShift(shift.id);
          // Add nozzle IDs from OPEN assignments
          assignments
            .filter((a) => a.status === "OPEN")
            .forEach((a) => {
              if (a.nozzleId) {
                assignedNozzleIds.add(a.nozzleId);
              }
            });
        } catch (err) {
          console.error(
            `Error fetching assignments for shift ${shift.id}:`,
            err
          );
        }
      }

      // Filter out nozzles that are assigned to open shifts
      const availableNozzlesData: NozzleOption[] = nozzles
        .filter((nozzle) => nozzle.id && !assignedNozzleIds.has(nozzle.id))
        .map((nozzle) => ({
          value: nozzle.id!,
          label: `${nozzle.nozzleName} - ${nozzle.productName}`,
          data: nozzle,
        }));

      setAvailableNozzles(availableNozzlesData);
    } catch (err) {
      toast.error("Failed to load available nozzles");
      console.error(err);
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

    if (!openingCash || parseFloat(openingCash) < 0) {
      setError("Please enter a valid opening cash amount");
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
      const shift = await SalesmanShiftService.startShift({
        salesmanId: effectiveSalesmanId,
        openingCash: parseFloat(openingCash),
      });

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

      {/* Opening Cash */}
      <div className="space-y-2">
        <Label htmlFor="openingCash">
          Opening Cash <span className="text-red-500">*</span>
        </Label>
        <Input
          id="openingCash"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={openingCash}
          onChange={(e) => setOpeningCash(e.target.value)}
          disabled={isLoading}
          className="text-base"
        />
        <p className="text-sm text-muted-foreground">
          Amount of cash given at the start of shift
        </p>
      </div>

      {/* Nozzle Selection */}
      <div className="space-y-2">
        <Label htmlFor="nozzles">
          Select Nozzles <span className="text-red-500">*</span>
        </Label>
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
          The shift will start at the current date and time. Make sure to close
          all nozzles before ending your shift.
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
