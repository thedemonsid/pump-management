// Re-export all types from modular files
export * from "./common";
export * from "./product";
export * from "./tank";
export * from "./tank-transaction";
export * from "./nozzle";
export * from "./nozzle-shift";
export * from "./salesman";
export * from "./salesman-nozzle-shift";
export * from "./salesman-shift";
export * from "./shift";
export * from "./supplier";
export * from "./customer";
export * from "./purchase";
export * from "./fuel-purchase";
export * from "./bank-account";
export * from "./bank-account-ledger";
export * from "./expense-head";
export * from "./expense";

// Explicitly re-export bill types from bill.ts to avoid ambiguity
export type {
  Bill,
  BillResponse,
  BillItem,
  BillItemResponse,
  CreateBillItemRequest,
  CreateBillRequest,
  UpdateBillRequest,
} from "./bill";

// Explicitly re-export salesman bill types
export type {
  SalesmanBillResponse,
  CreateSalesmanBillRequest,
  UpdateSalesmanBillRequest,
} from "./salesman-bill";

// Explicitly re-export salesman bill payment types
export type {
  SalesmanBillPaymentResponse,
  CreateSalesmanBillPaymentRequest,
  UpdateSalesmanBillPaymentRequest,
} from "./salesman-bill-payment";

// Explicitly re-export salesman shift accounting types
export type {
  SalesmanShiftAccountingResponse,
  CreateSalesmanShiftAccountingRequest,
  UpdateSalesmanShiftAccountingRequest,
} from "./salesman-shift-accounting";

// Explicitly re-export customer bill payment types from customer-bill-payment.ts
export type {
  CustomerBillPaymentResponse,
  CreateCustomerBillPaymentRequest,
  UpdateCustomerBillPaymentRequest,
  PaymentMethod,
} from "./customer-bill-payment";

export * from "./supplier-payment";
export * from "./ledger";
export * from "./supplier-ledger";
