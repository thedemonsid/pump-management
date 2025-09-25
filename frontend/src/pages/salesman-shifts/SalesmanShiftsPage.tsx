import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSalesmanNozzleShiftStore } from '@/store/salesman-nozzle-shift-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play, Square, Calendar, Loader2, Fuel } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { NozzleService } from '@/services/nozzle-service';
import { SalesmanService } from '@/services/salesman-service';
import type { Nozzle, Salesman } from '@/types';

export function SalesmanShiftsPage() {
  const { user } = useAuth();
  const {
    shifts,
    activeShifts,
    loading,
    error,
    fetchShifts,
    createShift,
    closeShift,
    fetchActiveShifts,
  } = useSalesmanNozzleShiftStore();

  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loadingNozzles, setLoadingNozzles] = useState(false);
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [loadingSalesmen, setLoadingSalesmen] = useState(false);

  // Date filtering
  const [fromDate, setFromDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return format(yesterday, 'yyyy-MM-dd');
  });
  const [toDate, setToDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  // Form states
  const [startForm, setStartForm] = useState({
    nozzleId: '',
    openingBalance: '',
  });

  const [closeForm, setCloseForm] = useState({
    closingBalance: '',
    nextSalesmanId: '',
  });

  // Load nozzles and salesmen for selection
  useEffect(() => {
    const loadNozzles = async () => {
      try {
        setLoadingNozzles(true);
        const nozzleData = await NozzleService.getAllForPump();
        setNozzles(nozzleData);
      } catch (error) {
        console.error('Failed to load nozzles:', error);
      } finally {
        setLoadingNozzles(false);
      }
    };

    const loadSalesmen = async () => {
      try {
        setLoadingSalesmen(true);
        const salesmanData = await SalesmanService.getAll();
        setSalesmen(salesmanData);
      } catch (error) {
        console.error('Failed to load salesmen:', error);
      } finally {
        setLoadingSalesmen(false);
      }
    };

    if (user?.role === 'SALESMAN' && user?.userId) {
      loadNozzles();
      loadSalesmen();
      fetchActiveShifts(user.userId);
    }
  }, [user?.role, user?.userId, fetchActiveShifts]);

  // Load shifts with date filter
  useEffect(() => {
    if (user?.role === 'SALESMAN' && user?.userId) {
      fetchShifts({ fromDate, toDate, salesmanId: user.userId });
    }
  }, [fetchShifts, fromDate, toDate, user?.role, user?.userId]);

  const handleStartShift = async () => {
    if (!user?.userId || !startForm.nozzleId || !startForm.openingBalance)
      return;

    try {
      await createShift({
        salesmanId: user.userId,
        nozzleId: startForm.nozzleId,
        openingBalance: parseFloat(startForm.openingBalance),
      });

      setIsStartDialogOpen(false);
      setStartForm({
        nozzleId: '',
        openingBalance: '',
      });
    } catch {
      // Error is handled in the store
    }
  };

  const handleCloseShift = async (shiftId: string) => {
    if (!closeForm.closingBalance) return;

    try {
      await closeShift(shiftId, {
        closingBalance: parseFloat(closeForm.closingBalance),
        nextSalesmanId: closeForm.nextSalesmanId || undefined,
      });

      setIsCloseDialogOpen(false);
      setSelectedShiftId(null);
      setCloseForm({
        closingBalance: '',
        nextSalesmanId: '',
      });
    } catch {
      // Error is handled in the store
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    return format(new Date(dateTimeStr), 'dd/MM/yyyy HH:mm');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatFuelQuantity = (quantity: number) => {
    return (
      new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(quantity) + ' L'
    );
  };

  const calculateTotalAmount = (shift: {
    totalAmount?: number;
    closingBalance?: number;
    openingBalance: number;
    productPrice?: number;
  }) => {
    if (shift.totalAmount !== undefined) {
      return shift.totalAmount;
    }
    if (shift.closingBalance && shift.openingBalance) {
      const dispensed = shift.closingBalance - shift.openingBalance;
      // Use productPrice if available, otherwise default to ₹100 per liter
      const pricePerLiter = shift.productPrice || 100;
      return dispensed * pricePerLiter;
    }
    return 0;
  };

  if (user?.role !== 'SALESMAN') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to salesmen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile-first header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            My Shifts
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your nozzle shifts and track fuel dispensing
          </p>
        </div>

        {/* Action buttons - stack on mobile */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Play className="mr-2 h-4 w-4" />
                Start Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Start New Shift</DialogTitle>
                <DialogDescription>
                  Begin a new shift by selecting a nozzle and entering opening
                  balance
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nozzle">Nozzle</Label>
                  <Select
                    value={startForm.nozzleId}
                    onValueChange={(value) =>
                      setStartForm({ ...startForm, nozzleId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a nozzle" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingNozzles ? (
                        <SelectItem value="" disabled>
                          Loading nozzles...
                        </SelectItem>
                      ) : (
                        nozzles.map((nozzle) => (
                          <SelectItem key={nozzle.id} value={nozzle.id!}>
                            {nozzle.nozzleName} -{' '}
                            {nozzle.productName || 'No Product'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="opening-balance">
                    Opening Fuel Balance (L)
                  </Label>
                  <Input
                    id="opening-balance"
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={startForm.openingBalance}
                    onChange={(e) =>
                      setStartForm({
                        ...startForm,
                        openingBalance: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsStartDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleStartShift} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Start Shift
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active shifts cards - mobile optimized */}
      {activeShifts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">
              Active Shifts ({activeShifts.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeShifts.map((shift) => (
              <Card
                key={shift.id}
                className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{shift.nozzleName}</span>
                    <Dialog
                      open={isCloseDialogOpen && selectedShiftId === shift.id}
                      onOpenChange={(open) => {
                        setIsCloseDialogOpen(open);
                        setSelectedShiftId(open ? shift.id! : null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Square className="mr-1 h-3 w-3" />
                          End
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>End Current Shift</DialogTitle>
                          <DialogDescription>
                            Close your active shift on nozzle {shift.nozzleName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="closing-balance">
                              Closing Fuel Balance (L)
                            </Label>
                            <Input
                              id="closing-balance"
                              type="number"
                              step="0.001"
                              placeholder="0.000"
                              value={closeForm.closingBalance}
                              onChange={(e) =>
                                setCloseForm({
                                  ...closeForm,
                                  closingBalance: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="next-salesman">
                              Next Salesman (Optional)
                            </Label>
                            <Select
                              value={closeForm.nextSalesmanId}
                              onValueChange={(value) =>
                                setCloseForm({
                                  ...closeForm,
                                  nextSalesmanId: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select next salesman (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                {loadingSalesmen ? (
                                  <SelectItem value="" disabled>
                                    Loading salesmen...
                                  </SelectItem>
                                ) : (
                                  salesmen.map((salesman) => (
                                    <SelectItem
                                      key={salesman.id}
                                      value={salesman.id!}
                                    >
                                      {salesman.username}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsCloseDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleCloseShift(shift.id!)}
                            disabled={loading}
                          >
                            {loading && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            End Shift
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Product:
                      </span>
                      <p className="font-semibold">{shift.productName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Started:
                      </span>
                      <p className="font-semibold">
                        {formatDateTime(shift.startDateTime)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Opening Fuel:
                      </span>
                      <p className="font-semibold">
                        {formatFuelQuantity(shift.openingBalance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Date filters - mobile first */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Filter Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Label htmlFor="from-date" className="text-sm font-medium">
                From Date
              </Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="to-date" className="text-sm font-medium">
                To Date
              </Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shifts table - mobile responsive */}
      <Card>
        <CardHeader>
          <CardTitle>Shift History</CardTitle>
          <CardDescription>
            Your completed shifts within the selected date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
              <p className="font-medium">Error loading shifts</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && shifts.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading shifts...</span>
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No shifts found for the selected date range.</p>
              <p className="text-sm mt-1">Try adjusting your date filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Nozzle</TableHead>
                    <TableHead className="min-w-[140px]">Start Time</TableHead>
                    <TableHead className="min-w-[140px]">End Time</TableHead>
                    <TableHead className="min-w-[100px]">
                      Opening Fuel
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      Closing Fuel
                    </TableHead>
                    <TableHead className="min-w-[100px]">Dispensed</TableHead>
                    <TableHead className="min-w-[100px]">
                      Total Amount
                    </TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{shift.nozzleName}</span>
                          <span className="text-xs text-muted-foreground">
                            {shift.productName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(shift.startDateTime)}
                      </TableCell>
                      <TableCell>
                        {shift.endDateTime
                          ? formatDateTime(shift.endDateTime)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {formatFuelQuantity(shift.openingBalance)}
                      </TableCell>
                      <TableCell>
                        {shift.closingBalance
                          ? formatFuelQuantity(shift.closingBalance)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {shift.closingBalance
                          ? formatFuelQuantity(
                              shift.dispensedAmount ||
                                shift.closingBalance - shift.openingBalance
                            )
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {shift.totalAmount !== undefined
                          ? formatCurrency(shift.totalAmount)
                          : shift.closingBalance
                          ? formatCurrency(calculateTotalAmount(shift))
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            shift.status === 'ACTIVE' ? 'default' : 'secondary'
                          }
                        >
                          {shift.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
