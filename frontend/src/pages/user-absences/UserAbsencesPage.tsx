import { useEffect, useState } from "react";
import { useUserAbsenceStore } from "@/store/user-absence-store";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ReactSelect from "react-select";
import { SalesmanService } from "@/services/salesman-service";
import { ManagerService } from "@/services/manager-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle,
  Clock,
  Filter,
  X,
  CalendarIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { CreateAbsenceForm } from "./CreateAbsenceForm";
import { UpdateAbsenceForm } from "./UpdateAbsenceForm";
import type { UserAbsence } from "@/types";

interface UserOption {
  value: string;
  label: string;
  role: string;
}

export function UserAbsencesPage() {
  const { user } = useAuth();
  const { absences, loading, error, fetchAbsencesByDateRange, removeAbsence } =
    useUserAbsenceStore();

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<UserAbsence | null>(
    null
  );
  const [deletingAbsence, setDeletingAbsence] = useState<UserAbsence | null>(
    null
  );

  // Single date filter for checking absences on a specific day - default to today
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Other filters
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [absenceTypeFilter, setAbsenceTypeFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  // Check if user has permission to manage absences
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const canManageAbsences = isAdmin || isManager;

  useEffect(() => {
    if (canManageAbsences) {
      fetchUsers();
    }
  }, [canManageAbsences]);

  // Fetch absences whenever the selected date changes
  useEffect(() => {
    if (canManageAbsences && selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      fetchAbsencesByDateRange(dateStr, dateStr);
    }
  }, [canManageAbsences, selectedDate, fetchAbsencesByDateRange]);

  const fetchUsers = async () => {
    try {
      const [salesmen, managers] = await Promise.all([
        SalesmanService.getAll(),
        ManagerService.getAll(),
      ]);

      const salesmanOptions: UserOption[] = salesmen.map((s) => ({
        value: s.id!,
        label: `${s.username} (${s.mobileNumber})`,
        role: "SALESMAN",
      }));

      const managerOptions: UserOption[] = managers.map((m) => ({
        value: m.id!,
        label: `${m.username} (${m.mobileNumber})`,
        role: "MANAGER",
      }));

      setUserOptions([...salesmanOptions, ...managerOptions]);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const handleDelete = (absence: UserAbsence) => {
    setDeletingAbsence(absence);
  };

  const confirmDelete = async () => {
    if (deletingAbsence) {
      try {
        await removeAbsence(deletingAbsence.id!);
        setDeletingAbsence(null);
      } catch (error) {
        console.error("Failed to delete absence:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingAbsence(null);
    setIsEditSheetOpen(false);
  };

  const handleSuccessEdit = () => {
    setEditingAbsence(null);
    setIsEditSheetOpen(false);
    // Refetch data for the selected date
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      fetchAbsencesByDateRange(dateStr, dateStr);
    }
  };

  const handleSuccessCreate = () => {
    setIsCreateSheetOpen(false);
    // Refetch data for the selected date
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      fetchAbsencesByDateRange(dateStr, dateStr);
    }
  };

  const handleEdit = (absence: UserAbsence) => {
    setEditingAbsence(absence);
    setIsEditSheetOpen(true);
  };

  const clearFilters = () => {
    setSelectedDate(new Date()); // Reset to today instead of undefined
    setApprovalFilter("all");
    setAbsenceTypeFilter("all");
    setSelectedUser(null);
  };

  if (!canManageAbsences) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to manage absences. Only ADMIN and MANAGER
            roles can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading && absences.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading absences...</span>
      </div>
    );
  }

  // Apply filters (date filter is already applied at backend level)
  let filteredAbsences = [...absences];

  // Approval filter
  if (approvalFilter === "approved") {
    filteredAbsences = filteredAbsences.filter(
      (absence) => absence.isApproved === true
    );
  } else if (approvalFilter === "pending") {
    filteredAbsences = filteredAbsences.filter(
      (absence) => absence.isApproved === false
    );
  }

  // Absence type filter
  if (absenceTypeFilter !== "all") {
    filteredAbsences = filteredAbsences.filter(
      (absence) => absence.absenceType === absenceTypeFilter
    );
  }

  // User filter
  if (selectedUser) {
    filteredAbsences = filteredAbsences.filter(
      (absence) => absence.userId === selectedUser.value
    );
  }

  // Sort absences by date (most recent first)
  const sortedAbsences = filteredAbsences.sort(
    (a, b) =>
      new Date(b.absenceDate).getTime() - new Date(a.absenceDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Absences</h1>
          <p className="text-muted-foreground">
            Track and manage employee absences
          </p>
        </div>
        <Button onClick={() => setIsCreateSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Absence
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>
                Filter absences by date range, user, or approval status
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Reset to Default
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Single Date Picker */}
            <div className="space-y-2">
              <Label>Absence Date</Label>
              <Popover
                open={isDatePickerOpen}
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "All dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsDatePickerOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* User Filter */}
            <div className="space-y-2">
              <Label htmlFor="userFilter">User</Label>
              <ReactSelect
                id="userFilter"
                options={userOptions}
                value={selectedUser}
                onChange={setSelectedUser}
                isClearable
                placeholder="All users..."
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
              />
            </div>

            {/* Approval Status */}
            <div className="space-y-2">
              <Label htmlFor="approvalFilter">Status</Label>
              <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                <SelectTrigger id="approvalFilter">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Absence Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="absenceTypeFilter">Absence Type</Label>
              <Select
                value={absenceTypeFilter}
                onValueChange={setAbsenceTypeFilter}
              >
                <SelectTrigger id="absenceTypeFilter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="FULL_DAY">Full Day</SelectItem>
                  <SelectItem value="HALF_DAY">Half Day</SelectItem>
                  <SelectItem value="OVERTIME">Overtime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Absence Records List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Absence Records
            {(selectedDate || approvalFilter !== "all" || selectedUser) && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({sortedAbsences.length} filtered)
              </span>
            )}
          </CardTitle>
          <CardDescription>
            View and manage all absence records
            {selectedDate && (
              <span className="block mt-1">
                Showing {sortedAbsences.length} records for{" "}
                {format(selectedDate, "PPP")}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedAbsences.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {absences.length === 0
                  ? "No absence records found. Record your first absence to get started."
                  : "No absences match the selected filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAbsences.map((absence) => (
                    <TableRow key={absence.id}>
                      <TableCell className="font-medium">
                        {new Date(absence.absenceDate).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell>{absence.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{absence.userRole}</Badge>
                      </TableCell>
                      <TableCell>
                        {absence.absenceType === "FULL_DAY" && (
                          <Badge className="bg-blue-500">Full Day</Badge>
                        )}
                        {absence.absenceType === "HALF_DAY" && (
                          <Badge className="bg-yellow-500">Half Day</Badge>
                        )}
                        {absence.absenceType === "OVERTIME" && (
                          <Badge className="bg-green-500">Overtime</Badge>
                        )}
                        {!absence.absenceType && (
                          <Badge variant="outline">Full Day</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {absence.reason ? (
                          <span
                            className="max-w-[200px] truncate inline-block"
                            title={absence.reason}
                          >
                            {absence.reason}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {absence.isApproved ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-500"
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {absence.approvedBy || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(absence)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(absence)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAbsence}
        onOpenChange={() => setDeletingAbsence(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the absence record for{" "}
              <strong>{deletingAbsence?.username}</strong> on{" "}
              <strong>
                {deletingAbsence &&
                  new Date(deletingAbsence.absenceDate).toLocaleDateString()}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Absence Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record New Absence</SheetTitle>
            <SheetDescription>
              Record an absence for a salesman or manager. Fill in all required
              fields.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CreateAbsenceForm
              onSuccess={handleSuccessCreate}
              onCancel={() => setIsCreateSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Absence Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Absence Record</SheetTitle>
            <SheetDescription>
              Update the absence details and approval status.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {editingAbsence && (
              <UpdateAbsenceForm
                absence={editingAbsence}
                onSuccess={handleSuccessEdit}
                onCancel={handleCancelEdit}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
