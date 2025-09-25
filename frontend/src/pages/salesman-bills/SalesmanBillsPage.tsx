import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Edit, Trash2, Loader2, Receipt } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { SalesmanBillService } from '@/services/salesman-bill-service';
import { CustomerService } from '@/services/customer-service';
import { ProductService } from '@/services/product-service';
import { SalesmanNozzleShiftService } from '@/services/salesman-nozzle-shift-service';
import type {
  SalesmanBillResponse,
  Customer,
  Product,
  SalesmanNozzleShiftResponse,
} from '@/types';

export function SalesmanBillsPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState<SalesmanBillResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<SalesmanBillResponse | null>(
    null
  );

  // Form loading states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeShifts, setActiveShifts] = useState<
    SalesmanNozzleShiftResponse[]
  >([]);
  const [loadingFormData, setLoadingFormData] = useState(false);

  // Form state
  const [billForm, setBillForm] = useState({
    billNo: '',
    billDate: format(new Date(), 'yyyy-MM-dd'),
    customerId: '',
    productId: '',
    salesmanNozzleShiftId: '',
    quantity: '',
    rate: '',
    vehicleNo: '',
    driverName: '',
  });

  // Load bills
  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const billsData = await SalesmanBillService.getByPumpMaster();
      setBills(billsData);
    } catch (error) {
      console.error('Failed to load bills:', error);
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = useCallback(async () => {
    try {
      setLoadingFormData(true);
      const [customersData, productsData, shiftsData] = await Promise.all([
        CustomerService.getAll(),
        ProductService.getAll(),
        SalesmanNozzleShiftService.getAll().then((shifts) =>
          shifts.filter((s) => s.status === 'OPEN' || s.status === 'ACTIVE')
        ),
      ]);

      setCustomers(customersData);
      setProducts(productsData.filter((p) => p.productType === 'FUEL')); // Only FUEL products
      setActiveShifts(shiftsData);

      // Set next bill number for create form
      if (isCreateDialogOpen && !isEditDialogOpen) {
        const nextBillNo = await SalesmanBillService.getNextBillNo();
        setBillForm((prev) => ({ ...prev, billNo: nextBillNo.toString() }));
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    } finally {
      setLoadingFormData(false);
    }
  }, [isCreateDialogOpen, isEditDialogOpen]);

  // Load form data when dialogs open
  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
      loadFormData();
    }
  }, [isCreateDialogOpen, isEditDialogOpen, loadFormData]);

  const handleCreateBill = async () => {
    if (!user?.pumpMasterId) return;

    try {
      const billData = {
        pumpMasterId: user.pumpMasterId,
        billNo: parseInt(billForm.billNo),
        billDate: billForm.billDate,
        customerId: billForm.customerId,
        productId: billForm.productId,
        salesmanNozzleShiftId: billForm.salesmanNozzleShiftId,
        rateType: 'INCLUDING_GST' as const,
        quantity: parseFloat(billForm.quantity),
        rate: parseFloat(billForm.rate),
        vehicleNo: billForm.vehicleNo || undefined,
        driverName: billForm.driverName || undefined,
      };

      await SalesmanBillService.create(billData);
      setIsCreateDialogOpen(false);
      resetForm();
      loadBills();
    } catch (error) {
      console.error('Failed to create bill:', error);
    }
  };

  const handleEditBill = async () => {
    if (!selectedBill) return;

    try {
      const billData = {
        billNo: billForm.billNo ? parseInt(billForm.billNo) : undefined,
        customerId: billForm.customerId || undefined,
        productId: billForm.productId || undefined,
        salesmanNozzleShiftId: billForm.salesmanNozzleShiftId || undefined,
        quantity: billForm.quantity ? parseFloat(billForm.quantity) : undefined,
        rate: billForm.rate ? parseFloat(billForm.rate) : undefined,
        vehicleNo: billForm.vehicleNo || undefined,
        driverName: billForm.driverName || undefined,
      };

      await SalesmanBillService.update(selectedBill.id, billData);
      setIsEditDialogOpen(false);
      setSelectedBill(null);
      resetForm();
      loadBills();
    } catch (error) {
      console.error('Failed to update bill:', error);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;

    try {
      await SalesmanBillService.delete(billId);
      loadBills();
    } catch (error) {
      console.error('Failed to delete bill:', error);
    }
  };

  const openEditDialog = (bill: SalesmanBillResponse) => {
    setSelectedBill(bill);
    setBillForm({
      billNo: bill.billNo.toString(),
      billDate: bill.billDate,
      customerId: bill.customerId,
      productId: bill.productId,
      salesmanNozzleShiftId: bill.salesmanNozzleShiftId,
      quantity: bill.quantity.toString(),
      rate: bill.rate.toString(),
      vehicleNo: bill.vehicleNo || '',
      driverName: bill.driverName || '',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setBillForm({
      billNo: '',
      billDate: format(new Date(), 'yyyy-MM-dd'),
      customerId: '',
      productId: '',
      salesmanNozzleShiftId: '',
      quantity: '',
      rate: '',
      vehicleNo: '',
      driverName: '',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatFuelQuantity = (quantity: number) => {
    return `${quantity.toFixed(3)} L`;
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to administrators and managers.
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
            Salesman Bills
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage credit bills created by salesmen during shifts
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Salesman Bill</DialogTitle>
              <DialogDescription>
                Create a new credit bill for a customer purchase during a shift
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bill-no">Bill Number</Label>
                  <Input
                    id="bill-no"
                    value={billForm.billNo}
                    onChange={(e) =>
                      setBillForm({ ...billForm, billNo: e.target.value })
                    }
                    placeholder="Auto-generated"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bill-date">Bill Date</Label>
                  <Input
                    id="bill-date"
                    type="date"
                    value={billForm.billDate}
                    onChange={(e) =>
                      setBillForm({ ...billForm, billDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shift">Active Shift *</Label>
                <Select
                  value={billForm.salesmanNozzleShiftId}
                  onValueChange={(value) =>
                    setBillForm({ ...billForm, salesmanNozzleShiftId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select active shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingFormData ? (
                      <SelectItem value="" disabled>
                        Loading shifts...
                      </SelectItem>
                    ) : (
                      activeShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id!}>
                          {shift.nozzleName} - {shift.productName} (
                          {shift.salesmanUsername})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={billForm.customerId}
                  onValueChange={(value) =>
                    setBillForm({ ...billForm, customerId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingFormData ? (
                      <SelectItem value="" disabled>
                        Loading customers...
                      </SelectItem>
                    ) : (
                      customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id!}>
                          {customer.customerName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="product">Fuel Product *</Label>
                <Select
                  value={billForm.productId}
                  onValueChange={(value) =>
                    setBillForm({ ...billForm, productId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel product" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingFormData ? (
                      <SelectItem value="" disabled>
                        Loading products...
                      </SelectItem>
                    ) : (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id!}>
                          {product.productName} - {product.salesUnit}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity (L) *</Label>
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
                  <Label htmlFor="rate">Rate (₹/L) *</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={billForm.rate}
                    onChange={(e) =>
                      setBillForm({ ...billForm, rate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vehicle-no">Vehicle Number</Label>
                  <Input
                    id="vehicle-no"
                    placeholder="MH12AB1234"
                    value={billForm.vehicleNo}
                    onChange={(e) =>
                      setBillForm({ ...billForm, vehicleNo: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="driver-name">Driver Name</Label>
                  <Input
                    id="driver-name"
                    placeholder="John Doe"
                    value={billForm.driverName}
                    onChange={(e) =>
                      setBillForm({ ...billForm, driverName: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateBill} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Bill
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Bills</CardTitle>
          <CardDescription>
            All salesman credit bills for your pump station
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
              <p className="font-medium">Error loading bills</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading bills...</span>
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills found.</p>
              <p className="text-sm mt-1">
                Create your first salesman bill to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[80px]">Bill No</TableHead>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="min-w-[120px]">Product</TableHead>
                    <TableHead className="min-w-[100px]">Quantity</TableHead>
                    <TableHead className="min-w-[100px]">Rate</TableHead>
                    <TableHead className="min-w-[120px]">Amount</TableHead>
                    <TableHead className="min-w-[120px]">Shift</TableHead>
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">
                        #{bill.billNo}
                      </TableCell>
                      <TableCell>
                        {format(new Date(bill.billDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{bill.customerName}</TableCell>
                      <TableCell>{bill.productName}</TableCell>
                      <TableCell>{formatFuelQuantity(bill.quantity)}</TableCell>
                      <TableCell>{formatCurrency(bill.rate)}</TableCell>
                      <TableCell>{formatCurrency(bill.amount)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">Shift Active</div>
                          <div className="text-muted-foreground">
                            {bill.salesmanNozzleShiftId.substring(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(bill)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBill(bill.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Salesman Bill</DialogTitle>
            <DialogDescription>Update bill information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-bill-no">Bill Number</Label>
                <Input
                  id="edit-bill-no"
                  value={billForm.billNo}
                  onChange={(e) =>
                    setBillForm({ ...billForm, billNo: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-bill-date">Bill Date</Label>
                <Input
                  id="edit-bill-date"
                  type="date"
                  value={billForm.billDate}
                  onChange={(e) =>
                    setBillForm({ ...billForm, billDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-customer">Customer</Label>
              <Select
                value={billForm.customerId}
                onValueChange={(value) =>
                  setBillForm({ ...billForm, customerId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id!}>
                      {customer.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-product">Fuel Product</Label>
              <Select
                value={billForm.productId}
                onValueChange={(value) =>
                  setBillForm({ ...billForm, productId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id!}>
                      {product.productName} - {product.salesUnit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity (L)</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  step="0.001"
                  value={billForm.quantity}
                  onChange={(e) =>
                    setBillForm({ ...billForm, quantity: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-rate">Rate (₹/L)</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  step="0.01"
                  value={billForm.rate}
                  onChange={(e) =>
                    setBillForm({ ...billForm, rate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-vehicle-no">Vehicle Number</Label>
                <Input
                  id="edit-vehicle-no"
                  value={billForm.vehicleNo}
                  onChange={(e) =>
                    setBillForm({ ...billForm, vehicleNo: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-driver-name">Driver Name</Label>
                <Input
                  id="edit-driver-name"
                  value={billForm.driverName}
                  onChange={(e) =>
                    setBillForm({ ...billForm, driverName: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditBill} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Bill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
