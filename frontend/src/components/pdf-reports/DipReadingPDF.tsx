import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

interface DipReading {
  readingTimestamp: string;
  dipLevel?: number;
  temperature?: number;
  density?: number;
  fuelLevelLitres?: number;
  fuelLevelSystem?: number;
  variance?: number;
  remarks?: string;
}

interface DipReadingPDFProps {
  tankName: string;
  productName: string;
  tankCapacity: number;
  currentLevel?: number;
  data: DipReading[];
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
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  infoItem: {
    flexDirection: "column",
  },
  infoLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Wotfard",
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
    alignItems: "flex-start",
  },
  col1: { width: "14%", fontSize: 8, paddingRight: 3 }, // Date & Time
  col2: { width: "9%", fontSize: 8, textAlign: "right", paddingRight: 3 }, // Dip Level
  col3: { width: "8%", fontSize: 8, textAlign: "right", paddingRight: 3 }, // Temp
  col4: { width: "9%", fontSize: 8, textAlign: "right", paddingRight: 3 }, // Density
  col5: { width: "11%", fontSize: 8, textAlign: "right", paddingRight: 3 }, // Physical Level
  col6: { width: "11%", fontSize: 8, textAlign: "right", paddingRight: 3 }, // System Level
  col7: { width: "11%", fontSize: 8, textAlign: "right", paddingRight: 3 }, // Variance
  col8: { width: "27%", fontSize: 7, paddingLeft: 3 }, // Remarks
  // Header columns
  headerCol1: { width: "14%", fontSize: 8, paddingRight: 3 },
  headerCol2: { width: "9%", fontSize: 8, textAlign: "right", paddingRight: 3 },
  headerCol3: { width: "8%", fontSize: 8, textAlign: "right", paddingRight: 3 },
  headerCol4: { width: "9%", fontSize: 8, textAlign: "right", paddingRight: 3 },
  headerCol5: {
    width: "11%",
    fontSize: 8,
    textAlign: "right",
    paddingRight: 3,
  },
  headerCol6: {
    width: "11%",
    fontSize: 8,
    textAlign: "right",
    paddingRight: 3,
  },
  headerCol7: {
    width: "11%",
    fontSize: 8,
    textAlign: "right",
    paddingRight: 3,
  },
  headerCol8: { width: "27%", fontSize: 8, paddingLeft: 3 },
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
  emptyState: {
    textAlign: "center",
    padding: 20,
    fontSize: 12,
    color: "#666",
  },
});

const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function DipReadingPDF({
  tankName,
  productName,
  tankCapacity,
  currentLevel,
  data,
  fromDate,
  toDate,
}: DipReadingPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Dip Reading Report</Text>
          <Text style={styles.subtitle}>{tankName}</Text>
          <Text style={styles.tankInfo}>Product: {productName}</Text>
          <Text style={styles.dateRange}>
            Period: {formatDate(fromDate)} to {formatDate(toDate)}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tank Name</Text>
            <Text style={styles.infoValue}>{tankName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Product</Text>
            <Text style={styles.infoValue}>{productName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Capacity</Text>
            <Text style={styles.infoValue}>{formatNumber(tankCapacity)} L</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Current Level</Text>
            <Text style={styles.infoValue}>{formatNumber(currentLevel)} L</Text>
          </View>
        </View>

        {data.length === 0 ? (
          <View style={styles.emptyState}>
            <Text>No dip readings found for the selected date range.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerCol1}>Date & Time</Text>
              <Text style={styles.headerCol2}>Dip Level{"\n"}(mm)</Text>
              <Text style={styles.headerCol3}>Temp{"\n"}(°C)</Text>
              <Text style={styles.headerCol4}>Density{"\n"}(kg/m³)</Text>
              <Text style={styles.headerCol5}>Physical{"\n"}(L)</Text>
              <Text style={styles.headerCol6}>System{"\n"}(L)</Text>
              <Text style={styles.headerCol7}>Variance{"\n"}(L)</Text>
              <Text style={styles.headerCol8}>Remarks</Text>
            </View>

            {data.map((reading, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>
                  {formatDate(reading.readingTimestamp)}
                  {"\n"}
                  {formatTime(reading.readingTimestamp)}
                </Text>
                <Text style={styles.col2}>
                  {formatNumber(reading.dipLevel)}
                </Text>
                <Text style={styles.col3}>
                  {formatNumber(reading.temperature)}
                </Text>
                <Text style={styles.col4}>{formatNumber(reading.density)}</Text>
                <Text style={styles.col5}>
                  {formatNumber(reading.fuelLevelLitres)}
                </Text>
                <Text style={styles.col6}>
                  {formatNumber(reading.fuelLevelSystem)}
                </Text>
                <Text style={styles.col7}>
                  {formatNumber(reading.variance)}
                </Text>
                <Text style={styles.col8}>{reading.remarks || "—"}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text>
            Generated on {new Date().toLocaleDateString("en-IN")} at{" "}
            {new Date().toLocaleTimeString("en-IN")}
          </Text>
          <Text>Total Records: {data.length}</Text>
        </View>
      </Page>
    </Document>
  );
}
