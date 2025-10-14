import { useState, useCallback } from "react";
import { CustomerService } from "@/services/customer-service";
import { ProductService } from "@/services/product-service";
import { SalesmanNozzleShiftService } from "@/services/salesman-nozzle-shift-service";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import type { Customer, Product, SalesmanNozzleShiftResponse } from "@/types";

export function useFormData(isCreateMode: boolean, isEditMode: boolean) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeShifts, setActiveShifts] = useState<
    SalesmanNozzleShiftResponse[]
  >([]);
  const [loadingFormData, setLoadingFormData] = useState(false);

  const loadFormData = useCallback(async () => {
    try {
      setLoadingFormData(true);
      const [customersData, productsData, shiftsData] = await Promise.all([
        CustomerService.getAll(),
        ProductService.getAll(),
        SalesmanNozzleShiftService.getAll().then((shifts) =>
          shifts.filter((s) => s.status === "OPEN" || s.status === "ACTIVE")
        ),
      ]);

      setCustomers(customersData);
      setProducts(productsData.filter((p) => p.productType === "FUEL"));
      setActiveShifts(shiftsData);
    } catch (error) {
      console.error("Failed to load form data:", error);
    } finally {
      setLoadingFormData(false);
    }
  }, []);

  const getNextBillNo = useCallback(async () => {
    if (isCreateMode && !isEditMode) {
      return await SalesmanBillService.getNextBillNo();
    }
    return null;
  }, [isCreateMode, isEditMode]);

  return {
    customers,
    products,
    activeShifts,
    loadingFormData,
    loadFormData,
    getNextBillNo,
  };
}
