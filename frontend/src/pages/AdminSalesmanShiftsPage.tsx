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
import {
  Calendar,
  Loader2,
  Fuel,
  Eye,
  Receipt,
  User,
} from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { SalesmanBillService } from '@/services/salesman-bill-service';
import { AccountingForm } from '@/pages/salesman-shifts/AccountingForm';
import { toast } from 'sonner';
import type {
  SalesmanNozzleShiftResponse,
  SalesmanBillResponse,
  CreateSalesmanShiftAccountingRequest,
  SalesmanShiftAccounting,
} from '@/types';

export function AdminSalesmanShiftsPage() {
  const { user } = useAuth();
  const {
    shifts,
    loading,
    error,
    fetchShifts,
    createAccounting,
    getAccounting,
  } = useSalesmanNozzleShiftStore();

  // Date filtering
  const [fromDate, setFromDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return format(yesterday, 'yyyy-MM-dd');
  });
  const [toDate, setToDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  // Bills dialog state
  const [isBillsDialogOpen, setIsBillsDialogOpen] = useState(false);
  const [selectedShiftForBills, setSelectedShiftForBills] =
    useState<SalesmanNozzleShiftResponse | null>(null);
  const [shiftBills, setShiftBills] = useState<SalesmanBillResponse[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);

  // Accounting dialog state
  const [isAccountingDialogOpen, setIsAccountingDialogOpen] = useState(false);
  const [selectedShiftForAccounting, setSelectedShiftForAccounting] =
    useState<SalesmanNozzleShiftResponse | null>(null);
  const [existingAccounting, setExistingAccounting] = useState<SalesmanShiftAccounting | null>(null);

  // Load shifts with date filter for admin (all shifts)
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchShifts({ fromDate, toDate });
    }
  }, [fetchShifts, fromDate, toDate, user?.role]);

  const handleViewBills = async (shift: SalesmanNozzleShiftResponse) => {
    try {
      setLoadingBills(true);
      setSelectedShiftForBills(shift);
      const bills = await SalesmanBillService.getByShift(shift.id!);
      setShiftBills(bills);
      setIsBillsDialogOpen(true);
    } catch (error) {
      console.error('Failed to load bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoadingBills(false);
    }
  };

  const handleCreateAccounting = async (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForAccounting(shift);
    
    // Try to fetch existing accounting if shift is already accounted
    if (shift.isAccountingDone) {
      try {
        const accounting = await getAccounting(shift.id!);
        setExistingAccounting(accounting);
      } catch (error) {
        console.error('Failed to fetch existing accounting:', error);
        setExistingAccounting(null);
      }
    } else {
      setExistingAccounting(null);
    }
    
    setIsAccountingDialogOpen(true);
  };

  const handleAccountingSubmit = async (data: CreateSalesmanShiftAccountingRequest) => {
    if (!selectedShiftForAccounting?.id) return;

    try {
      await createAccounting(selectedShiftForAccounting.id, data);
      toast.success('Accounting created successfully');
      setIsAccountingDialogOpen(false);
      setSelectedShiftForAccounting(null);
      // Refresh shifts to show updated accounting status
      fetchShifts({ fromDate, toDate });
    } catch (error) {
      console.error('Failed to create accounting:', error);
      toast.error('Failed to create accounting');
    }
  };

  const handleAccountingCancel = () => {
    setIsAccountingDialogOpen(false);
    setSelectedShiftForAccounting(null);
    setExistingAccounting(null);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const formatFuelQuantity = (quantity: number) => {
    return `${quantity.toFixed(3)} L`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const calculateTotalAmount = (shift: SalesmanNozzleShiftResponse) => {
    if (shift.totalAmount !== undefined) return shift.totalAmount;

    // Calculate based on dispensed amount and rate
    if (shift.closingBalance !== undefined) {
      const dispensed = shift.dispensedAmount || (shift.closingBalance - shift.openingBalance);
      // This is a simplified calculation - in real app, you'd need the product rate
      return dispensed * 100; // Placeholder rate
    }
    return 0;
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            All Salesman Shifts
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage all salesman nozzle shifts and track fuel dispensing across all salesmen
          </p>
        </div>
      </div>

      {/* Date filters */}
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

      {/* Shifts table */}
      <Card>
        <CardHeader>
          <CardTitle>Salesman Shift History</CardTitle>
          <CardDescription>
            All completed shifts within the selected date range across all salesmen
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
                    <TableHead className="min-w-[120px]">Salesman</TableHead>
                    <TableHead className="min-w-[120px]">Nozzle</TableHead>
                    <TableHead className="min-w-[140px]">Start Time</TableHead>
                    <TableHead className="min-w-[140px]">End Time</TableHead>
                    <TableHead className="min-w-[100px]">Opening Fuel</TableHead>
                    <TableHead className="min-w-[100px]">Closing Fuel</TableHead>
                    <TableHead className="min-w-[100px]">Dispensed</TableHead>
                    <TableHead className="min-w-[100px]">Total Amount</TableHead>
                    <TableHead className="min-w-[80px]">Bills</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{shift.salesmanUsername || 'Unknown'}</span>
                        </div>
                      </TableCell>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBills(shift)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Bills
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge
                            variant={
                              shift.status === 'ACTIVE' ? 'default' : 'secondary'
                            }
                          >
                            {shift.status}
                          </Badge>
                          {shift.status === 'CLOSED' && shift.isAccountingDone && (
                            <Badge variant="outline" className="text-xs">
                              ✓ Accounted
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {shift.status === 'CLOSED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateAccounting(shift)}
                            >
                              <Receipt className="mr-1 h-3 w-3" />
                              {shift.isAccountingDone ? 'View Accounting' : 'Create Accounting'}
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

      {/* Bills Dialog */}
      <Dialog open={isBillsDialogOpen} onOpenChange={setIsBillsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bills for Shift - {selectedShiftForBills?.nozzleName}
            </DialogTitle>
            <DialogDescription>
              Credit bills created during this shift by {selectedShiftForBills?.salesmanUsername}
              {selectedShiftForBills && (
                <span className="block mt-1">
                  {formatDateTime(selectedShiftForBills.startDateTime)}
                  {selectedShiftForBills.endDateTime &&
                    ` - ${formatDateTime(selectedShiftForBills.endDateTime)}`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingBills ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading bills...</span>
            </div>
          ) : shiftBills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills found for this shift.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {shiftBills.length} Bill{shiftBills.length !== 1 ? 's' : ''}
                </h3>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      shiftBills.reduce((sum, bill) => sum + bill.amount, 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {shiftBills.map((bill) => (
                  <Card key={bill.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">
                            Bill #{bill.billNo}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            Customer: {bill.customerName}
                            {bill.vehicleNo && ` | Vehicle: ${bill.vehicleNo}`}
                          </p>
                          <p>Product: {bill.productName}</p>
                          <p>
                            Quantity: {bill.quantity} L | Rate:{' '}
                            {formatCurrency(bill.rate)}/L
                          </p>
                          <p>Total: {formatCurrency(bill.amount)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Accounting Dialog */}
      <Dialog open={isAccountingDialogOpen} onOpenChange={setIsAccountingDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Accounting</DialogTitle>
            <DialogDescription>
              Enter accounting details for the closed shift by {selectedShiftForAccounting?.salesmanUsername}
            </DialogDescription>
          </DialogHeader>
          {selectedShiftForAccounting && (
            <AccountingForm
              shift={selectedShiftForAccounting}
              onSubmit={handleAccountingSubmit}
              onCancel={handleAccountingCancel}
              loading={loading}
              existingAccounting={existingAccounting}
              isReadOnly={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}