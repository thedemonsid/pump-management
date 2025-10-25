import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

interface SupplierDebt {
  supplierName: string;
  address: string;
  mobile: string;
  openingBalance: number;
  purchaseAmount: number;
  paidAmount: number;
  debtAmount: number;
}

interface SupplierDebtPDFProps {
  data: SupplierDebt[];
  fromDate: string;
  toDate: string;
}

// Register font
Font.register({
  family: "Wotfard",
  src: "/fonts/wotfard-regular-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
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
    fontSize: 12,
    fontFamily: "Wotfard",
    color: "#666",
    marginBottom: 5,
  },
  dateRange: {
    fontSize: 10,
    fontFamily: "Wotfard",
    color: "#666",
    marginTop: 5,
  },
  table: {
    width: "100%",
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottom: "1pt solid #000",
    padding: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #ddd",
    padding: 5,
    minHeight: 25,
  },
  tableRowTotal: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderTop: "2pt solid #000",
    padding: 5,
    fontWeight: "bold",
  },
  col1: { width: "5%", textAlign: "center" },
  col2: { width: "15%" },
  col3: { width: "10%" },
  col4: { width: "20%", fontSize: 8 },
  col5: { width: "12.5%", textAlign: "right" },
  col6: { width: "12.5%", textAlign: "right" },
  col7: { width: "12.5%", textAlign: "right" },
  col8: { width: "12.5%", textAlign: "right" },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Wotfard",
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 11,
    fontFamily: "Wotfard",
    fontWeight: "bold",
    color: "#d32f2f",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 8,
    color: "#666",
    borderTop: "1pt solid #ddd",
    paddingTop: 10,
  },
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function SupplierDebtPDF({
  data,
  fromDate,
  toDate,
}: SupplierDebtPDFProps) {
  const totalOpeningBalance = data.reduce(
    (sum, item) => sum + item.openingBalance,
    0
  );
  const totalPurchaseAmount = data.reduce(
    (sum, item) => sum + item.purchaseAmount,
    0
  );
  const totalPaidAmount = data.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalDebtAmount = data.reduce((sum, item) => sum + item.debtAmount, 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Supplier Debt Report</Text>
          <Text style={styles.subtitle}>Outstanding Supplier Balances</Text>
          <Text style={styles.dateRange}>
            Period: {formatDate(fromDate)} to {formatDate(toDate)}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Sr.</Text>
            <Text style={styles.col2}>Supplier Name</Text>
            <Text style={styles.col3}>Mobile</Text>
            <Text style={styles.col4}>Address</Text>
            <Text style={styles.col5}>Opening</Text>
            <Text style={styles.col6}>Purchases</Text>
            <Text style={styles.col7}>Paid</Text>
            <Text style={styles.col8}>Debt</Text>
          </View>

          {data.map((supplier, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{index + 1}</Text>
              <Text style={styles.col2}>{supplier.supplierName}</Text>
              <Text style={styles.col3}>{supplier.mobile}</Text>
              <Text style={styles.col4}>{supplier.address}</Text>
              <Text style={styles.col5}>
                {formatCurrency(supplier.openingBalance)}
              </Text>
              <Text style={styles.col6}>
                {formatCurrency(supplier.purchaseAmount)}
              </Text>
              <Text style={styles.col7}>
                {formatCurrency(supplier.paidAmount)}
              </Text>
              <Text style={styles.col8}>
                {formatCurrency(supplier.debtAmount)}
              </Text>
            </View>
          ))}

          <View style={styles.tableRowTotal}>
            <Text
              style={{ width: "40%", textAlign: "right", paddingRight: 10 }}
            >
              Total:
            </Text>
            <Text style={styles.col5}>
              {formatCurrency(totalOpeningBalance)}
            </Text>
            <Text style={styles.col6}>
              {formatCurrency(totalPurchaseAmount)}
            </Text>
            <Text style={styles.col7}>{formatCurrency(totalPaidAmount)}</Text>
            <Text style={styles.col8}>{formatCurrency(totalDebtAmount)}</Text>
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Suppliers:</Text>
            <Text style={styles.summaryValue}>{data.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Outstanding Debt:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalDebtAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleString("en-IN")}</Text>
        </View>
      </Page>
    </Document>
  );
}
