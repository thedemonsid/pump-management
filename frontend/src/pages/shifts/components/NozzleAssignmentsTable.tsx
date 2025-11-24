import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NozzleAssignmentService } from "@/services/nozzle-assignment-service";
import { toast } from "sonner";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { NozzleAssignmentResponse } from "@/types";
import { format } from "date-fns";

interface NozzleAssignmentsTableProps {
  shiftId: string;
  onNozzleClosed?: () => void;
}

export function NozzleAssignmentsTable({
  shiftId,
  onNozzleClosed,
}: NozzleAssignmentsTableProps) {
  const [assignments, setAssignments] = useState<NozzleAssignmentResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<NozzleAssignmentResponse | null>(null);
  const [closingBalance, setClosingBalance] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoading(true);
      try {
        const data = await NozzleAssignmentService.getAssignmentsForShift(
          shiftId
        );
        setAssignments(data);
      } catch (err) {
        toast.error("Failed to load nozzle assignments");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [shiftId]);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await NozzleAssignmentService.getAssignmentsForShift(
        shiftId
      );
      setAssignments(data);
    } catch (err) {
      toast.error("Failed to load nozzle assignments");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseNozzle = (assignment: NozzleAssignmentResponse) => {
    setSelectedAssignment(assignment);
    setClosingBalance(assignment.openingBalance.toString());
    setError(null);
  };

  const handleSubmitClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setError(null);

    const closingValue = parseFloat(closingBalance);

    // Validation
    if (isNaN(closingValue) || closingValue < 0) {
      setError("Please enter a valid closing balance");
      return;
    }

    if (closingValue < selectedAssignment.openingBalance) {
      setError(
        `Closing balance cannot be less than opening balance (${selectedAssignment.openingBalance.toFixed(
          3
        )})`
      );
      return;
    }

    setIsClosing(true);

    try {
      await NozzleAssignmentService.closeNozzleAssignment(
        shiftId,
        selectedAssignment.id,
        {
          closingBalance: closingValue,
        }
      );

      toast.success("Nozzle closed successfully!");
      setSelectedAssignment(null);
      setClosingBalance("");
      fetchAssignments();
      onNozzleClosed?.();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to close nozzle";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No nozzles assigned to this shift yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nozzle</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Opening (L)</TableHead>
              <TableHead className="text-right">Closing (L)</TableHead>
              <TableHead className="text-right">Dispensed (L)</TableHead>
              <TableHead className="text-right">Tests (L)</TableHead>
              <TableHead className="text-right">Amount (₹)</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {assignment.nozzleName}
                </TableCell>
                <TableCell>{assignment.productName}</TableCell>
                <TableCell>
                  {assignment.status === "OPEN" ? (
                    <Badge variant="default" className="bg-green-600">
                      OPEN
                    </Badge>
                  ) : (
                    <Badge variant="secondary">CLOSED</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {assignment.openingBalance.toFixed(3)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {assignment.closingBalance?.toFixed(3) || "-"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {assignment.dispensedAmount?.toFixed(3) || "-"}
                </TableCell>
                <TableCell className="text-right">
                  {assignment.testCount > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-sm">
                        {assignment.totalTestQuantity.toFixed(3)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({assignment.testCount} test
                        {assignment.testCount !== 1 ? "s" : ""})
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {assignment.totalAmount?.toFixed(2) || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {assignment.status === "OPEN" ? (
                    <Button
                      size="sm"
                      onClick={() => handleCloseNozzle(assignment)}
                    >
                      <Lock className="mr-1 h-3 w-3" />
                      Close
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Closed at{" "}
                      {assignment.endTime
                        ? format(new Date(assignment.endTime), "p")
                        : "-"}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Close Nozzle Sheet */}
      <Sheet
        open={!!selectedAssignment}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAssignment(null);
            setClosingBalance("");
            setError(null);
          }
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Close Nozzle</SheetTitle>
            <SheetDescription>
              Enter the closing meter reading for{" "}
              {selectedAssignment?.nozzleName}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmitClose} className="mt-6 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nozzle:</span>
                <span className="font-medium">
                  {selectedAssignment?.nozzleName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Product:</span>
                <span className="font-medium">
                  {selectedAssignment?.productName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Opening Balance:
                </span>
                <span className="font-mono font-medium">
                  {selectedAssignment?.openingBalance.toFixed(3)} L
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingBalance">
                Closing Balance (Liters) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="closingBalance"
                type="number"
                step="0.001"
                placeholder="0.000"
                value={closingBalance}
                onChange={(e) => setClosingBalance(e.target.value)}
                disabled={isClosing}
                className="text-base font-mono"
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Must be greater than or equal to opening balance
              </p>
            </div>

            {closingBalance && !isNaN(parseFloat(closingBalance)) && (
              <div className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    Calculated Dispensed:
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {(
                      parseFloat(closingBalance) -
                      (selectedAssignment?.openingBalance || 0)
                    ).toFixed(3)}{" "}
                    L
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedAssignment(null);
                  setClosingBalance("");
                  setError(null);
                }}
                disabled={isClosing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isClosing} className="flex-1">
                {isClosing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Closing...
                  </>
                ) : (
                  "Close Nozzle"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
