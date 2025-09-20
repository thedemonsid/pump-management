import type { BillType, RateType } from './common';
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
  billType: BillType;
  rateType: RateType;
  billItems: BillItem[];
  totalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  netAmount?: number;
  vehicleNo?: string;
  driverName?: string;
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
  /** Bill type */
  billType: BillType;
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
  /** Vehicle number (for salesman bills) */
  vehicleNo?: string;
  /** Driver name (for salesman bills) */
  driverName?: string;
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
  amount?: number;
  discount: number;
  discountAmount?: number;
  taxPercentage: number;
  taxAmount?: number;
  netAmount?: number;
  totalAmount?: number; // Keep for backward compatibility
  description?: string;
}

export interface CreateBillItemRequest {
  productId: string;
  quantity: number;
  rate: number;
  discount?: number;
  taxPercentage: number;
}

export interface CreateBillRequest {
  pumpMasterId: string;
  billNo: number;
  billDate: string;
  customerId: string;
  billType: BillType;
  rateType: RateType;
  billItems: CreateBillItemRequest[];
  vehicleNo?: string;
  driverName?: string;
  payments?: CreateCustomerBillPaymentRequest[];
}

export interface UpdateBillRequest {
  billNo?: number;
  billDate?: string;
  customerId?: string;
  billType?: BillType;
  rateType?: RateType;
  billItems?: CreateBillItemRequest[];
  vehicleNo?: string;
  driverName?: string;
}
