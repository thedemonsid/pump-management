export const PaymentMethod = {
  CASH: 'CASH',
  UPI: 'UPI',
  RTGS: 'RTGS',
  NEFT: 'NEFT',
  IMPS: 'IMPS',
  CHEQUE: 'CHEQUE',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

/**
 * Response DTO for Customer Bill Payment information
 */
export interface CustomerBillPaymentResponse {
  /** Unique identifier */
  id: string;
  /** Pump Master ID */
  pumpMasterId: string;
  /** Bill ID */
  billId?: string;
  /** Bill number */
  billNo?: number;
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
 * Request DTO for creating a new customer bill payment
 */
export interface CreateCustomerBillPaymentRequest {
  /** Pump Master ID this payment belongs to */
  pumpMasterId: string;
  /** Bill ID this payment is for (optional - for general customer payments) */
  billId?: string;
  /** Customer ID making the payment */
  customerId: string;
  /** Bank Account ID where payment is deposited */
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
 * Request DTO for updating a customer bill payment
 */
export interface UpdateCustomerBillPaymentRequest {
  /** Pump Master ID this payment belongs to */
  pumpMasterId?: string;
  /** Bill ID this payment is for (optional - for general customer payments) */
  billId?: string;
  /** Customer ID making the payment */
  customerId?: string;
  /** Bank Account ID where payment is deposited */
  bankAccountId?: string;
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
