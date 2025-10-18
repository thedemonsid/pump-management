import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useBillsData } from "@/hooks/useBillsData";
import { useBillForm } from "@/hooks/useBillForm";
import { useFormData } from "@/hooks/useFormData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Receipt } from "lucide-react";
import { DateRangeFilter } from "@/components/bills/DateRangeFilter";
import {
  CompactBillForm,
  type BillFormImages,
} from "@/components/bills/CompactBillForm";
import { BillsTable } from "@/components/bills/BillsTable";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import {
  getDefaultStartDate,
  getTodayFormatted,
  formatDate,
} from "@/utils/bill-utils";
import type { SalesmanBillResponse } from "@/types";
import { toast } from "sonner";

export function SalesmanBillsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: getTodayFormatted(),
  });

  const [operationLoading, setOperationLoading] = useState(false);

  // Image state for creation
  const [billImages, setBillImages] = useState<BillFormImages>({
    meterImage: null,
    vehicleImage: null,
    extraImage: null,
  });

  // Key to force image upload component reset
  const [imageUploadKey, setImageUploadKey] = useState(0);

  // Custom hooks
  const { bills, loading, error, loadBills } = useBillsData(
    dateRange.startDate,
    dateRange.endDate
  );

  const { billForm, updateField, resetForm, setNextBillNo } = useBillForm();

  const {
    customers,
    products,
    activeShifts,
    loadingFormData,
    loadFormData,
    getNextBillNo,
  } = useFormData(true, false); // Always load form data for compact form

  // Load bills on mount and when date range changes
  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // Load form data on mount and get next bill number - ONLY ONCE
  useEffect(() => {
    loadFormData();
    getNextBillNo().then((billNo) => {
      if (billNo !== null) {
        setNextBillNo(billNo);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array means run only once on mount

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
        rateType: "INCLUDING_GST" as const,
        quantity: parseFloat(billForm.quantity),
        rate: parseFloat(billForm.rate),
        vehicleNo: billForm.vehicleNo || undefined,
        driverName: billForm.driverName || undefined,
      };

      const images = {
        meterImage: billImages.meterImage || undefined,
        vehicleImage: billImages.vehicleImage || undefined,
        extraImage: billImages.extraImage || undefined,
      };

      await SalesmanBillService.create(billData, images);

      // Success toast
      toast.success("Bill created successfully", {
        description: `Bill #${billForm.billNo} has been saved`,
      });

      resetForm();
      // Reset images
      setBillImages({
        meterImage: null,
        vehicleImage: null,
        extraImage: null,
      });
      // Force image upload components to reset by changing key
      setImageUploadKey((prev) => prev + 1);

      // Get next bill number
      getNextBillNo().then((billNo) => {
        if (billNo !== null) {
          setNextBillNo(billNo);
        }
      });
      loadBills();
    } catch (error) {
      console.error("Failed to create bill:", error);
      // Error toast
      toast.error("Failed to create bill", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while saving the bill",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleImageChange = (
    field: keyof BillFormImages,
    file: File | null
  ) => {
    setBillImages((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleEditBill = (bill: SalesmanBillResponse) => {
    navigate(`/salesman-bills/${bill.id}`);
  };

  const handleDeleteBill = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;

    try {
      await SalesmanBillService.delete(billId);

      // Success toast
      toast.success("Bill deleted successfully", {
        description: "The bill has been removed",
      });

      loadBills();
    } catch (error) {
      console.error("Failed to delete bill:", error);
      // Error toast
      toast.error("Failed to delete bill", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the bill",
      });
    }
  };

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Salesman Bills
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage credit bills created by salesmen during shifts
        </p>
      </div>

      {/* Compact Bill Form - No wrapper card as form has its own cards */}
      <CompactBillForm
        formData={billForm}
        images={billImages}
        customers={customers}
        products={products}
        activeShifts={activeShifts}
        loadingFormData={loadingFormData}
        loading={operationLoading}
        onSubmit={handleCreateBill}
        onChange={updateField}
        onImageChange={handleImageChange}
        resetKey={imageUploadKey}
      />

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

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Bills</CardTitle>
          <CardDescription>
            Showing bills from {formatDate(new Date(dateRange.startDate))} to{" "}
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
              onEdit={handleEditBill}
              onDelete={handleDeleteBill}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
