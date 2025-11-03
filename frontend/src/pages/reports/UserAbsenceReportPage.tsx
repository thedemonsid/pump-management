import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  FileText,
  Loader2,
  Download,
  UserX,
  Calendar as CalendarCheck,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserAbsenceService } from "@/services/user-absence-service";
import { SalesmanService } from "@/services/salesman-service";
import { ManagerService } from "@/services/manager-service";
import type { UserAbsence } from "@/types";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { UserAbsenceReportPDF } from "@/components/pdf-reports/UserAbsenceReportPDF";

interface EmployeeAbsenceCount {
  userId: string;
  username: string;
  userRole: string;
  mobileNumber?: string;
  absenceCount: number;
  absences: UserAbsence[];
}

interface Employee {
  id: string;
  username: string;
  role: string;
  mobileNumber?: string;
}

export function UserAbsenceReportPage() {
  const [fromDate, setFromDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [absences, setAbsences] = useState<UserAbsence[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    if (fromDate > toDate) {
      toast.error("From date cannot be after to date");
      return;
    }

    setLoading(true);
    try {
      // Fetch absences and all employees in parallel
      const [absenceData, salesmen, managers] = await Promise.all([
        UserAbsenceService.getByDateRange(
          format(fromDate, "yyyy-MM-dd"),
          format(toDate, "yyyy-MM-dd")
        ),
        SalesmanService.getAll(),
        ManagerService.getAll(),
      ]);

      // Map employees to a common structure
      const employees: Employee[] = [
        ...salesmen.map((s) => ({
          id: s.id!,
          username: s.username,
          role: "SALESMAN",
          mobileNumber: s.mobileNumber,
        })),
        ...managers.map((m) => ({
          id: m.id!,
          username: m.username,
          role: "MANAGER",
          mobileNumber: m.mobileNumber,
        })),
      ];

      setAbsences(absenceData);
      setAllEmployees(employees);
      setHasSearched(true);
      toast.success(
        `Found ${absenceData.length} absence records for ${employees.length} employees`
      );
    } catch (error) {
      console.error("Failed to fetch absences:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await pdf(
        <UserAbsenceReportPDF
          sortedByDate={sortedByDate}
          employeeAbsenceCounts={employeeAbsenceCounts}
          fromDate={format(fromDate!, "yyyy-MM-dd")}
          toDate={format(toDate!, "yyyy-MM-dd")}
          totalAbsences={absences.length}
          totalEmployees={employeeAbsenceCounts.length}
          employeesWithAbsences={
            employeeAbsenceCounts.filter((e) => e.absenceCount > 0).length
          }
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `user-absence-report-${format(
        fromDate!,
        "yyyy-MM-dd"
      )}-to-${format(toDate!, "yyyy-MM-dd")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  // Sort absences by date (earliest first)
  const sortedByDate = [...absences].sort(
    (a, b) =>
      new Date(a.absenceDate).getTime() - new Date(b.absenceDate).getTime()
  );

  // Group absences by employee and include ALL employees (even with 0 absences)
  const employeeAbsenceCounts: EmployeeAbsenceCount[] = allEmployees
    .map((employee) => {
      // Find all absences for this employee
      const employeeAbsences = absences.filter(
        (absence) => absence.userId === employee.id
      );

      return {
        userId: employee.id,
        username: employee.username,
        userRole: employee.role,
        mobileNumber: employee.mobileNumber,
        absenceCount: employeeAbsences.length,
        absences: employeeAbsences,
      };
    })
    .sort((a, b) => b.absenceCount - a.absenceCount); // Sort by count descending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            User Absence Report
          </h1>
          <p className="text-muted-foreground">
            View detailed absence records by date range
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date Range
          </CardTitle>
          <CardDescription>
            Choose the date range to generate the absence report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* From Date */}
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      setFromDate(date);
                      setIsFromDateOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      setIsToDateOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateReport}
              disabled={loading || !fromDate || !toDate}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {hasSearched && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Absences
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{absences.length}</div>
              <p className="text-xs text-muted-foreground">
                In selected date range
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employeeAbsenceCounts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {employeeAbsenceCounts.filter((e) => e.absenceCount > 0).length}{" "}
                had absences
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Date Range</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {fromDate && toDate
                  ? `${format(fromDate, "MMM dd")} - ${format(
                      toDate,
                      "MMM dd, yyyy"
                    )}`
                  : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {fromDate && toDate
                  ? `${
                      Math.ceil(
                        (toDate.getTime() - fromDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1
                    } days`
                  : ""}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Date-wise Detailed List */}
      {hasSearched && sortedByDate.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Date-wise Absence Details</CardTitle>
                <CardDescription>
                  Complete list of absences sorted by date (
                  {format(fromDate!, "MMM dd, yyyy")} to{" "}
                  {format(toDate!, "MMM dd, yyyy")})
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedByDate.map((absence) => (
                    <TableRow key={absence.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(absence.absenceDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {absence.username}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{absence.userRole}</Badge>
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
                        {absence.notes ? (
                          <span
                            className="max-w-[200px] truncate inline-block"
                            title={absence.notes}
                          >
                            {absence.notes}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {absence.isApproved ? (
                          <Badge className="bg-green-500">Approved</Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-500/20 text-yellow-700"
                          >
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {absence.approvedBy || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee-wise Absence Count */}
      {hasSearched && employeeAbsenceCounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Employee-wise Absence Summary</CardTitle>
            <CardDescription>
              Total absences per employee (sorted by count)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">
                      Total Absences
                    </TableHead>
                    <TableHead>Dates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeAbsenceCounts.map((employee, index) => (
                    <TableRow key={employee.userId}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {employee.username}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.userRole}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.absenceCount === 0 ? (
                          <Badge className="bg-green-500">0 days</Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-500/20 text-red-700 dark:text-red-400"
                          >
                            {employee.absenceCount} days
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[400px]">
                          {employee.absenceCount === 0 ? (
                            <span className="text-xs text-muted-foreground italic">
                              No absences
                            </span>
                          ) : (
                            employee.absences
                              .sort(
                                (a, b) =>
                                  new Date(a.absenceDate).getTime() -
                                  new Date(b.absenceDate).getTime()
                              )
                              .map((absence) => (
                                <span
                                  key={absence.id}
                                  className="text-xs bg-muted px-2 py-1 rounded"
                                  title={`${format(
                                    parseISO(absence.absenceDate),
                                    "MMM dd, yyyy"
                                  )}${
                                    absence.reason ? ` - ${absence.reason}` : ""
                                  }`}
                                >
                                  {format(
                                    parseISO(absence.absenceDate),
                                    "MMM dd"
                                  )}
                                </span>
                              ))
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {hasSearched && absences.length === 0 && (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No absences found</h3>
              <p className="text-muted-foreground mt-2">
                No absence records were found for the selected date range.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
