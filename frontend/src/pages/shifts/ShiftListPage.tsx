import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { StartShiftForm } from "./components/StartShiftForm";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  Calendar,
  Search,
  RefreshCw,
  Clock,
  User,
  Plus,
} from "lucide-react";
import { format, subDays } from "date-fns";

export function ShiftListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shifts, fetchShifts, isLoading } = useShiftStore();

  // Date filters - default to yesterday and today
  const [startDate, setStartDate] = useState<string>(
    format(subDays(new Date(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  // Other filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">(
    "ALL"
  );

  // Start shift sheet state
  const [isStartShiftOpen, setIsStartShiftOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  const loadShifts = async () => {
    try {
      const filters: Record<string, string> = {
        fromDate: startDate,
        toDate: endDate,
      };

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

  useEffect(() => {
    loadShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    loadShifts();
  };

  const handleReset = () => {
    setStartDate(format(subDays(new Date(), 1), "yyyy-MM-dd"));
    setEndDate(format(new Date(), "yyyy-MM-dd"));
    setSearchQuery("");
    setStatusFilter("ALL");
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

  const handleShiftCreated = () => {
    setIsStartShiftOpen(false);
    loadShifts(); // Reload the shifts list
    toast.success("Shift started successfully!");
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
            Filters
          </CardTitle>
          <CardDescription>
            Filter shifts by date range and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${
              isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"
            } gap-4`}
          >
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-base"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
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

            {/* Search - Only for Admin/Manager */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Salesman name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-base"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/shifts/${shift.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
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
    </div>
  );
}
