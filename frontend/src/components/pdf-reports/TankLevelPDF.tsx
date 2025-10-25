import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

interface TankLedgerEntry {
  date: string;
  action: string;
  volume: number;
  type: "addition" | "removal";
  level: number;
  description: string;
  supplierName?: string;
  invoiceNumber?: string;
  entryBy: string;
}

interface TankSummary {
  openingLevel: number;
  totalAdditionsInRange: number;
  totalRemovalsInRange: number;
  closingLevel: number;
}

interface TankLevelPDFProps {
  tankName: string;
  tankCapacity: number;
  data: TankLedgerEntry[];
  summary: TankSummary;
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
  tankInfo: {
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

const formatVolume = (volume: number) => {
  return (
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(volume) + " L"
  );
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function TankLevelPDF({
  tankName,
  tankCapacity,
  data,
  summary,
  fromDate,
  toDate,
}: TankLevelPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Tank Level Report</Text>
          <Text style={styles.subtitle}>{tankName}</Text>
          <Text style={styles.tankInfo}>
            Capacity: {formatVolume(tankCapacity)}
          </Text>
          <Text style={styles.dateRange}>
            Period: {formatDate(fromDate)} to {formatDate(toDate)}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Date</Text>
            <Text style={styles.col2}>Action</Text>
            <Text style={styles.col3}>Description</Text>
            <Text style={styles.col4}>Addition (L)</Text>
            <Text style={styles.col5}>Removal (L)</Text>
            <Text style={styles.col6}>Level (L)</Text>
          </View>

          {data.map((entry, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{formatDate(entry.date)}</Text>
              <Text style={styles.col2}>{entry.action}</Text>
              <Text style={styles.col3}>{entry.description}</Text>
              <Text style={styles.col4}>
                {entry.type === "addition" ? formatVolume(entry.volume) : "-"}
              </Text>
              <Text style={styles.col5}>
                {entry.type === "removal" ? formatVolume(entry.volume) : "-"}
              </Text>
              <Text style={styles.col6}>{formatVolume(entry.level)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Opening Level:</Text>
            <Text style={styles.summaryValue}>
              {formatVolume(summary.openingLevel)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Additions:</Text>
            <Text style={styles.summaryValue}>
              {formatVolume(summary.totalAdditionsInRange)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Removals:</Text>
            <Text style={styles.summaryValue}>
              {formatVolume(summary.totalRemovalsInRange)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Closing Level:</Text>
            <Text style={styles.summaryValue}>
              {formatVolume(summary.closingLevel)}
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
