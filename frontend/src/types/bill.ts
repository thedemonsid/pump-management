import type { RateType, PaymentType } from './common';
import type {
  CustomerBillPaymentResponse,
  CreateCustomerBillPaymentRequest,
} from './customer-bill-payment';

/**
 * Bill item interface for internal use
 */
export interface BillItem {
  id?: string;
  billId?: string;
  productId: string;
  productName?: string;
  quantity: number;
  rate: number;
  discount?: number;
  taxPercentage: number;
  totalAmount?: number;
  description?: string;
}

/**
 * Bill interface for internal use
 */
export interface Bill {
  id: string;
  pumpMasterId: string;
  billNo: number;
  billDate: string;
  customerId: string;
  customerName?: string;
  rateType: RateType;
  billItems: BillItem[];
  totalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  netAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Response DTO for Bill information - matches backend BillResponse
 */
export interface BillResponse {
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
  /** Rate type */
  rateType: RateType;
  /** Total amount */
  totalAmount: number;
  /** Discount amount */
  discountAmount: number;
  /** Tax amount */
  taxAmount: number;
  /** Net amount */
  netAmount: number;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** List of bill items */
  billItems: BillItemResponse[];

  payments?: CustomerBillPaymentResponse[];
}

/**
 * Response DTO for Bill Item information
 */
export interface BillItemResponse {
  id: string;
  billId: string;
  productId: string;
  productName?: string;
  hsnCode?: string;
  salesUnit?: string;
  quantity: number;
  rate: number;
  amount: number;
  gst: number;
  discount: number;
  netAmount: number;
}

export interface CreateBillItemRequest {
  productId: string;
  quantity: number;
  rate: number;
  gst?: number;
  discount?: number;
}

export interface CreateBillRequest {
  pumpMasterId: string;
  billNo: number;
  billDate: string;
  customerId: string;
  paymentType: PaymentType;
  rateType: RateType;
  billItems: CreateBillItemRequest[];
  discountAmount?: number;
  payments?: CreateCustomerBillPaymentRequest[];
}

export interface UpdateBillRequest {
  billNo?: number;
  billDate?: string;
  customerId?: string;
  rateType?: RateType;
  billItems?: CreateBillItemRequest[];
}
