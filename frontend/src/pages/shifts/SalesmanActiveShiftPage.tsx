import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useShiftStore } from "@/store/shifts/shift-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Plus, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { StartShiftForm } from "./components/StartShiftForm";
import { NozzleAssignmentsTable } from "./components/NozzleAssignmentsTable";
import { ShiftActionsCard } from "./components/ShiftActionsCard";
import { useNavigate } from "react-router-dom";

/**
 * SalesmanActiveShiftPage - Main workspace for salesmen
 * Shows current active shift or allows starting a new one
 */
export function SalesmanActiveShiftPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeShift, isLoading, fetchActiveShift } = useShiftStore();
  const [isStartShiftOpen, setIsStartShiftOpen] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchActiveShift(user.userId);
    }
  }, [user?.userId, fetchActiveShift]);

  const handleShiftStarted = () => {
    setIsStartShiftOpen(false);
    if (user?.userId) {
      fetchActiveShift(user.userId);
    }
    toast.success("Shift started successfully!");
  };

  const handleRefresh = () => {
    if (user?.userId) {
      fetchActiveShift(user.userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No active shift - show start shift option
  if (!activeShift) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="border-dashed">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">No Active Shift</CardTitle>
              <CardDescription className="mt-2">
                You don't have an active shift. Start a new shift to begin
                working.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button size="lg" onClick={() => setIsStartShiftOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Start New Shift
            </Button>
          </CardContent>
        </Card>

        {/* Start Shift Sheet */}
        <Sheet open={isStartShiftOpen} onOpenChange={setIsStartShiftOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-2xl overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Start New Shift</SheetTitle>
              <SheetDescription>
                Select nozzles and enter opening cash to start your shift. Date
                and time will be recorded automatically.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <StartShiftForm
                salesmanId={user?.userId || ""}
                onSuccess={handleShiftStarted}
                onCancel={() => setIsStartShiftOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Active shift exists - show shift workspace
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Shift Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">Active Shift</CardTitle>
                <Badge variant="default" className="bg-green-600">
                  OPEN
                </Badge>
              </div>
              <CardDescription>
                Started at {format(new Date(activeShift.startDatetime), "PPp")}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opening Cash</p>
                <p className="text-lg font-semibold">
                  ₹{activeShift.openingCash.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">
                  {Math.floor(
                    (Date.now() -
                      new Date(activeShift.startDatetime).getTime()) /
                      (1000 * 60 * 60)
                  )}{" "}
                  hours
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-orange-500/10">
                <span className="text-lg font-bold text-orange-600">N</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nozzles</p>
                <p className="text-lg font-semibold">
                  {activeShift.nozzleCount || 0} assigned
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nozzle Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Nozzle Assignments</CardTitle>
          <CardDescription>
            Manage your assigned nozzles. Close them when you're done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NozzleAssignmentsTable
            shiftId={activeShift.id}
            onNozzleClosed={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <ShiftActionsCard
        shiftId={activeShift.id}
        onActionComplete={handleRefresh}
        onViewDetails={() => navigate(`/shifts/${activeShift.id}`)}
      />
    </div>
  );
}
