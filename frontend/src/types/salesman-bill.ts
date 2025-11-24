/**
 * Salesman Bill types - for credit sales made by salesmen during shifts
 * Updated to align with new architecture where bills are linked to SalesmanShift
 */

export type BillingMode = "BY_QUANTITY" | "BY_AMOUNT";
export type PaymentType = "CASH" | "CREDIT";

export interface CashPaymentRequest {
  /** Payment amount */
  amount: number;
  /** Payment date and time */
  paymentDate: string;
  /** Payment method */
  paymentMethod: "CASH" | "UPI" | "RTGS" | "NEFT" | "IMPS" | "CHEQUE";
  /** Payment reference number */
  referenceNumber: string;
  /** Additional notes */
  notes?: string;
}

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
  /** Salesman Shift ID - links bill to the salesman's shift */
  salesmanShiftId: string;
  /** Nozzle ID - optional, tracks which nozzle dispensed (for reporting) */
  nozzleId?: string;
  /** Nozzle name - optional, for display purposes */
  nozzleName?: string;
  /** Rate type */
  rateType: "EXCLUDING_GST" | "INCLUDING_GST";
  /** Billing mode - how the bill was created */
  billingMode: BillingMode;
  /** Payment type - CASH or CREDIT */
  paymentType: PaymentType;
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
  /** Meter image ID */
  meterImageId?: string;
  /** Vehicle image ID */
  vehicleImageId?: string;
  /** Extra image ID */
  extraImageId?: string;
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
  /** Salesman Shift ID - required for linking to shift */
  salesmanShiftId: string;
  /** Nozzle ID - optional, for tracking which nozzle dispensed */
  nozzleId?: string;
  /** Rate type */
  rateType: "EXCLUDING_GST" | "INCLUDING_GST";
  /** Billing mode - BY_QUANTITY when customer specifies liters, BY_AMOUNT when customer specifies rupees */
  billingMode: BillingMode;
  /** Payment type - CASH or CREDIT, defaults to CREDIT */
  paymentType?: PaymentType;
  /** Cash payment details - required when paymentType is CASH */
  cashPayment?: CashPaymentRequest;
  /** Quantity in liters - required when billingMode is BY_QUANTITY, calculated when BY_AMOUNT */
  quantity?: number;
  /** Rate per liter */
  rate: number;
  /** Requested amount - required when billingMode is BY_AMOUNT, calculated when BY_QUANTITY */
  requestedAmount?: number;
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
  /** Salesman Shift ID - optional for updates */
  salesmanShiftId?: string;
  /** Nozzle ID - optional for updates */
  nozzleId?: string;
  /** Quantity in liters */
  quantity?: number;
  /** Rate per liter */
  rate?: number;
  /** Vehicle number */
  vehicleNo?: string;
  /** Driver name */
  driverName?: string;
}
