import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";
import type {
  SalesmanShiftAccountingResponse,
  NozzleAssignmentResponse,
  SalesmanBillPaymentResponse,
  ExpenseResponse,
  ShiftResponse,
} from "@/types";
import { normalizeNumberString } from "@/lib/utils/index";

// Register font
Font.register({
  family: "Wotfard",
  src: "/fonts/wotfard-regular-webfont.ttf",
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 15,
    fontSize: 9,
  },
  header: {
    marginBottom: 15,
    textAlign: "center",
    borderBottom: "2pt solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
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
  shiftInfo: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    marginBottom: 5,
    color: "#000",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    marginBottom: 6,
    backgroundColor: "#f0f0f0",
    padding: 5,
    textAlign: "center",
    borderRadius: 2,
  },
  // Table styles
  tableContainer: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    minHeight: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    minHeight: 18,
  },
  tableRowHighlight: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    minHeight: 18,
  },
  tableRowTotal: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    minHeight: 20,
  },
  // Column widths for nozzle table
  colNozzle: {
    width: "20%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colProduct: {
    width: "20%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colLitres: {
    width: "20%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  colRate: {
    width: "20%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  colAmount: {
    width: "20%",
    padding: 3,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  // Simple 2-column layout
  colDescription: {
    width: "60%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colValue: {
    width: "40%",
    padding: 3,
    justifyContent: "center",
    alignItems: "flex-end",
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
  cellTextBold: {
    fontSize: 8,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    color: "#000",
  },
  cellTextBoldRight: {
    fontSize: 8,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    textAlign: "right",
    color: "#000",
  },
  greenText: {
    color: "#388e3c",
  },
  redText: {
    color: "#d32f2f",
  },
  blueText: {
    color: "#1976d2",
  },
  balanceSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#fff3e0",
    borderWidth: 1,
    borderColor: "#ff9800",
    borderRadius: 3,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    textAlign: "center",
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    textAlign: "center",
  },
});

interface ShiftAccountingReportProps {
  shift: ShiftResponse;
  accounting: SalesmanShiftAccountingResponse;
  nozzles: NozzleAssignmentResponse[];
  payments: SalesmanBillPaymentResponse[];
  expenses: ExpenseResponse[];
}

export function ShiftAccountingReport({
  shift,
  accounting,
  nozzles,
}: ShiftAccountingReportProps) {
  // payments and expenses are available but currently not displayed separately
  // as they're already included in the accounting totals
  const formatNumber = (num: number) => {
    return normalizeNumberString(
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num)
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // All values are calculated by backend and available in accounting object

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SHIFT ACCOUNTING REPORT</Text>
          <Text style={styles.subtitle}>
            Daily Fuel Sales & Reconciliation Sheet
          </Text>
          <Text style={styles.subtitle}>
            Generated on {formatDateTime(new Date().toISOString())}
          </Text>
          <Text style={styles.shiftInfo}>
            Salesman: {shift.salesmanUsername}
          </Text>
          <Text style={styles.subtitle}>
            Shift: {formatDateTime(shift.startDatetime)}
            {shift.endDatetime && ` to ${formatDateTime(shift.endDatetime)}`}
          </Text>
        </View>

        {/* Fuel Sales Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fuel Sales Summary</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.colNozzle}>
                <Text style={styles.headerText}>Nozzle</Text>
              </View>
              <View style={styles.colProduct}>
                <Text style={styles.headerText}>Product</Text>
              </View>
              <View style={styles.colLitres}>
                <Text style={styles.headerText}>Litres</Text>
              </View>
              <View style={styles.colRate}>
                <Text style={styles.headerText}>Rate</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.headerText}>Amount</Text>
              </View>
            </View>

            {nozzles.map((nozzle, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.colNozzle}>
                  <Text style={styles.cellTextCenter}>{nozzle.nozzleName}</Text>
                </View>
                <View style={styles.colProduct}>
                  <Text style={styles.cellTextCenter}>
                    {nozzle.productName || "-"}
                  </Text>
                </View>
                <View style={styles.colLitres}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(nozzle.dispensedAmount || 0)}
                  </Text>
                </View>
                <View style={styles.colRate}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(nozzle.productRate || 0)}
                  </Text>
                </View>
                <View style={styles.colAmount}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(nozzle.totalAmount || 0)}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.tableRowHighlight}>
              <View style={styles.colNozzle}>
                <Text style={styles.cellTextBold}>Total Fuel Sales</Text>
              </View>
              <View style={styles.colProduct}>
                <Text style={styles.cellText}></Text>
              </View>
              <View style={styles.colLitres}>
                <Text style={styles.cellText}></Text>
              </View>
              <View style={styles.colRate}>
                <Text style={styles.cellText}></Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.cellTextBoldRight}>
                  {formatNumber(accounting.fuelSales)}
                </Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colNozzle}>
                <Text style={styles.cellText}>Customer Receipts</Text>
              </View>
              <View style={styles.colProduct}>
                <Text style={styles.cellText}></Text>
              </View>
              <View style={styles.colLitres}>
                <Text style={styles.cellText}></Text>
              </View>
              <View style={styles.colRate}>
                <Text style={styles.cellText}></Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={[styles.cellTextRight, styles.greenText]}>
                  {formatNumber(accounting.customerReceipt)}
                </Text>
              </View>
            </View>

            <View style={styles.tableRowTotal}>
              <View style={styles.colNozzle}>
                <Text style={styles.cellTextBold}>
                  Total (Fuel Sales + Receipts)
                </Text>
              </View>
              <View style={styles.colProduct}>
                <Text style={styles.cellText}></Text>
              </View>
              <View style={styles.colLitres}>
                <Text style={styles.cellText}></Text>
              </View>
              <View style={styles.colRate}>
                <Text style={styles.cellText}></Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.cellTextBoldRight}>
                  {formatNumber(
                    accounting.fuelSales + accounting.customerReceipt
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Non-Cash / Digital Sales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Non-Cash / Digital Sales</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.colDescription}>
                <Text style={styles.headerText}>Payment Type</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={styles.headerText}>Amount</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>UPI Sales</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={styles.cellTextRight}>
                  {formatNumber(accounting.upiReceived)}
                </Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>Card Sales</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={styles.cellTextRight}>
                  {formatNumber(accounting.cardReceived)}
                </Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>Fleet Card Sales</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={styles.cellTextRight}>
                  {formatNumber(accounting.fleetCardReceived)}
                </Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>Credit Sales</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={[styles.cellTextRight, styles.redText]}>
                  {formatNumber(accounting.credit)}
                </Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>Expenses</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={[styles.cellTextRight, styles.redText]}>
                  {formatNumber(accounting.expenses)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reconciliation Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reconciliation Summary</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.colDescription}>
                <Text style={styles.headerText}>Description</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={styles.headerText}>Amount</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={styles.cellTextBold}>Opening Cash</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={styles.cellTextBoldRight}>
                  {formatNumber(accounting.openingCash)}
                </Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>Add: Total Sales Expected</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={styles.cellTextRight}>
                  {formatNumber(accounting.systemReceivedAmount)}
                </Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>Less: Non-Cash Sales</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={[styles.cellTextRight, styles.redText]}>
                  -
                  {formatNumber(
                    accounting.upiReceived +
                      accounting.cardReceived +
                      accounting.fleetCardReceived +
                      accounting.credit
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>Less: Expenses</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={[styles.cellTextRight, styles.redText]}>
                  -{formatNumber(accounting.expenses)}
                </Text>
              </View>
            </View>

            <View style={styles.tableRowHighlight}>
              <View style={styles.colDescription}>
                <Text style={styles.cellTextBold}>Actual Cash in Hand</Text>
              </View>
              <View style={styles.colValue}>
                <Text style={styles.cellTextBoldRight}>
                  {formatNumber(accounting.cashInHand)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceText}>Balance / Difference</Text>
          <Text
            style={[
              styles.balanceAmount,
              accounting.balanceAmount === 0
                ? styles.greenText
                : accounting.balanceAmount > 0
                ? styles.blueText
                : styles.redText,
            ]}
          >
            {accounting.balanceAmount >= 0 ? "+" : ""}
            {formatNumber(accounting.balanceAmount)}
          </Text>
          {accounting.balanceAmount !== 0 && (
            <Text style={styles.subtitle}>
              {accounting.balanceAmount > 0
                ? `Excess cash of ${formatNumber(
                    accounting.balanceAmount
                  )} in hand`
                : `Cash shortage of ${formatNumber(
                    Math.abs(accounting.balanceAmount)
                  )} detected`}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

interface ShiftAccountingReportViewerProps {
  shift: ShiftResponse;
  accounting: SalesmanShiftAccountingResponse;
  nozzles: NozzleAssignmentResponse[];
  payments: SalesmanBillPaymentResponse[];
  expenses: ExpenseResponse[];
}

export function ShiftAccountingReportViewer({
  shift,
  accounting,
  nozzles,
  payments,
  expenses,
}: ShiftAccountingReportViewerProps) {
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
        <ShiftAccountingReport
          shift={shift}
          accounting={accounting}
          nozzles={nozzles}
          payments={payments}
          expenses={expenses}
        />
      </PDFViewer>
    </div>
  );
}
