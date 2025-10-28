import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [openingCash, setOpeningCash] = useState<string>("");
  const [selectedSalesman, setSelectedSalesman] =
    useState<SalesmanOption | null>(null);
  const [salesmen, setSalesmen] = useState<SalesmanOption[]>([]);
  const [selectedNozzles, setSelectedNozzles] = useState<NozzleOption[]>([]);
  const [availableNozzles, setAvailableNozzles] = useState<NozzleOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNozzles, setIsLoadingNozzles] = useState(true);
  const [isCheckingActiveShift, setIsCheckingActiveShift] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);

  const needsSalesmanSelector = !salesmanId; // Show selector if salesmanId not provided

  // Check for active shift when salesman is selected
  const checkForActiveShift = useCallback(
    async (salesmanIdToCheck: string) => {
      setIsCheckingActiveShift(true);
      setError(null);
      setActiveShiftId(null);
      try {
        const activeShifts = await SalesmanShiftService.getActiveShifts(
          salesmanIdToCheck
        );
        if (activeShifts && activeShifts.length > 0) {
          const activeShift = activeShifts[0];
          setActiveShiftId(activeShift.id);
          setError(
            `${
              selectedSalesman?.label || "This salesman"
            } already has an active shift. Please close the existing shift before starting a new one.`
          );
        }
      } catch (err) {
        // If error fetching active shifts, assume no active shift
        console.error("Error checking active shift:", err);
      } finally {
        setIsCheckingActiveShift(false);
      }
    },
    [selectedSalesman]
  );

  // Fetch salesmen if needed (for admin/manager)
  useEffect(() => {
    if (needsSalesmanSelector) {
      fetchSalesmen();
    }
  }, [needsSalesmanSelector]);

  // Check for active shift when salesman is selected
  useEffect(() => {
    if (selectedSalesman) {
      checkForActiveShift(selectedSalesman.value);
    } else {
      setError(null);
      setActiveShiftId(null);
    }
  }, [selectedSalesman, checkForActiveShift]);

  // Fetch available nozzles on mount
  useEffect(() => {
    fetchAvailableNozzles();
  }, []);

  const fetchSalesmen = async () => {
    try {
      const data = await SalesmanService.getAll();
      const options: SalesmanOption[] = data.map((s: Salesman) => ({
        value: s.id!,
        label: s.username,
      }));
      setSalesmen(options);
    } catch (err) {
      toast.error("Failed to load salesmen");
      console.error(err);
    }
  };

  const fetchAvailableNozzles = async () => {
    setIsLoadingNozzles(true);
    try {
      const nozzles = await NozzleService.getAllForPump();

      // Filter out nozzles that are currently assigned to an open shift
      const availableNozzlesData: NozzleOption[] = [];

      for (const nozzle of nozzles) {
        if (!nozzle.id) continue; // Skip nozzles without ID

        try {
          // Try to get assignments for this nozzle
          const assignments = await NozzleAssignmentService.getByNozzleId(
            nozzle.id
          );
          // If there are any open assignments, skip this nozzle
          const hasOpenAssignment = assignments.some(
            (a) => a.status === "OPEN"
          );
          if (!hasOpenAssignment) {
            availableNozzlesData.push({
              value: nozzle.id,
              label: `${nozzle.nozzleName} - ${nozzle.productName}`,
              data: nozzle,
            });
          }
        } catch {
          // If no assignments found (404), nozzle is available
          availableNozzlesData.push({
            value: nozzle.id,
            label: `${nozzle.nozzleName} - ${nozzle.productName}`,
            data: nozzle,
          });
        }
      }

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
          <AlertDescription className="flex flex-col gap-2">
            <span>{error}</span>
            {activeShiftId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate(`/shifts/${activeShiftId}`);
                  onCancel();
                }}
              >
                View Active Shift
              </Button>
            )}
          </AlertDescription>
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
            isDisabled={isLoading || isCheckingActiveShift}
            className="text-base"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "40px",
                fontSize: "16px",
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            menuPortalTarget={document.body}
          />
          {isCheckingActiveShift && (
            <p className="text-sm text-muted-foreground flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Checking for active shift...
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
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
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
