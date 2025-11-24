import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Receipt,
  Wallet,
  DollarSign,
  Eye,
  Lock,
  AlertCircle,
  FlaskConical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShiftStore } from "@/store/shifts/shift-store";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShiftActionsCardProps {
  shiftId: string;
  onActionComplete?: () => void;
  onViewDetails?: () => void;
}

export function ShiftActionsCard({
  shiftId,
  onActionComplete,
  onViewDetails,
}: ShiftActionsCardProps) {
  const navigate = useNavigate();
  const { closeShift } = useShiftStore();
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseShift = async () => {
    setIsClosing(true);
    try {
      await closeShift(shiftId);
      toast.success("Shift closed successfully!");
      setShowCloseDialog(false);
      onActionComplete?.();
      // Navigate to shifts list or accounting page
      navigate("/shifts");
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to close shift";
      toast.error(errorMessage);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage bills, payments, expenses and close your shift
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate(`/shifts/${shiftId}/bills`)}
            >
              <Receipt className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Create Bill</div>
                <div className="text-xs text-muted-foreground">
                  Issue credit sale
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate(`/shifts/${shiftId}/payments`)}
            >
              <Wallet className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <div className="font-semibold">Receive Payment</div>
                <div className="text-xs text-muted-foreground">
                  From customers
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate(`/shifts/${shiftId}/expenses`)}
            >
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div className="text-left">
                <div className="font-semibold">Add Expense</div>
                <div className="text-xs text-muted-foreground">
                  Record expense
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={() => navigate(`/shifts/${shiftId}?tab=tests`)}
            >
              <FlaskConical className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <div className="font-semibold">Test Nozzle</div>
                <div className="text-xs text-muted-foreground">
                  Record test reading
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
              onClick={onViewDetails}
            >
              <Eye className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold">View Details</div>
                <div className="text-xs text-muted-foreground">
                  Full shift info
                </div>
              </div>
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowCloseDialog(true)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Close Shift
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              All nozzles must be closed before ending the shift
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Close Shift Confirmation Sheet */}
      <Sheet open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Close Shift?
            </SheetTitle>
            <SheetDescription>
              Make sure all nozzles are closed before proceeding.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p>
                  Are you sure you want to close this shift? All nozzles must be
                  closed before ending the shift.
                </p>
                <p className="font-medium mt-2">
                  After closing, you'll need to complete accounting for this
                  shift.
                </p>
              </AlertDescription>
            </Alert>
          </div>

          <SheetFooter className="mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCloseDialog(false)}
              disabled={isClosing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCloseShift}
              disabled={isClosing}
              className="flex-1"
            >
              {isClosing ? "Closing..." : "Close Shift"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
