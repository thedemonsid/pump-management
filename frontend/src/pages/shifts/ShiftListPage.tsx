import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useShiftStore } from "@/store/shifts/shift-store";
import { SalesmanShiftService } from "@/services/salesman-shift-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { StartShiftForm } from "./components/StartShiftForm";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  Calendar,
  CalendarIcon,
  Search,
  RefreshCw,
  Clock,
  User,
  Plus,
  Trash2,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

// Helper functions for default dates
const getYesterday = () => subDays(new Date(), 1);
const getToday = () => new Date();

export function ShiftListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shifts, fetchShifts, isLoading } = useShiftStore();

  // Date filters - using Date objects as per guide
  const [startDate, setStartDate] = useState<Date | undefined>(getYesterday());
  const [endDate, setEndDate] = useState<Date | undefined>(getToday());
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  // Other filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">(
    "ALL"
  );

  // Start shift sheet state
  const [isStartShiftOpen, setIsStartShiftOpen] = useState(false);

  // Delete confirmation state
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  const loadShifts = async () => {
    try {
      const filters: Record<string, string> = {};

      // Format dates as YYYY-MM-DD for API
      if (startDate) {
        filters.fromDate = format(startDate, "yyyy-MM-dd");
      }
      if (endDate) {
        filters.toDate = format(endDate, "yyyy-MM-dd");
      }

      // For non-admin users, filter by salesman (use userId as salesmanId)
      if (!isAdmin && user?.userId) {
        filters.salesmanId = user.userId;
      }

      if (statusFilter !== "ALL") {
        filters.status = statusFilter;
      }

      await fetchShifts(filters);
    } catch (err) {
      toast.error("Failed to load shifts");
      console.error(err);
    }
  };

  // Fetch data when dates or filters change
  useEffect(() => {
    loadShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, statusFilter]);

  const handleReset = () => {
    setStartDate(getYesterday());
    setEndDate(getToday());
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  const handleShiftCreated = () => {
    setIsStartShiftOpen(false);
    loadShifts();
    toast.success("Shift started successfully!");
  };

  const handleDeleteShift = async () => {
    if (!shiftToDelete) return;

    setIsDeleting(true);
    try {
      await SalesmanShiftService.deleteShift(shiftToDelete);
      toast.success("Shift deleted successfully!");
      setShiftToDelete(null);
      loadShifts();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete shift";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter shifts by search query (client-side)
  const filteredShifts = shifts.filter((shift) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      shift.salesmanUsername?.toLowerCase().includes(query) ||
      shift.id.toLowerCase().includes(query)
    );
  });

  const calculateDuration = (start: string, end?: string): string => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const hours = Math.round((endTime - startTime) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isAdmin ? "All Shifts" : "My Shifts"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "View and manage all salesman shifts"
              : "View your shift history"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsStartShiftOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Start New Shift
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter by Date Range
          </CardTitle>
          <CardDescription>
            Select date range and filter shifts by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Date Pickers Row */}
            <div className="flex flex-wrap items-end gap-4">
              {/* Start Date */}
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm font-medium mb-2 block">
                  Start Date
                </Label>
                <Popover
                  open={isStartDateOpen}
                  onOpenChange={setIsStartDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setIsStartDateOpen(false);
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm font-medium mb-2 block">
                  End Date
                </Label>
                <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setIsEndDateOpen(false);
                      }}
                      disabled={(date) => {
                        if (date > new Date()) return true;
                        if (startDate && date < startDate) return true;
                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status Filter */}
              <div className="flex-1 min-w-[200px]">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium mb-2 block"
                >
                  Status
                </Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "ALL" | "OPEN" | "CLOSED")
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="ALL">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
            </div>

            {/* Search - Only for Admin/Manager */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by salesman name or shift ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-base"
                  />
                </div>
              </div>
            )}

            {/* Active Filter Summary */}
            {(startDate || endDate) && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredShifts.length} shift(s)
                {startDate && ` from ${format(startDate, "PPP")}`}
                {endDate && ` to ${format(endDate, "PPP")}`}
                {statusFilter !== "ALL" && ` with status: ${statusFilter}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shifts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shifts</CardTitle>
              <CardDescription>
                {filteredShifts.length} shift(s) found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No shifts found matching your criteria
              </p>
              <Button onClick={handleReset} variant="outline" className="mt-4">
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && <TableHead>Salesman</TableHead>}
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Opening Cash</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accounting</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {shift.salesmanUsername}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {format(new Date(shift.startDatetime), "PPp")}
                      </TableCell>
                      <TableCell>
                        {shift.endDatetime
                          ? format(new Date(shift.endDatetime), "PPp")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {calculateDuration(
                            shift.startDatetime,
                            shift.endDatetime
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{shift.openingCash.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            shift.status === "OPEN" ? "default" : "secondary"
                          }
                        >
                          {shift.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            shift.isAccountingDone ? "default" : "outline"
                          }
                          className={
                            shift.isAccountingDone
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "border-orange-500 text-orange-600"
                          }
                        >
                          {shift.isAccountingDone ? "Done" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/shifts/${shift.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          {isAdmin && shift.status === "OPEN" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShiftToDelete(shift.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Shift Sheet */}
      {isAdmin && (
        <Sheet open={isStartShiftOpen} onOpenChange={setIsStartShiftOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-xl overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Start New Shift</SheetTitle>
              <SheetDescription>
                Select a salesman and nozzles to start a new shift
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <StartShiftForm
                onSuccess={handleShiftCreated}
                onCancel={() => setIsStartShiftOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!shiftToDelete}
        onOpenChange={(open) => !open && setShiftToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shift? This action cannot be
              undone.
              <br />
              <br />
              <strong>Note:</strong> You can only delete open shifts that have:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>No closed nozzle assignments</li>
                <li>No nozzle tests</li>
                <li>No bills</li>
                <li>No payments</li>
                <li>No expenses</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteShift}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
