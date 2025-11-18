import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Filter, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DipReadingService, TankService } from "@/services";
import type { DipReading, Tank } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { DipReadingPDF } from "@/components/pdf-reports";

const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};

const getVarianceBadge = (variance: number | undefined) => {
  if (variance === undefined || variance === null)
    return <span className="text-muted-foreground">N/A</span>;

  const absVariance = Math.abs(variance);
  if (absVariance < 10) {
    return (
      <Badge variant="secondary" className="gap-1">
        {variance > 0 && <TrendingUp className="h-3 w-3" />}
        {variance < 0 && <TrendingDown className="h-3 w-3" />}
        {formatNumber(variance)} L
      </Badge>
    );
  } else if (absVariance < 50) {
    return (
      <Badge
        variant="outline"
        className="border-yellow-500 text-yellow-600 gap-1"
      >
        {variance > 0 && <TrendingUp className="h-3 w-3" />}
        {variance < 0 && <TrendingDown className="h-3 w-3" />}
        {formatNumber(variance)} L
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive" className="gap-1">
        {variance > 0 && <TrendingUp className="h-3 w-3" />}
        {variance < 0 && <TrendingDown className="h-3 w-3" />}
        {formatNumber(variance)} L
      </Badge>
    );
  }
};

// Define columns in the same file
const getDipReadingReportColumns = (): ColumnDef<DipReading>[] => [
  {
    accessorKey: "readingTimestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.readingTimestamp);
      return (
        <div>
          <div className="font-medium">{format(date, "PPP")}</div>
          <div className="text-xs text-muted-foreground">
            {format(date, "p")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "dipLevel",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dip Level (mm)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatNumber(row.original.dipLevel),
  },
  {
    accessorKey: "temperature",
    header: "Temperature (°C)",
    cell: ({ row }) => formatNumber(row.original.temperature),
  },
  {
    accessorKey: "density",
    header: "Density (kg/m³)",
    cell: ({ row }) => formatNumber(row.original.density),
  },
  {
    accessorKey: "fuelLevelLitres",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Physical Level (L)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {formatNumber(row.original.fuelLevelLitres)}
      </div>
    ),
  },
  {
    accessorKey: "fuelLevelSystem",
    header: "System Level (L)",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {formatNumber(row.original.fuelLevelSystem)}
      </div>
    ),
  },
  {
    accessorKey: "variance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Variance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => getVarianceBadge(row.original.variance),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => {
      const remarks = row.original.remarks;
      if (!remarks)
        return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="max-w-[200px] truncate text-sm" title={remarks}>
          {remarks}
        </div>
      );
    },
  },
];

export default function DipReadingReportPage() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [selectedTankId, setSelectedTankId] = useState<string>("");
  const [readings, setReadings] = useState<DipReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [tanksLoading, setTanksLoading] = useState(false);

  // Date range state
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    date.setHours(0, 0, 0, 0); // Start of day
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999); // End of day
    return date;
  });

  // Fetch tanks on mount
  useEffect(() => {
    const fetchTanks = async () => {
      setTanksLoading(true);
      try {
        const data = await TankService.getAll();
        setTanks(data);
        if (data.length > 0 && !selectedTankId) {
          setSelectedTankId(data[0].id!);
        }
      } catch (error) {
        console.error("Failed to fetch tanks:", error);
        toast.error("Failed to fetch tanks");
      } finally {
        setTanksLoading(false);
      }
    };

    fetchTanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch readings when tank or date range changes
  const fetchReadings = async () => {
    if (!selectedTankId) return;

    setLoading(true);
    try {
      const data = await DipReadingService.getByTankId(selectedTankId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setReadings(data);
    } catch (error) {
      console.error("Failed to fetch dip readings:", error);
      toast.error("Failed to fetch dip readings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTankId) {
      fetchReadings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTankId, startDate, endDate]);

  const handleDownload = async () => {
    if (!selectedTank) {
      toast.error("Please select a tank");
      return;
    }

    if (readings.length === 0) {
      toast.error("No data to download");
      return;
    }

    try {
      toast.loading("Generating PDF...");
      const blob = await pdf(
        <DipReadingPDF
          tankName={selectedTank.tankName}
          productName={selectedTank.product?.productName || "N/A"}
          tankCapacity={selectedTank.capacity || 0}
          currentLevel={selectedTank.currentLevel}
          data={readings}
          fromDate={startDate.toISOString()}
          toDate={endDate.toISOString()}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dip-reading-report-${selectedTank.tankName}-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const columns = getDipReadingReportColumns();

  const selectedTank = tanks.find((t) => t.id === selectedTankId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Dip Reading Report
          </h1>
          <p className="text-muted-foreground">
            View tank dip readings with date filters
          </p>
        </div>
        <Button
          onClick={handleDownload}
          disabled={!selectedTank || readings.length === 0 || loading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Select tank and date range to view dip readings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tank Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tank</label>
              <Select
                value={selectedTankId}
                onValueChange={setSelectedTankId}
                disabled={tanksLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tank" />
                </SelectTrigger>
                <SelectContent>
                  {tanks.map((tank) => (
                    <SelectItem key={tank.id} value={tank.id!}>
                      {tank.tankName} - {tank.product?.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        date.setHours(0, 0, 0, 0); // Start of day
                        setStartDate(date);
                      }
                    }}
                    disabled={(date) => date > endDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        date.setHours(23, 59, 59, 999); // End of day
                        setEndDate(date);
                      }
                    }}
                    disabled={(date) => date < startDate || date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Tank Info */}
      {selectedTank && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tank Name</p>
                <p className="text-lg font-semibold">{selectedTank.tankName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="text-lg font-semibold">
                  {selectedTank.product?.productName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="text-lg font-semibold">
                  {formatNumber(selectedTank.capacity)} L
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-lg font-semibold">
                  {formatNumber(selectedTank.currentLevel)} L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Readings List */}
      <Card>
        <CardHeader>
          <CardTitle>Dip Readings</CardTitle>
          <CardDescription>
            Showing {readings.length} reading(s) from {format(startDate, "PPP")}{" "}
            to {format(endDate, "PPP")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading dip readings...</span>
              </div>
            </div>
          ) : readings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-lg font-semibold mb-2">
                No Dip Readings Found
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedTankId
                  ? "No readings found for the selected date range"
                  : "Please select a tank to view dip readings"}
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={readings}
              searchKey="remarks"
              searchPlaceholder="Search remarks..."
              pageSize={10}
              enableRowSelection={false}
              enableColumnVisibility={true}
              enablePagination={true}
              enableSorting={true}
              enableFiltering={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
