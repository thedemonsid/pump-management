import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

interface ExpenseData {
  id: string;
  referenceNumber: string;
  expenseHeadName: string;
  amount: number;
  expenseDate: string;
  description?: string;
}

interface HeadWiseTotal {
  expenseHeadName: string;
  amount: number;
  count: number;
}

interface ExpensePDFProps {
  data: ExpenseData[];
  headWiseTotals: HeadWiseTotal[];
  fromDate: string;
  toDate: string;
  totalAmount: number;
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
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    marginBottom: 10,
    color: "#333",
    borderBottom: "1pt solid #ddd",
    paddingBottom: 5,
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
    minHeight: 20,
  },
  tableRowTotal: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderTop: "2pt solid #000",
    padding: 5,
    fontWeight: "bold",
  },
  col1: { width: "5%", textAlign: "center" },
  col2: { width: "12%", textAlign: "center" },
  col3: { width: "15%" },
  col4: { width: "20%" },
  col5: { width: "30%", fontSize: 8 },
  col6: { width: "18%", textAlign: "right" },
  summaryBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    border: "1pt solid #ddd",
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    paddingVertical: 3,
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
  headWiseBox: {
    marginTop: 10,
  },
  headWiseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    borderBottom: "0.5pt solid #ddd",
  },
  headWiseName: {
    fontSize: 10,
    fontFamily: "Wotfard",
    width: "50%",
  },
  headWiseDetails: {
    fontSize: 9,
    fontFamily: "Wotfard",
    color: "#666",
    width: "25%",
    textAlign: "center",
  },
  headWiseAmount: {
    fontSize: 10,
    fontFamily: "Wotfard",
    fontWeight: "bold",
    width: "25%",
    textAlign: "right",
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

export function ExpensePDF({
  data,
  headWiseTotals,
  fromDate,
  toDate,
  totalAmount,
}: ExpensePDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Expense Report</Text>
          <Text style={styles.subtitle}>Comprehensive Expense Analysis</Text>
          <Text style={styles.dateRange}>
            Period: {formatDate(fromDate)} to {formatDate(toDate)}
          </Text>
        </View>

        {/* Head-wise Breakdown Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Head-wise Expense Breakdown</Text>
          <View style={styles.headWiseBox}>
            <View
              style={[
                styles.headWiseRow,
                { backgroundColor: "#f0f0f0", fontWeight: "bold" },
              ]}
            >
              <Text style={styles.headWiseName}>Expense Head</Text>
              <Text style={styles.headWiseDetails}>Count</Text>
              <Text style={styles.headWiseAmount}>Amount</Text>
            </View>
            {headWiseTotals.map((head, index) => (
              <View key={index} style={styles.headWiseRow}>
                <Text style={styles.headWiseName}>{head.expenseHeadName}</Text>
                <Text style={styles.headWiseDetails}>
                  {head.count} expense{head.count !== 1 ? "s" : ""}
                </Text>
                <Text style={styles.headWiseAmount}>
                  {formatCurrency(head.amount)}
                </Text>
              </View>
            ))}
            <View
              style={[
                styles.headWiseRow,
                { backgroundColor: "#f0f0f0", fontWeight: "bold" },
              ]}
            >
              <Text style={styles.headWiseName}>Total</Text>
              <Text style={styles.headWiseDetails}>{data.length}</Text>
              <Text style={styles.headWiseAmount}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Expense Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Expense Records</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Sr.</Text>
              <Text style={styles.col2}>Date</Text>
              <Text style={styles.col3}>Expense Head</Text>
              <Text style={styles.col4}>Reference #</Text>
              <Text style={styles.col5}>Description</Text>
              <Text style={styles.col6}>Amount</Text>
            </View>

            {data.map((expense, index) => (
              <View key={expense.id} style={styles.tableRow}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>
                  {formatDate(expense.expenseDate)}
                </Text>
                <Text style={styles.col3}>{expense.expenseHeadName}</Text>
                <Text style={styles.col4}>{expense.referenceNumber}</Text>
                <Text style={styles.col5}>{expense.description || "N/A"}</Text>
                <Text style={styles.col6}>
                  {formatCurrency(expense.amount)}
                </Text>
              </View>
            ))}

            <View style={styles.tableRowTotal}>
              <Text
                style={{ width: "85%", textAlign: "right", paddingRight: 10 }}
              >
                Grand Total:
              </Text>
              <Text style={styles.col6}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Summary Section - Moved to Bottom */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expenses:</Text>
            <Text style={styles.summaryValue}>{data.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Expense:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(data.length > 0 ? totalAmount / data.length : 0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expense Heads:</Text>
            <Text style={styles.summaryValue}>{headWiseTotals.length}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleString("en-IN")}</Text>
        </View>
      </Page>
    </Document>
  );
}
