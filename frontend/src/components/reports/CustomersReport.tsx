import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from '@react-pdf/renderer';
import type { Customer } from '@/types';
import type { CustomerSummary } from '@/types/ledger';
import { normalizeNumberString } from '@/lib/utils/index';

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
  colCustomerName: {
    width: '16%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colPhoneNumber: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colGstNumber: {
    width: '13%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colPanNumber: {
    width: '12%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colCreditLimit: {
    width: '8%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colOpeningBalance: {
    width: '8%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colTotalBills: {
    width: '8%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colTotalPaid: {
    width: '8%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colBalance: {
    width: '8%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colBalanceDate: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
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
});

interface CustomersReportProps {
  customers: Customer[];
  customerSummaries: CustomerSummary[];
}

export function CustomersReport({
  customers,
  customerSummaries,
}: CustomersReportProps) {
  const formatNumber = (num: number) => {
    return normalizeNumberString(new Intl.NumberFormat('en-IN').format(num));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const totalCustomers = customers.length;
  const totalCreditLimit = customers.reduce(
    (sum, customer) => sum + customer.creditLimit,
    0
  );
  const totalOpeningBalance = customers.reduce(
    (sum, customer) => sum + (customer.openingBalance || 0),
    0
  );

  // Use pre-computed customer summaries
  const customersWithFinancials = customers.map((customer) => {
    const summary = customerSummaries.find((s) => s.customerId === customer.id);
    return {
      ...customer,
      totalBills: summary?.totalBills || 0,
      totalPaid: summary?.totalPaid || 0,
      balance: summary?.balance || 0,
    };
  });

  const totalBillsAll = customersWithFinancials.reduce(
    (sum, c) => sum + c.totalBills,
    0
  );
  const totalPaidAll = customersWithFinancials.reduce(
    (sum, c) => sum + c.totalPaid,
    0
  );
  const totalBalanceAll = customersWithFinancials.reduce(
    (sum, c) => sum + c.balance,
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CUSTOMERS REPORT</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString('en-IN')} at{' '}
            {new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Customers</Text>
              <Text style={styles.summaryValue}>{totalCustomers}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Credit Limit</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(totalCreditLimit)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Opening Balance</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(totalOpeningBalance)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Bills</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(totalBillsAll)}
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
          </View>
        </View>

        {/* Customers Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.colCustomerName}>
                <Text style={styles.headerText}>Customer Name</Text>
              </View>
              <View style={styles.colPhoneNumber}>
                <Text style={styles.headerText}>Phone Number</Text>
              </View>
              <View style={styles.colGstNumber}>
                <Text style={styles.headerText}>GST Number</Text>
              </View>
              <View style={styles.colPanNumber}>
                <Text style={styles.headerText}>PAN Number</Text>
              </View>
              <View style={styles.colCreditLimit}>
                <Text style={styles.headerText}>Credit Limit</Text>
              </View>
              <View style={styles.colOpeningBalance}>
                <Text style={styles.headerText}>Opening Balance</Text>
              </View>
              <View style={styles.colTotalBills}>
                <Text style={styles.headerText}>Total Bills</Text>
              </View>
              <View style={styles.colTotalPaid}>
                <Text style={styles.headerText}>Total Paid</Text>
              </View>
              <View style={styles.colBalance}>
                <Text style={styles.headerText}>Balance</Text>
              </View>
              <View style={styles.colBalanceDate}>
                <Text style={styles.headerText}>Balance Date</Text>
              </View>
            </View>

            {/* Table Rows */}
            {customersWithFinancials.map((customer) => (
              <View style={styles.tableRow} key={customer.id}>
                <View style={styles.colCustomerName}>
                  <Text style={styles.cellText}>{customer.customerName}</Text>
                </View>
                <View style={styles.colPhoneNumber}>
                  <Text style={styles.cellTextCenter}>
                    {customer.phoneNumber}
                  </Text>
                </View>
                <View style={styles.colGstNumber}>
                  <Text style={styles.cellTextCenter}>
                    {customer.gstNumber}
                  </Text>
                </View>
                <View style={styles.colPanNumber}>
                  <Text style={styles.cellTextCenter}>
                    {customer.panNumber}
                  </Text>
                </View>
                <View style={styles.colCreditLimit}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(customer.creditLimit)}
                  </Text>
                </View>
                <View style={styles.colOpeningBalance}>
                  <Text style={styles.cellTextRight}>
                    {customer.openingBalance !== undefined
                      ? `${formatNumber(customer.openingBalance)}`
                      : '-'}
                  </Text>
                </View>
                <View style={styles.colTotalBills}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(customer.totalBills)}
                  </Text>
                </View>
                <View style={styles.colTotalPaid}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(customer.totalPaid)}
                  </Text>
                </View>
                <View style={styles.colBalance}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(customer.balance)}
                  </Text>
                </View>
                <View style={styles.colBalanceDate}>
                  <Text style={styles.cellTextCenter}>
                    {customer.openingBalanceDate
                      ? formatDate(customer.openingBalanceDate)
                      : '-'}
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

interface CustomersReportViewerProps {
  customers: Customer[];
  customerSummaries: CustomerSummary[];
}

export function CustomersReportViewer({
  customers,
  customerSummaries,
}: CustomersReportViewerProps) {
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
        <CustomersReport
          customers={customers}
          customerSummaries={customerSummaries}
        />
      </PDFViewer>
    </div>
  );
}
