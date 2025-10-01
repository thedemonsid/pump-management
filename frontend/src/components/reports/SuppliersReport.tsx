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
  Supplier,
  Purchase,
  FuelPurchase,
  SupplierPaymentResponse,
} from "@/types";
import { normalizeNumberString } from "@/lib/utils/index";

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
  colSupplierName: {
    width: "14%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colContactPerson: {
    width: "14%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colContactNumber: {
    width: "11%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colGstNumber: {
    width: "12%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
  },
  colOpeningBalance: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  colTotalPurchases: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    padding: 3,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  colTotalPaid: {
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
  colBalanceDate: {
    width: "5%",
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
});

interface SuppliersReportProps {
  suppliers: Supplier[];
  purchases: Purchase[];
  fuelPurchases: FuelPurchase[];
  payments: SupplierPaymentResponse[];
}

export function SuppliersReport({
  suppliers,
  purchases,
  fuelPurchases,
  payments,
}: SuppliersReportProps) {
  const formatNumber = (num: number) => {
    return normalizeNumberString(new Intl.NumberFormat("en-IN").format(num));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const totalSuppliers = suppliers.length;
  const totalOpeningBalance = suppliers.reduce(
    (sum, supplier) => sum + (supplier.openingBalance || 0),
    0
  );

  // Calculate financial data for each supplier
  const suppliersWithFinancials = suppliers.map((supplier) => {
    const supplierPurchases = purchases.filter(
      (p) => p.supplierId === supplier.id
    );
    const supplierFuelPurchases = fuelPurchases.filter(
      (fp) => fp.supplierId === supplier.id
    );
    const supplierPayments = payments.filter(
      (p) => p.supplierId === supplier.id
    );

    const totalPurchases =
      supplierPurchases.reduce((sum, p) => sum + p.amount, 0) +
      supplierFuelPurchases.reduce((sum, fp) => sum + fp.amount, 0);
    const totalPaid = supplierPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = (supplier.openingBalance || 0) + totalPurchases - totalPaid;

    return {
      ...supplier,
      totalPurchases,
      totalPaid,
      balance,
    };
  });

  const totalPurchasesAll = suppliersWithFinancials.reduce(
    (sum, s) => sum + s.totalPurchases,
    0
  );
  const totalPaidAll = suppliersWithFinancials.reduce(
    (sum, s) => sum + s.totalPaid,
    0
  );
  const totalBalanceAll = suppliersWithFinancials.reduce(
    (sum, s) => sum + s.balance,
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SUPPLIERS REPORT</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString("en-IN")} at{" "}
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Suppliers</Text>
              <Text style={styles.summaryValue}>{totalSuppliers}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Opening Balance</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(totalOpeningBalance)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Purchases</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(totalPurchasesAll)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(totalPaidAll)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Balance</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(totalBalanceAll)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Active Suppliers</Text>
              <Text style={styles.summaryValue}>{totalSuppliers}</Text>
            </View>
          </View>
        </View>

        {/* Suppliers Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplier Details</Text>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.colSupplierName}>
                <Text style={styles.headerText}>Supplier Name</Text>
              </View>
              <View style={styles.colContactPerson}>
                <Text style={styles.headerText}>Contact Person</Text>
              </View>
              <View style={styles.colContactNumber}>
                <Text style={styles.headerText}>Mobile No.</Text>
              </View>
              <View style={styles.colGstNumber}>
                <Text style={styles.headerText}>GST Number</Text>
              </View>
              <View style={styles.colOpeningBalance}>
                <Text style={styles.headerText}>Op. Balance</Text>
              </View>
              <View style={styles.colTotalPurchases}>
                <Text style={styles.headerText}>Total Purchases</Text>
              </View>
              <View style={styles.colTotalPaid}>
                <Text style={styles.headerText}>Total Paid</Text>
              </View>
              <View style={styles.colBalance}>
                <Text style={styles.headerText}>Balance</Text>
              </View>
              <View style={styles.colBalanceDate}>
                <Text style={styles.headerText}>Date</Text>
              </View>
            </View>

            {/* Table Rows */}
            {suppliersWithFinancials.map((supplier) => (
              <View style={styles.tableRow} key={supplier.id}>
                <View style={styles.colSupplierName}>
                  <Text style={styles.cellText}>{supplier.supplierName}</Text>
                </View>
                <View style={styles.colContactPerson}>
                  <Text style={styles.cellText}>
                    {supplier.contactPersonName}
                  </Text>
                </View>
                <View style={styles.colContactNumber}>
                  <Text style={styles.cellTextCenter}>
                    {supplier.contactNumber}
                  </Text>
                </View>
                <View style={styles.colGstNumber}>
                  <Text style={styles.cellTextCenter}>
                    {supplier.gstNumber}
                  </Text>
                </View>
                <View style={styles.colOpeningBalance}>
                  <Text style={styles.cellTextRight}>
                    {supplier.openingBalance != null
                      ? `${formatNumber(supplier.openingBalance)}`
                      : "-"}
                  </Text>
                </View>
                <View style={styles.colTotalPurchases}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(supplier.totalPurchases)}
                  </Text>
                </View>
                <View style={styles.colTotalPaid}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(supplier.totalPaid)}
                  </Text>
                </View>
                <View style={styles.colBalance}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(supplier.balance)}
                  </Text>
                </View>
                <View style={styles.colBalanceDate}>
                  <Text style={styles.cellTextCenter}>
                    {supplier.openingBalanceDate
                      ? formatDate(supplier.openingBalanceDate)
                      : "-"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}

interface SuppliersReportViewerProps {
  suppliers: Supplier[];
  purchases: Purchase[];
  fuelPurchases: FuelPurchase[];
  payments: SupplierPaymentResponse[];
}

export function SuppliersReportViewer({
  suppliers,
  purchases,
  fuelPurchases,
  payments,
}: SuppliersReportViewerProps) {
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
        <SuppliersReport
          suppliers={suppliers}
          purchases={purchases}
          fuelPurchases={fuelPurchases}
          payments={payments}
        />
      </PDFViewer>
    </div>
  );
}
