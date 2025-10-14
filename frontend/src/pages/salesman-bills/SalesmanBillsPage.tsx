import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBillsData } from '@/hooks/useBillsData';
import { useBillForm } from '@/hooks/useBillForm';
import { useFormData } from '@/hooks/useFormData';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Loader2, Receipt } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DateRangeFilter } from '@/components/bills/DateRangeFilter';
import { BillForm } from '@/components/bills/BillForm';
import { BillsTable } from '@/components/bills/BillsTable';
import { SalesmanBillService } from '@/services/salesman-bill-service';
import { getDefaultStartDate, getTodayFormatted, formatDate } from '@/utils/bill-utils';
import type { SalesmanBillResponse } from '@/types';

export function SalesmanBillsPage() {
  const { user } = useAuth();

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: getTodayFormatted(),
  });

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<SalesmanBillResponse | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Custom hooks
  const { bills, loading, error, loadBills } = useBillsData(
    dateRange.startDate,
    dateRange.endDate
  );

  const {
    billForm,
    updateField,
    resetForm,
    loadBillData,
    setNextBillNo,
  } = useBillForm();

  const {
    customers,
    products,
    activeShifts,
    loadingFormData,
    loadFormData,
    getNextBillNo,
  } = useFormData(isCreateDialogOpen, isEditDialogOpen);

  // Load bills on mount and when date range changes
  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // Load form data when dialogs open
  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
      loadFormData();

      // Get next bill number for create mode
      if (isCreateDialogOpen && !isEditDialogOpen) {
        getNextBillNo().then((billNo) => {
          if (billNo !== null) {
            setNextBillNo(billNo);
          }
        });
      }
    }
  }, [isCreateDialogOpen, isEditDialogOpen, loadFormData, getNextBillNo, setNextBillNo]);

  const handleCreateBill = async () => {
    if (!user?.pumpMasterId) return;

    try {
      setOperationLoading(true);
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
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditBill = async () => {
    if (!selectedBill) return;

    try {
      setOperationLoading(true);
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
    } finally {
      setOperationLoading(false);
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
    loadBillData(bill);
    setIsEditDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedBill(null);
    resetForm();
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
      <div className="flex flex-col space-y-4">
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
              <BillForm
                formData={billForm}
                customers={customers}
                products={products}
                activeShifts={activeShifts}
                loadingFormData={loadingFormData}
                loading={operationLoading}
                isEditMode={false}
                onSubmit={handleCreateBill}
                onCancel={handleCloseCreateDialog}
                onChange={updateField}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Date Range Filter */}
        <DateRangeFilter
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartDateChange={(date) =>
            setDateRange((prev) => ({ ...prev, startDate: date }))
          }
          onEndDateChange={(date) =>
            setDateRange((prev) => ({ ...prev, endDate: date }))
          }
          onApplyFilter={loadBills}
          loading={loading}
        />
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Bills</CardTitle>
          <CardDescription>
            Showing bills from{' '}
            {formatDate(new Date(dateRange.startDate))} to{' '}
            {formatDate(new Date(dateRange.endDate))}
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
            <BillsTable
              bills={bills}
              onEdit={openEditDialog}
              onDelete={handleDeleteBill}
            />
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
          <BillForm
            formData={billForm}
            customers={customers}
            products={products}
            loadingFormData={loadingFormData}
            loading={operationLoading}
            isEditMode={true}
            onSubmit={handleEditBill}
            onCancel={handleCloseEditDialog}
            onChange={updateField}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
