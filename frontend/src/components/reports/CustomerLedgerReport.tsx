import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";
import type { Customer } from "@/types";
import { normalizeNumberString } from "@/lib/utils/index";

interface BillDetails {
  billNo: number;
  billType: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  billItems: Array<{
    productName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

interface LedgerEntry {
  date: string;
  action: string;
  invoiceNo: string;
  billAmount: number;
  amountPaid: number;
  balanceAmount: number;
  debtAmount: number;
  entryBy: string;
  comments: string;
  type: "bill" | "payment";
  billDetails?: BillDetails;
}

interface LedgerSummary {
  totalBillsBefore: number;
  totalPaidBefore: number;
  totalDebtBefore: number;
}

interface ProductSale {
  productName: string;
  quantity: number;
  unit: string;
}
// Register font
Font.register({
  family: "Wotfard",
  src: "/fonts/wotfard-regular-webfont.ttf",
});

// Create styles with better responsive design
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 10,
    fontSize: 8,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottom: "1pt solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    marginBottom: 5,
    color: "#333",
  },
  subtitle: {
    fontSize: 10,
    fontFamily: "Wotfard",
    color: "#666",
    marginBottom: 3,
  },
  customerInfo: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    marginBottom: 5,
    color: "#000",
  },
  periodInfo: {
    fontSize: 10,
    fontFamily: "Wotfard",
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    padding: 5,
    textAlign: "center",
    borderRadius: 2,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 5,
  },
  summaryItem: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 3,
    backgroundColor: "#fafafa",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 8,
    fontFamily: "Wotfard",
    color: "#666",
    marginBottom: 3,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    textAlign: "center",
    color: "#000",
  },
  // Table styles with better alignment
  tableContainer: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 3,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    minHeight: 25,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    minHeight: 20,
  },
  // Column definitions with exact widths that sum to 100%
  colDate: {
    width: "8%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colType: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colInvoice: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colBillDetails: {
    width: "14%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colBillAmount: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  colAmountPaid: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  colBalance: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  colEntryBy: {
    width: "8%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colComments: {
    width: "20%",
    padding: 3,
    justifyContent: "center",
  },
  // Text styles
  headerText: {
    fontSize: 8,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    textAlign: "center",
    color: "#333",
  },
  cellText: {
    fontSize: 7,
    fontFamily: "Wotfard",
    color: "#000",
  },
  cellTextCenter: {
    fontSize: 7,
    fontFamily: "Wotfard",
    textAlign: "center",
    color: "#000",
  },
  cellTextRight: {
    fontSize: 7,
    fontFamily: "Wotfard",
    textAlign: "right",
    color: "#000",
  },
  typeBadge: {
    fontSize: 6,
    fontFamily: "Wotfard",
    textAlign: "center",
    padding: 2,
    borderRadius: 2,
    fontWeight: "bold",
  },
  typeBill: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
  },
  typeSalesmanBill: {
    backgroundColor: "#e8f5e9",
    color: "#388e3c",
  },
  typePayment: {
    backgroundColor: "#f3e5f5",
    color: "#7b1fa2",
  },
  // Summary section
  financialSummary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryRowLabel: {
    fontSize: 10,
    fontFamily: "Wotfard",
    color: "#333",
  },
  summaryRowValue: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    color: "#000",
  },
  outstandingBalance: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    color: "#d32f2f",
    textAlign: "center",
    marginTop: 5,
    padding: 5,
    backgroundColor: "#ffebee",
    borderRadius: 3,
  },
  // Product sales styles
  productSalesContainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  productSalesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  productSaleItem: {
    width: "48%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 3,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productNameContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    color: "#000",
  },
  productUnit: {
    fontSize: 7,
    fontFamily: "Wotfard",
    color: "#666",
  },
  productQuantity: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    color: "#2196f3",
    textAlign: "right",
  },
});

interface CustomerLedgerReportProps {
  customer: Customer;
  ledgerData: LedgerEntry[];
  summary: LedgerSummary;
  fromDate: string;
  toDate: string;
  productSales: ProductSale[];
}

export function CustomerLedgerReport({
  customer,
  ledgerData,
  summary,
  fromDate,
  toDate,
  productSales,
}: CustomerLedgerReportProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatNumber = (num: number) => {
    return normalizeNumberString(new Intl.NumberFormat("en-IN").format(num));
  };

  const totalBillsTillDate =
    summary.totalBillsBefore +
    ledgerData.reduce((sum, entry) => sum + entry.billAmount, 0);
  const totalPaymentTillDate =
    summary.totalPaidBefore +
    ledgerData.reduce((sum, entry) => sum + entry.amountPaid, 0);
  const totalDebtTillDate =
    (customer?.openingBalance || 0) +
    summary.totalBillsBefore -
    summary.totalPaidBefore +
    ledgerData.reduce(
      (sum, entry) => sum + entry.billAmount - entry.amountPaid,
      0
    );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CUSTOMER LEDGER REPORT</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString("en-IN")} at{" "}
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
          <Text style={styles.customerInfo}>{customer.customerName}</Text>
          <Text style={styles.periodInfo}>
            Report Period: {formatDate(fromDate)} to {formatDate(toDate)}
          </Text>
        </View>

        {/* Pre-Date Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Summary Before {formatDate(fromDate)}
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Bills</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(summary.totalBillsBefore)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(summary.totalPaidBefore)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Opening Balance</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(summary.totalDebtBefore)}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Opening Balance</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(customer.openingBalance || 0)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Credit Limit</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(customer.creditLimit)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance Date</Text>
              <Text style={styles.summaryValue}>
                {customer.openingBalanceDate
                  ? formatDate(customer.openingBalanceDate)
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.colDate}>
                <Text style={styles.headerText}>Date</Text>
              </View>
              <View style={styles.colType}>
                <Text style={styles.headerText}>Type</Text>
              </View>
              <View style={styles.colInvoice}>
                <Text style={styles.headerText}>Invoice No</Text>
              </View>
              <View style={styles.colBillDetails}>
                <Text style={styles.headerText}>Bill Details</Text>
              </View>
              <View style={styles.colBillAmount}>
                <Text style={styles.headerText}>Bill Amount</Text>
              </View>
              <View style={styles.colAmountPaid}>
                <Text style={styles.headerText}>Amount Paid</Text>
              </View>
              <View style={styles.colBalance}>
                <Text style={styles.headerText}>Balance</Text>
              </View>
              <View style={styles.colEntryBy}>
                <Text style={styles.headerText}>Entry By</Text>
              </View>
              <View style={styles.colComments}>
                <Text style={styles.headerText}>Comments</Text>
              </View>
            </View>

            {/* Table Rows */}
            {ledgerData.map((entry, index) => {
              // Determine type info
              const getTypeInfo = () => {
                if (entry.type === "payment") {
                  return { label: "Payment", style: styles.typePayment };
                } else if (entry.action === "Salesman Bill") {
                  return {
                    label: "Salesman Bill",
                    style: styles.typeSalesmanBill,
                  };
                } else if (entry.action === "Bill") {
                  return { label: "Bill", style: styles.typeBill };
                }
                return { label: "Other", style: styles.typeBill };
              };

              const typeInfo = getTypeInfo();

              return (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.colDate}>
                    <Text style={styles.cellTextCenter}>
                      {formatDate(entry.date)}
                    </Text>
                  </View>
                  <View style={styles.colType}>
                    <Text style={[styles.typeBadge, typeInfo.style]}>
                      {typeInfo.label}
                    </Text>
                  </View>
                  <View style={styles.colInvoice}>
                    <Text style={styles.cellTextCenter}>
                      {entry.invoiceNo || "-"}
                    </Text>
                  </View>
                  <View style={styles.colBillDetails}>
                    <Text style={styles.cellText}>
                      {entry.billDetails
                        ? `Bill #${entry.billDetails.billNo} (${entry.billDetails.billItems.length} items)`
                        : entry.type === "payment"
                        ? "Payment"
                        : "N/A"}
                    </Text>
                  </View>
                  <View style={styles.colBillAmount}>
                    <Text style={styles.cellTextRight}>
                      {entry.billAmount > 0
                        ? formatNumber(entry.billAmount)
                        : "-"}
                    </Text>
                  </View>
                  <View style={styles.colAmountPaid}>
                    <Text style={styles.cellTextRight}>
                      {entry.amountPaid > 0
                        ? formatNumber(entry.amountPaid)
                        : "-"}
                    </Text>
                  </View>
                  <View style={styles.colBalance}>
                    <Text style={styles.cellTextRight}>
                      {formatNumber(entry.balanceAmount)}
                    </Text>
                  </View>
                  <View style={styles.colEntryBy}>
                    <Text style={styles.cellTextCenter}>
                      {entry.entryBy || "System"}
                    </Text>
                  </View>
                  <View style={styles.colComments}>
                    <Text style={styles.cellText}>
                      {entry.comments ? entry.comments.substring(0, 25) : "-"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Product Sales Summary */}
        {productSales.length > 0 && (
          <View style={styles.productSalesContainer}>
            <Text style={styles.sectionTitle}>Product Sales Summary</Text>
            <Text
              style={{
                fontSize: 8,
                fontFamily: "Wotfard",
                color: "#666",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Products sold to customer in the selected date range
            </Text>
            <View style={styles.productSalesGrid}>
              {productSales.map((sale, index) => (
                <View style={styles.productSaleItem} key={index}>
                  <View style={styles.productNameContainer}>
                    <Text style={styles.productName}>{sale.productName}</Text>
                    <Text style={styles.productUnit}>Unit: {sale.unit}</Text>
                  </View>
                  <Text style={styles.productQuantity}>
                    {formatNumber(sale.quantity)} {sale.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Financial Summary */}
        <View style={styles.financialSummary}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Total Bills Till Date:</Text>
            <Text style={styles.summaryRowValue}>
              {formatNumber(totalBillsTillDate)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>
              Total Payments Till Date:
            </Text>
            <Text style={styles.summaryRowValue}>
              {formatNumber(totalPaymentTillDate)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Transactions in Period:</Text>
            <Text style={styles.summaryRowValue}>
              {ledgerData.length} entries
            </Text>
          </View>

          <Text style={styles.outstandingBalance}>
            Outstanding Balance: {formatNumber(totalDebtTillDate)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

interface CustomerLedgerReportViewerProps {
  customer: Customer;
  ledgerData: LedgerEntry[];
  summary: LedgerSummary;
  fromDate: string;
  toDate: string;
  productSales: ProductSale[];
}

export function CustomerLedgerReportViewer({
  customer,
  ledgerData,
  summary,
  fromDate,
  toDate,
  productSales,
}: CustomerLedgerReportViewerProps) {
  return (
    <div className="w-full h-screen bg-gray-100">
      <PDFViewer
        width="100%"
        height="100%"
        style={{
          border: "none",
        }}
        showToolbar={true}
      >
        <CustomerLedgerReport
          customer={customer}
          ledgerData={ledgerData}
          summary={summary}
          fromDate={fromDate}
          toDate={toDate}
          productSales={productSales}
        />
      </PDFViewer>
    </div>
  );
}
