import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Search,
  Calendar as CalendarIcon,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useTankStore } from "@/store/tank-store";
import { useTankLedgerStore } from "@/store/tank-ledger-store";

export default function TankLevelReportPage() {
  const navigate = useNavigate();
  const { tanks, fetchTanks } = useTankStore();
  const { ledgerData, summary, loading, hasSearched, computeLedgerData } =
    useTankLedgerStore();

  const [fromDate, setFromDate] = useState<string>(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "yyyy-MM-dd"
    )
  );
  const [toDate, setToDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedTank, setSelectedTank] = useState<string>("");

  useEffect(() => {
    if (tanks.length === 0) {
      fetchTanks();
    }
  }, [tanks.length, fetchTanks]);

  useEffect(() => {
    if (tanks.length > 0 && !selectedTank && tanks[0].id) {
      setSelectedTank(tanks[0].id);
    }
  }, [tanks, selectedTank]);

  const selectedTankData = tanks.find((tank) => tank.id === selectedTank);

  const fetchReport = () => {
    if (!selectedTank || !selectedTankData) return;

    computeLedgerData({
      tankId: selectedTank,
      fromDate,
      toDate,
      openingLevel: selectedTankData.openingLevel || 0,
    });
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Downloading tank level report...");
  };

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(volume);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/reports")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            Tank Level Report
          </h2>
          <p className="text-muted-foreground">
            Monitor fuel tank levels and inventory status
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {hasSearched
              ? `Tank Level Report For Date Between ${formatDate(
                  fromDate
                )} to ${formatDate(toDate)}`
              : "APPLY FILTER"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date*</Label>
              <div className="relative">
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate">To Date*</Label>
              <div className="relative">
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tank">Select Tank*</Label>
              <Select value={selectedTank} onValueChange={setSelectedTank}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tank" />
                </SelectTrigger>
                <SelectContent>
                  {tanks.map((tank) => (
                    <SelectItem key={tank.id} value={tank.id || ""}>
                      {tank.tankName} - {tank.product?.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={fetchReport} disabled={loading || !selectedTank}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Loading..." : "Get Report"}
            </Button>
            {hasSearched && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Tank Level Statement - {selectedTankData?.tankName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Opening Level */}
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Opening Level:</span>
                <span className="text-blue-600">
                  {formatVolume(summary.levelBefore)} L
                </span>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="font-bold">Details</TableHead>
                    <TableHead className="font-bold text-right">
                      Addition (L)
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Removal (L)
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Level (L)
                    </TableHead>
                    <TableHead className="font-bold">Entry By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerData.map((entry, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            entry.type === "addition"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {entry.type === "addition" ? "Addition" : "Removal"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md">
                        {entry.description}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {entry.type === "addition"
                          ? formatVolume(entry.volume)
                          : ""}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {entry.type === "removal"
                          ? formatVolume(entry.volume)
                          : ""}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatVolume(entry.level)}
                      </TableCell>
                      <TableCell>{entry.entryBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-end items-center text-lg font-bold">
                <span className="mr-8">
                  Total Additions:{" "}
                  <span className="text-green-600">
                    {formatVolume(summary.totalAdditionsInRange)} L
                  </span>
                </span>
                <span className="mr-8">
                  Total Removals:{" "}
                  <span className="text-red-600">
                    {formatVolume(summary.totalRemovalsInRange)} L
                  </span>
                </span>
                <span>
                  Closing Level:{" "}
                  <span className="text-blue-600">
                    {formatVolume(summary.closingLevel)} L
                  </span>
                </span>
              </div>
            </div>

            {/* Tank Details */}
            {selectedTankData && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Tank Capacity</p>
                  <p className="text-xl font-semibold">
                    {formatVolume(selectedTankData.capacity)} L
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Level</p>
                  <p className="text-xl font-semibold">
                    {formatVolume(summary.closingLevel)} L
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Available Space
                  </p>
                  <p className="text-xl font-semibold">
                    {formatVolume(
                      selectedTankData.capacity - summary.closingLevel
                    )}{" "}
                    L
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
