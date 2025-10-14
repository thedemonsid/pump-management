import { useState, useCallback } from "react";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import type { SalesmanBillResponse } from "@/types";

export function useBillsData(startDate: string, endDate: string) {
  const [bills, setBills] = useState<SalesmanBillResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const billsData = await SalesmanBillService.getByDateRange(
        startDate,
        endDate
      );
      setBills(billsData);
    } catch (error) {
      console.error("Failed to load bills:", error);
      setError("Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  return { bills, loading, error, loadBills };
}
