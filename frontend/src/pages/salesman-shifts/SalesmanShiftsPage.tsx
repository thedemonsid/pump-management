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
  Play,
  Square,
  Calendar,
  Loader2,
  Fuel,
  Eye,
  Receipt,
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
import { SalesmanBillService } from '@/services/salesman-bill-service';
import { CustomerService } from '@/services/customer-service';
import { ProductService } from '@/services/product-service';
import { toast } from 'sonner';
import type {
  Nozzle,
  Salesman,
  SalesmanNozzleShiftResponse,
  Customer,
  Product,
} from '@/types';
import type { SalesmanBillResponse, CreateSalesmanBillRequest } from '@/types';

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

  // Bills dialog state
  const [isBillsDialogOpen, setIsBillsDialogOpen] = useState(false);
  const [selectedShiftForBills, setSelectedShiftForBills] =
    useState<SalesmanNozzleShiftResponse | null>(null);
  const [shiftBills, setShiftBills] = useState<SalesmanBillResponse[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);

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
    closingBalance: 0,
    nextSalesmanId: '',
  });

  // Bill creation state
  const [isCreateBillDialogOpen, setIsCreateBillDialogOpen] = useState(false);
  const [selectedShiftForBill, setSelectedShiftForBill] =
    useState<SalesmanNozzleShiftResponse | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [billForm, setBillForm] = useState({
    customerId: '',
    productId: '',
    quantity: '',
    vehicleNo: '',
    driverName: '',
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
    try {
      await closeShift(shiftId, closeForm);
      toast.success('Shift closed successfully');
      setIsCloseDialogOpen(false);
      setSelectedShiftId(null);
      setCloseForm({ closingBalance: 0, nextSalesmanId: '' });
      // Refresh shifts
      if (user?.role === 'SALESMAN' && user?.userId) {
        fetchShifts({ fromDate, toDate, salesmanId: user.userId });
        fetchActiveShifts(user.userId);
      }
    } catch {
      toast.error('Failed to close shift');
    }
  };

  // Bill creation functions
  const handleCreateBill = async (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForBill(shift);
    setIsCreateBillDialogOpen(true);
    setLoadingCustomers(true);
    setLoadingProducts(true);
    try {
      const [customersData, productsData] = await Promise.all([
        CustomerService.getAll(),
        ProductService.getAll(),
      ]);
      setCustomers(customersData);
      setProducts(
        productsData.filter((product) => product.productType === 'FUEL')
      );
    } catch {
      toast.error('Failed to load customers and products');
    } finally {
      setLoadingCustomers(false);
      setLoadingProducts(false);
    }
  };

  const handleSubmitBill = async () => {
    if (!selectedShiftForBill || !user?.pumpMasterId) return;

    try {
      // Get next bill number
      const nextBillNo = await SalesmanBillService.getNextBillNo();

      // Get selected product for rate
      const selectedProduct = products.find((p) => p.id === billForm.productId);
      if (!selectedProduct) {
        toast.error('Selected product not found');
        return;
      }

      const billData: CreateSalesmanBillRequest = {
        pumpMasterId: user.pumpMasterId,
        billNo: nextBillNo,
        billDate: new Date().toISOString().split('T')[0], // Today's date
        customerId: billForm.customerId,
        productId: billForm.productId,
        salesmanNozzleShiftId: selectedShiftForBill.id,
        rateType: 'EXCLUDING_GST', // Default to excluding GST
        quantity: parseFloat(billForm.quantity),
        rate: selectedProduct.salesRate, // Use product's sales rate
        vehicleNo: billForm.vehicleNo,
        driverName: billForm.driverName,
      };

      await SalesmanBillService.create(billData);
      toast.success('Bill created successfully');
      setIsCreateBillDialogOpen(false);
      setSelectedShiftForBill(null);
      setBillForm({
        customerId: '',
        productId: '',
        quantity: '',
        vehicleNo: '',
        driverName: '',
      });
      // Refresh shifts to show updated bill count
      if (user?.role === 'SALESMAN' && user?.userId) {
        fetchShifts({ fromDate, toDate, salesmanId: user.userId });
        fetchActiveShifts(user.userId);
      }
    } catch {
      toast.error('Failed to create bill');
    }
  };

  // Load nozzles and salesmen for selection

  const handleViewBills = async (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForBills(shift);
    setLoadingBills(true);
    setIsBillsDialogOpen(true);

    try {
      const bills = await SalesmanBillService.getByShift(shift.id!);
      setShiftBills(bills);
    } catch (error) {
      console.error('Failed to load bills for shift:', error);
      setShiftBills([]);
    } finally {
      setLoadingBills(false);
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
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateBill(shift)}
                      >
                        <Receipt className="mr-1 h-3 w-3" />
                        Bill
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBills(shift)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Bills
                      </Button>
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
                              Close your active shift on nozzle{' '}
                              {shift.nozzleName}
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
                                    closingBalance:
                                      parseFloat(e.target.value) || 0,
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
                    </div>
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
                    <TableHead className="min-w-[80px]">Bills</TableHead>
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

      {/* Bills Dialog */}
      <Dialog open={isBillsDialogOpen} onOpenChange={setIsBillsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bills for Shift - {selectedShiftForBills?.nozzleName}
            </DialogTitle>
            <DialogDescription>
              Credit bills created during this shift
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
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">
                            Bill #{bill.billNo}
                          </span>
                          <Badge variant="outline">{bill.rateType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bill.customerName} •{' '}
                          {format(new Date(bill.billDate), 'dd/MM/yyyy')}
                        </p>
                        <p className="text-sm">
                          {bill.quantity} L × {formatCurrency(bill.rate)} ={' '}
                          {formatCurrency(bill.amount)}
                        </p>
                        {bill.vehicleNo && (
                          <p className="text-sm text-muted-foreground">
                            Vehicle: {bill.vehicleNo}
                            {bill.driverName && ` • Driver: ${bill.driverName}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(bill.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(bill.createdAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Bill Dialog */}
      <Dialog
        open={isCreateBillDialogOpen}
        onOpenChange={setIsCreateBillDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Bill</DialogTitle>
            <DialogDescription>
              Create a new bill for shift starting at{' '}
              {selectedShiftForBill &&
                format(
                  new Date(selectedShiftForBill.startDateTime),
                  'dd/MM/yyyy HH:mm'
                )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={billForm.customerId}
                onValueChange={(value) =>
                  setBillForm({ ...billForm, customerId: value })
                }
                disabled={loadingCustomers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers
                    .filter((customer) => customer.id)
                    .map((customer) => (
                      <SelectItem key={customer.id!} value={customer.id!}>
                        {customer.customerName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product">Product *</Label>
              <Select
                value={billForm.productId}
                onValueChange={(value) =>
                  setBillForm({ ...billForm, productId: value })
                }
                disabled={loadingProducts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter((product) => product.id)
                    .map((product) => (
                      <SelectItem key={product.id!} value={product.id!}>
                        {product.productName} -{' '}
                        {formatCurrency(product.salesRate)}/L
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity (Liters) *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                placeholder="0.000"
                value={billForm.quantity}
                onChange={(e) =>
                  setBillForm({ ...billForm, quantity: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vehicle">Vehicle Number</Label>
              <Input
                id="vehicle"
                placeholder="Enter vehicle number"
                value={billForm.vehicleNo}
                onChange={(e) =>
                  setBillForm({ ...billForm, vehicleNo: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="driver">Driver Name</Label>
              <Input
                id="driver"
                placeholder="Enter driver name"
                value={billForm.driverName}
                onChange={(e) =>
                  setBillForm({ ...billForm, driverName: e.target.value })
                }
              />
            </div>

            {/* Display calculated amount */}
            {billForm.productId && billForm.quantity && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Amount:</span>
                  <span className="font-bold">
                    {(() => {
                      const product = products.find(
                        (p) => p.id === billForm.productId
                      );
                      const quantity = parseFloat(billForm.quantity) || 0;
                      const rate = product?.salesRate || 0;
                      return formatCurrency(quantity * rate);
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                  <span>Rate:</span>
                  <span>
                    {(() => {
                      const product = products.find(
                        (p) => p.id === billForm.productId
                      );
                      return product
                        ? formatCurrency(product.salesRate) + '/L'
                        : '-';
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateBillDialogOpen(false);
                setSelectedShiftForBill(null);
                setBillForm({
                  customerId: '',
                  productId: '',
                  quantity: '',
                  vehicleNo: '',
                  driverName: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBill}
              disabled={
                !billForm.customerId ||
                !billForm.productId ||
                !billForm.quantity
              }
            >
              Create Bill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
