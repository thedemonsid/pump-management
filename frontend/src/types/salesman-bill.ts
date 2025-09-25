/**
 * Salesman Bill types - for credit sales made by salesmen during nozzle shifts
 */

export interface SalesmanBillResponse {
  /** Unique identifier */
  id: string;
  /** Pump Master ID */
  pumpMasterId: string;
  /** Bill number */
  billNo: number;
  /** Bill date */
  billDate: string;
  /** Customer ID */
  customerId: string;
  /** Customer name */
  customerName?: string;
  /** Product ID */
  productId: string;
  /** Product name */
  productName?: string;
  /** Salesman Nozzle Shift ID - links bill to specific shift */
  salesmanNozzleShiftId: string;
  /** Rate type */
  rateType: 'EXCLUDING_GST' | 'INCLUDING_GST';
  /** Quantity in liters */
  quantity: number;
  /** Rate per liter */
  rate: number;
  /** Total amount */
  amount: number;
  /** Vehicle number */
  vehicleNo?: string;
  /** Driver name */
  driverName?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

export interface CreateSalesmanBillRequest {
  /** Pump Master ID */
  pumpMasterId: string;
  /** Bill number */
  billNo: number;
  /** Bill date */
  billDate: string;
  /** Customer ID */
  customerId: string;
  /** Product ID */
  productId: string;
  /** Salesman Nozzle Shift ID - required for linking to shift */
  salesmanNozzleShiftId: string;
  /** Rate type */
  rateType: 'EXCLUDING_GST' | 'INCLUDING_GST';
  /** Quantity in liters */
  quantity: number;
  /** Rate per liter */
  rate: number;
  /** Vehicle number */
  vehicleNo?: string;
  /** Driver name */
  driverName?: string;
}

export interface UpdateSalesmanBillRequest {
  /** Bill number */
  billNo?: number;
  /** Customer ID */
  customerId?: string;
  /** Product ID */
  productId?: string;
  /** Salesman Nozzle Shift ID - optional for updates */
  salesmanNozzleShiftId?: string;
  /** Quantity in liters */
  quantity?: number;
  /** Rate per liter */
  rate?: number;
  /** Vehicle number */
  vehicleNo?: string;
  /** Driver name */
  driverName?: string;
}
