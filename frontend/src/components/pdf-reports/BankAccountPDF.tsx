import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

interface BankAccountLedgerEntry {
  date: string;
  action: string;
  reference: string;
  credit: number;
  debit: number;
  balance: number;
  entryBy: string;
  description: string;
  type: "credit" | "debit";
}

interface BankAccountSummary {
  openingBalance: number;
  totalCreditsInRange: number;
  totalDebitsInRange: number;
  closingBalance: number;
}

interface BankAccountPDFProps {
  accountName: string;
  accountNumber: string;
  data: BankAccountLedgerEntry[];
  summary: BankAccountSummary;
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
  accountInfo: {
    fontSize: 11,
    fontFamily: "Wotfard",
    color: "#444",
    marginBottom: 3,
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
    minHeight: 20,
  },
  tableRowTotal: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderTop: "2pt solid #000",
    padding: 5,
    fontWeight: "bold",
  },
  col1: { width: "12%", fontSize: 9 },
  col2: { width: "15%", fontSize: 9 },
  col3: { width: "28%", fontSize: 8 },
  col4: { width: "15%", textAlign: "right" },
  col5: { width: "15%", textAlign: "right" },
  col6: { width: "15%", textAlign: "right" },
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

export function BankAccountPDF({
  accountName,
  accountNumber,
  data,
  summary,
  fromDate,
  toDate,
}: BankAccountPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Bank Account Statement</Text>
          <Text style={styles.subtitle}>{accountName}</Text>
          <Text style={styles.accountInfo}>Account No: {accountNumber}</Text>
          <Text style={styles.dateRange}>
            Period: {formatDate(fromDate)} to {formatDate(toDate)}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Date</Text>
            <Text style={styles.col2}>Type</Text>
            <Text style={styles.col3}>Description</Text>
            <Text style={styles.col4}>Credits</Text>
            <Text style={styles.col5}>Debits</Text>
            <Text style={styles.col6}>Balance</Text>
          </View>

          {data.map((entry, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{formatDate(entry.date)}</Text>
              <Text style={styles.col2}>{entry.action}</Text>
              <Text style={styles.col3}>{entry.description}</Text>
              <Text style={styles.col4}>
                {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
              </Text>
              <Text style={styles.col5}>
                {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
              </Text>
              <Text style={styles.col6}>{formatCurrency(entry.balance)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Opening Balance:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary.openingBalance)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Credits:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary.totalCreditsInRange)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Debits:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary.totalDebitsInRange)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Closing Balance:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(summary.closingBalance)}
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
