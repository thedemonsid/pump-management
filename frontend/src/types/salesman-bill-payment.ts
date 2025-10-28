import type { PaymentMethod } from "./customer-bill-payment";

/**
 * Response DTO for Salesman Bill Payment information
 * Updated to align with new architecture where payments are linked to SalesmanShift
 */
export interface SalesmanBillPaymentResponse {
  /** Unique identifier */
  id: string;
  /** Pump Master ID */
  pumpMasterId: string;
  /** Salesman Shift ID - links payment to the salesman's shift */
  salesmanShiftId: string;
  /** Salesman ID */
  salesmanId: string;
  /** Salesman name */
  salesmanName?: string;
  /** Customer ID */
  customerId: string;
  /** Customer name */
  customerName?: string;
  /** Bank Account ID */
  bankAccountId: string;
  /** Bank account holder name */
  bankAccountHolderName?: string;
  /** Payment amount */
  amount: number;
  /** Payment date and time */
  paymentDate: string;
  /** Payment method */
  paymentMethod: PaymentMethod;
  /** Payment reference number */
  referenceNumber: string;
  /** Additional notes */
  notes?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Request DTO for creating a new salesman bill payment
 */
export interface CreateSalesmanBillPaymentRequest {
  /** Pump Master ID */
  pumpMasterId: string;
  /** Salesman Shift ID - links payment to the salesman's shift */
  salesmanShiftId: string;
  /** Customer ID */
  customerId: string;
  /** Bank Account ID */
  bankAccountId: string;
  /** Payment amount */
  amount: number;
  /** Payment date and time */
  paymentDate: string;
  /** Payment method */
  paymentMethod: PaymentMethod;
  /** Payment reference number */
  referenceNumber: string;
  /** Additional notes */
  notes?: string;
}

/**
 * Request DTO for updating an existing salesman bill payment
 */
export interface UpdateSalesmanBillPaymentRequest {
  /** Payment amount */
  amount?: number;
  /** Payment date and time */
  paymentDate?: string;
  /** Payment method */
  paymentMethod?: PaymentMethod;
  /** Payment reference number */
  referenceNumber?: string;
  /** Additional notes */
  notes?: string;
}
