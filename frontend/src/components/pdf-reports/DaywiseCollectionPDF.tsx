import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type {
  CustomerBillPaymentResponse,
  SalesmanBillPaymentResponse,
} from "@/types";

interface CollectionData {
  customerPayments: CustomerBillPaymentResponse[];
  salesmanPayments: SalesmanBillPaymentResponse[];
  totalCustomerPayments: number;
  totalSalesmanPayments: number;
  grandTotal: number;
}

interface DaywiseCollectionPDFProps {
  data: CollectionData;
  selectedDate: string;
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Wotfard",
    marginTop: 15,
    marginBottom: 10,
    color: "#333",
  },
  table: {
    width: "100%",
    marginBottom: 5,
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

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function DaywiseCollectionPDF({
  data,
  selectedDate,
}: DaywiseCollectionPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Daywise Collection Report</Text>
          <Text style={styles.subtitle}>Money Collection Summary</Text>
          <Text style={styles.dateRange}>Date: {formatDate(selectedDate)}</Text>
        </View>

        {/* All Payments Combined */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ width: "7%", textAlign: "center" }}>Sr.</Text>
            <Text style={{ width: "12%" }}>Type</Text>
            <Text style={{ width: "12%", textAlign: "center" }}>Time</Text>
            <Text style={{ width: "25%" }}>Customer Name</Text>
            <Text style={{ width: "20%" }}>Payment Method</Text>
            <Text style={{ width: "24%", textAlign: "right" }}>Amount</Text>
          </View>

          {/* Customer Payments */}
          {data.customerPayments.map((payment, index) => (
            <View key={`customer-${payment.id}`} style={styles.tableRow}>
              <Text style={{ width: "7%", textAlign: "center" }}>
                {index + 1}
              </Text>
              <Text
                style={{ width: "12%", color: "#2563eb", fontWeight: "bold" }}
              >
                Customer
              </Text>
              <Text style={{ width: "12%", textAlign: "center" }}>
                {formatTime(payment.paymentDate)}
              </Text>
              <Text style={{ width: "25%" }}>{payment.customerName}</Text>
              <Text style={{ width: "20%" }}>{payment.paymentMethod}</Text>
              <Text style={{ width: "24%", textAlign: "right" }}>
                {formatCurrency(payment.amount)}
              </Text>
            </View>
          ))}

          {/* Salesman Payments */}
          {data.salesmanPayments.map((payment, index) => (
            <View key={`salesman-${payment.id}`} style={styles.tableRow}>
              <Text style={{ width: "7%", textAlign: "center" }}>
                {data.customerPayments.length + index + 1}
              </Text>
              <Text
                style={{ width: "12%", color: "#9333ea", fontWeight: "bold" }}
              >
                Salesman
              </Text>
              <Text style={{ width: "12%", textAlign: "center" }}>
                {formatTime(payment.paymentDate)}
              </Text>
              <Text style={{ width: "25%" }}>{payment.customerName}</Text>
              <Text style={{ width: "20%" }}>{payment.paymentMethod}</Text>
              <Text style={{ width: "24%", textAlign: "right" }}>
                {formatCurrency(payment.amount)}
              </Text>
            </View>
          ))}

          {/* Total Row */}
          <View style={styles.tableRowTotal}>
            <Text
              style={{ width: "76%", textAlign: "right", paddingRight: 10 }}
            >
              Total:
            </Text>
            <Text style={{ width: "24%", textAlign: "right" }}>
              {formatCurrency(data.grandTotal)}
            </Text>
          </View>
        </View>

        {/* Summary Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ width: "33.33%", paddingLeft: 5 }}>
              Customer Payments
            </Text>
            <Text style={{ width: "33.33%", paddingLeft: 5 }}>
              Salesman Payments
            </Text>
            <Text style={{ width: "33.34%", paddingLeft: 5 }}>Grand Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text
              style={{
                width: "33.33%",
                paddingLeft: 5,
                fontWeight: "bold",
                color: "#16a34a",
              }}
            >
              {formatCurrency(data.totalCustomerPayments)}
            </Text>
            <Text
              style={{
                width: "33.33%",
                paddingLeft: 5,
                fontWeight: "bold",
                color: "#16a34a",
              }}
            >
              {formatCurrency(data.totalSalesmanPayments)}
            </Text>
            <Text
              style={{
                width: "33.34%",
                paddingLeft: 5,
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              {formatCurrency(data.grandTotal)}
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
