import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

interface CustomerCredit {
  customerName: string;
  address: string;
  mobile: string;
  openingBalance: number;
  billAmount: number;
  paidAmount: number;
  salesmanBillAmount: number;
  salesmanPaidAmount: number;
  creditAmount: number;
}

interface CustomerCreditPDFProps {
  data: CustomerCredit[];
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
  col4: { width: "15%", fontSize: 8 },
  col5: { width: "11%", textAlign: "right" },
  col6: { width: "11%", textAlign: "right" },
  col7: { width: "11%", textAlign: "right" },
  col8: { width: "11%", textAlign: "right" },
  col9: { width: "11%", textAlign: "right" },
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
    minimumFractionDigits: 0,
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

export function CustomerCreditPDF({
  data,
  fromDate,
  toDate,
}: CustomerCreditPDFProps) {
  const totalOpeningBalance = data.reduce(
    (sum, item) => sum + item.openingBalance,
    0
  );
  const totalBillAmount = data.reduce((sum, item) => sum + item.billAmount, 0);
  const totalPaidAmount = data.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalSalesmanBillAmount = data.reduce(
    (sum, item) => sum + item.salesmanBillAmount,
    0
  );
  const totalSalesmanPaidAmount = data.reduce(
    (sum, item) => sum + item.salesmanPaidAmount,
    0
  );
  const totalCreditAmount = data.reduce(
    (sum, item) => sum + item.creditAmount,
    0
  );

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Customer Credit Report</Text>
          <Text style={styles.subtitle}>Outstanding Customer Balances</Text>
          <Text style={styles.dateRange}>
            Period: {formatDate(fromDate)} to {formatDate(toDate)}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Sr.</Text>
            <Text style={styles.col2}>Customer Name</Text>
            <Text style={styles.col3}>Mobile</Text>
            <Text style={styles.col4}>Address</Text>
            <Text style={styles.col5}>Opening</Text>
            <Text style={styles.col6}>Bills</Text>
            <Text style={styles.col7}>Paid</Text>
            <Text style={styles.col8}>S.Bill</Text>
            <Text style={styles.col9}>S.Paid</Text>
            <Text style={styles.col5}>Credit</Text>
          </View>

          {data.map((customer, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{index + 1}</Text>
              <Text style={styles.col2}>{customer.customerName}</Text>
              <Text style={styles.col3}>{customer.mobile}</Text>
              <Text style={styles.col4}>{customer.address}</Text>
              <Text style={styles.col5}>
                {formatCurrency(customer.openingBalance)}
              </Text>
              <Text style={styles.col6}>
                {formatCurrency(customer.billAmount)}
              </Text>
              <Text style={styles.col7}>
                {formatCurrency(customer.paidAmount)}
              </Text>
              <Text style={styles.col8}>
                {formatCurrency(customer.salesmanBillAmount)}
              </Text>
              <Text style={styles.col9}>
                {formatCurrency(customer.salesmanPaidAmount)}
              </Text>
              <Text style={styles.col5}>
                {formatCurrency(customer.creditAmount)}
              </Text>
            </View>
          ))}

          <View style={styles.tableRowTotal}>
            <Text
              style={{ width: "45%", textAlign: "right", paddingRight: 10 }}
            >
              Total:
            </Text>
            <Text style={styles.col5}>
              {formatCurrency(totalOpeningBalance)}
            </Text>
            <Text style={styles.col6}>{formatCurrency(totalBillAmount)}</Text>
            <Text style={styles.col7}>{formatCurrency(totalPaidAmount)}</Text>
            <Text style={styles.col8}>
              {formatCurrency(totalSalesmanBillAmount)}
            </Text>
            <Text style={styles.col9}>
              {formatCurrency(totalSalesmanPaidAmount)}
            </Text>
            <Text style={styles.col5}>{formatCurrency(totalCreditAmount)}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleString("en-IN")}</Text>
        </View>
      </Page>
    </Document>
  );
}
