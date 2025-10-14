import { useState } from "react";
import { getTodayFormatted } from "@/utils/bill-utils";
import type { BillFormData } from "@/components/bills/BillForm";
import type { SalesmanBillResponse } from "@/types";

const getInitialFormState = (): BillFormData => ({
  billNo: "",
  billDate: getTodayFormatted(),
  customerId: "",
  productId: "",
  salesmanNozzleShiftId: "",
  quantity: "",
  rate: "",
  vehicleNo: "",
  driverName: "",
});

export function useBillForm() {
  const [billForm, setBillForm] = useState<BillFormData>(getInitialFormState());

  const updateField = (field: keyof BillFormData, value: string) => {
    setBillForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setBillForm(getInitialFormState());
  };

  const loadBillData = (bill: SalesmanBillResponse) => {
    setBillForm({
      billNo: bill.billNo.toString(),
      billDate: bill.billDate,
      customerId: bill.customerId,
      productId: bill.productId,
      salesmanNozzleShiftId: bill.salesmanNozzleShiftId,
      quantity: bill.quantity.toString(),
      rate: bill.rate.toString(),
      vehicleNo: bill.vehicleNo || "",
      driverName: bill.driverName || "",
    });
  };

  const setNextBillNo = (billNo: number) => {
    setBillForm((prev) => ({ ...prev, billNo: billNo.toString() }));
  };

  return {
    billForm,
    updateField,
    resetForm,
    loadBillData,
    setNextBillNo,
  };
}
