import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from '@react-pdf/renderer';
import type { Supplier } from '@/types';
import { normalizeNumberString } from '@/lib/utils/index';

interface ProductDetails {
  productName: string;
  quantity: number;
  purchaseRate: number;
  amount: number;
  purchaseUnit: string;
  taxPercentage: number;
  tankName?: string;
  density?: number;
  dipReading?: number;
}

interface LedgerEntry {
  date: string;
  action: string;
  invoiceNo: string;
  purchaseAmount: number;
  amountPaid: number;
  balanceAmount: number;
  debtAmount: number;
  entryBy: string;
  comments: string;
  type: 'purchase' | 'fuel-purchase' | 'payment';
  productDetails?: ProductDetails;
}

interface LedgerSummary {
  totalPurchaseBefore: number;
  totalPaidBefore: number;
  totalDebtBefore: number;
}

// Register font
Font.register({
  family: 'Wotfard',
  src: '/fonts/wotfard-regular-webfont.ttf',
});

// Create styles with better responsive design
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 10,
    fontSize: 8,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '1pt solid #000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Wotfard',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Wotfard',
    color: '#666',
    marginBottom: 3,
  },
  supplierInfo: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Wotfard',
    marginBottom: 5,
    color: '#000',
  },
  periodInfo: {
    fontSize: 10,
    fontFamily: 'Wotfard',
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Wotfard',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    padding: 5,
    textAlign: 'center',
    borderRadius: 2,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 5,
  },
  summaryItem: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 3,
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 8,
    fontFamily: 'Wotfard',
    color: '#666',
    marginBottom: 3,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Wotfard',
    textAlign: 'center',
    color: '#000',
  },
  // Table styles with better alignment
  tableContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    minHeight: 25,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    minHeight: 20,
  },
  // Column definitions with exact widths that sum to 100%
  colDate: {
    width: '8%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colInvoice: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colProduct: {
    width: '18%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colQuantity: {
    width: '12%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colRate: {
    width: '8%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colPurchase: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colPaid: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colBalance: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colEntry: {
    width: '8%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colComments: {
    width: '6%',
    padding: 3,
    justifyContent: 'center',
  },
  // Text styles
  headerText: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'Wotfard',
    textAlign: 'center',
    color: '#333',
  },
  cellText: {
    fontSize: 7,
    fontFamily: 'Wotfard',
    color: '#000',
  },
  cellTextCenter: {
    fontSize: 7,
    fontFamily: 'Wotfard',
    textAlign: 'center',
    color: '#000',
  },
  cellTextRight: {
    fontSize: 7,
    fontFamily: 'Wotfard',
    textAlign: 'right',
    color: '#000',
  },
  // Summary section
  financialSummary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryRowLabel: {
    fontSize: 10,
    fontFamily: 'Wotfard',
    color: '#333',
  },
  summaryRowValue: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Wotfard',
    color: '#000',
  },
  outstandingBalance: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Wotfard',
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 5,
    padding: 5,
    backgroundColor: '#ffebee',
    borderRadius: 3,
  },
});

interface SupplierLedgerReportProps {
  supplier: Supplier;
  ledgerData: LedgerEntry[];
  summary: LedgerSummary;
  fromDate: string;
  toDate: string;
}

export function SupplierLedgerReport({
  supplier,
  ledgerData,
  summary,
  fromDate,
  toDate,
}: SupplierLedgerReportProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatNumber = (num: number) => {
    return normalizeNumberString(new Intl.NumberFormat('en-IN').format(num));
  };

  const totalPurchaseTillDate =
    summary.totalPurchaseBefore +
    ledgerData.reduce((sum, entry) => sum + entry.purchaseAmount, 0);
  const totalPaymentTillDate =
    summary.totalPaidBefore +
    ledgerData.reduce((sum, entry) => sum + entry.amountPaid, 0);
  const totalDebtTillDate =
    (supplier?.openingBalance || 0) +
    summary.totalPurchaseBefore -
    summary.totalPaidBefore +
    ledgerData.reduce(
      (sum, entry) => sum + entry.purchaseAmount - entry.amountPaid,
      0
    );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SUPPLIER LEDGER REPORT</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString('en-IN')} at{' '}
            {new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
          <Text style={styles.supplierInfo}>{supplier.supplierName}</Text>
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
              <Text style={styles.summaryLabel}>Total Purchase</Text>
              <Text style={styles.summaryValue}>
                {summary.totalPurchaseBefore}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={styles.summaryValue}>{summary.totalPaidBefore}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Opening Balance</Text>
              <Text style={styles.summaryValue}>{summary.totalDebtBefore}</Text>
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
                {supplier.openingBalance || 0}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>GST Number</Text>
              <Text style={styles.summaryValue}>
                {supplier.gstNumber || 'N/A'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance Date</Text>
              <Text style={styles.summaryValue}>
                {supplier.openingBalanceDate
                  ? formatDate(supplier.openingBalanceDate)
                  : 'N/A'}
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
              <View style={styles.colInvoice}>
                <Text style={styles.headerText}>Invoice No</Text>
              </View>
              <View style={styles.colProduct}>
                <Text style={styles.headerText}>Product Name</Text>
              </View>
              <View style={styles.colQuantity}>
                <Text style={styles.headerText}>Quantity</Text>
              </View>
              <View style={styles.colRate}>
                <Text style={styles.headerText}>Rate</Text>
              </View>
              <View style={styles.colPurchase}>
                <Text style={styles.headerText}>Purchase</Text>
              </View>
              <View style={styles.colPaid}>
                <Text style={styles.headerText}>Paid</Text>
              </View>
              <View style={styles.colBalance}>
                <Text style={styles.headerText}>Balance</Text>
              </View>
              <View style={styles.colEntry}>
                <Text style={styles.headerText}>Entry By</Text>
              </View>
              <View style={styles.colComments}>
                <Text style={styles.headerText}>Notes</Text>
              </View>
            </View>

            {/* Table Rows */}
            {ledgerData.map((entry, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.colDate}>
                  <Text style={styles.cellTextCenter}>
                    {formatDate(entry.date)}
                  </Text>
                </View>
                <View style={styles.colInvoice}>
                  <Text style={styles.cellTextCenter}>
                    {entry.invoiceNo || '-'}
                  </Text>
                </View>
                <View style={styles.colProduct}>
                  <Text style={styles.cellText}>
                    {entry.productDetails?.productName ||
                      (entry.type === 'payment' ? 'Payment' : 'N/A')}
                  </Text>
                </View>
                <View style={styles.colQuantity}>
                  <Text style={styles.cellTextCenter}>
                    {entry.productDetails?.quantity
                      ? `${formatNumber(entry.productDetails.quantity)} ${
                          entry.productDetails.purchaseUnit || ''
                        }`
                      : '-'}
                  </Text>
                </View>
                <View style={styles.colRate}>
                  <Text style={styles.cellTextRight}>
                    {entry.productDetails?.purchaseRate
                      ? formatNumber(entry.productDetails.purchaseRate)
                      : '-'}
                  </Text>
                </View>
                <View style={styles.colPurchase}>
                  <Text style={styles.cellTextRight}>
                    {entry.purchaseAmount > 0
                      ? formatNumber(entry.purchaseAmount)
                      : '-'}
                  </Text>
                </View>
                <View style={styles.colPaid}>
                  <Text style={styles.cellTextRight}>
                    {entry.amountPaid > 0
                      ? formatNumber(entry.amountPaid)
                      : '-'}
                  </Text>
                </View>
                <View style={styles.colBalance}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(entry.balanceAmount)}
                  </Text>
                </View>
                <View style={styles.colEntry}>
                  <Text style={styles.cellTextCenter}>
                    {entry.entryBy || 'System'}
                  </Text>
                </View>
                <View style={styles.colComments}>
                  <Text style={styles.cellText}>
                    {entry.comments ? entry.comments.substring(0, 15) : '-'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.financialSummary}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>
              Total Purchase Till Date:
            </Text>
            <Text style={styles.summaryRowValue}>{totalPurchaseTillDate}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>
              Total Payments Till Date:
            </Text>
            <Text style={styles.summaryRowValue}>{totalPaymentTillDate}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Transactions in Period:</Text>
            <Text style={styles.summaryRowValue}>
              {ledgerData.length} entries
            </Text>
          </View>

          <Text style={styles.outstandingBalance}>
            Outstanding Balance: {totalDebtTillDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

interface SupplierLedgerReportViewerProps {
  supplier: Supplier;
  ledgerData: LedgerEntry[];
  summary: LedgerSummary;
  fromDate: string;
  toDate: string;
}

export function SupplierLedgerReportViewer({
  supplier,
  ledgerData,
  summary,
  fromDate,
  toDate,
}: SupplierLedgerReportViewerProps) {
  return (
    <div className="w-full h-screen bg-gray-100">
      <PDFViewer
        width="100%"
        height="100%"
        style={{
          border: 'none',
        }}
        showToolbar={true}
      >
        <SupplierLedgerReport
          supplier={supplier}
          ledgerData={ledgerData}
          summary={summary}
          fromDate={fromDate}
          toDate={toDate}
        />
      </PDFViewer>
    </div>
  );
}
