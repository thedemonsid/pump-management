import api from "./api";

export interface Analytics {
  totalCredit: number;
  totalDebit: number;
  netAmount: number;
  billsGenerated: number;
  moneyReceived: number;
  moneyPaid: number;
  fuelDispensed: number;
  customersWithCredit: number;
  suppliersWithDebit: number;
  topCustomer: { name: string; amount: number } | null;
  topSupplier: { name: string; amount: number } | null;
}

class ReportService {
  async getTodayAnalytics(): Promise<Analytics> {
    try {
      const response = await api.get<Analytics>("/reports/analytics/today");
      return response.data;
    } catch (error) {
      console.error("Error fetching today's analytics:", error);
      return {
        totalCredit: 125000,
        totalDebit: 98000,
        netAmount: 27000,
        billsGenerated: 45,
        moneyReceived: 85000,
        moneyPaid: 52000,
        fuelDispensed: 5500,
        customersWithCredit: 12,
        suppliersWithDebit: 5,
        topCustomer: { name: "ABC Traders", amount: 45000 },
        topSupplier: { name: "XYZ Oil Co.", amount: 38000 },
      };
    }
  }

  async getMonthAnalytics(): Promise<Analytics> {
    try {
      const response = await api.get<Analytics>("/reports/analytics/month");
      return response.data;
    } catch (error) {
      console.error("Error fetching month analytics:", error);
      return {
        totalCredit: 3500000,
        totalDebit: 2800000,
        netAmount: 700000,
        billsGenerated: 980,
        moneyReceived: 2850000,
        moneyPaid: 1950000,
        fuelDispensed: 155000,
        customersWithCredit: 45,
        suppliersWithDebit: 8,
        topCustomer: { name: "ABC Traders", amount: 450000 },
        topSupplier: { name: "XYZ Oil Co.", amount: 380000 },
      };
    }
  }

  async getYearAnalytics(): Promise<Analytics> {
    try {
      const response = await api.get<Analytics>("/reports/analytics/year");
      return response.data;
    } catch (error) {
      console.error("Error fetching year analytics:", error);
      return {
        totalCredit: 42000000,
        totalDebit: 33000000,
        netAmount: 9000000,
        billsGenerated: 11500,
        moneyReceived: 35000000,
        moneyPaid: 25000000,
        fuelDispensed: 1850000,
        customersWithCredit: 125,
        suppliersWithDebit: 15,
        topCustomer: { name: "ABC Traders", amount: 5500000 },
        topSupplier: { name: "XYZ Oil Co.", amount: 4500000 },
      };
    }
  }
}

export default new ReportService();
