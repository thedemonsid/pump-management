import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from '@react-pdf/renderer';
import type { BankAccount } from '@/types';
import type { BankAccountLedgerEntry } from '@/types/bank-account-ledger';
import { normalizeNumberString } from '@/lib/utils/index';

interface LedgerSummary {
  totalCreditsBefore: number;
  totalDebitsBefore: number;
  balanceBefore: number;
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
  accountInfo: {
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
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colAction: {
    width: '12%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colReference: {
    width: '15%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colCredit: {
    width: '12%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colDebit: {
    width: '12%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colBalance: {
    width: '12%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colDescription: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colEntry: {
    width: '7%',
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
  closingBalance: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Wotfard',
    textAlign: 'center',
    marginTop: 5,
    padding: 5,
    backgroundColor: '#e8f5e8',
    borderRadius: 3,
  },
});

interface BankAccountLedgerReportProps {
  bankAccount: BankAccount;
  ledgerData: BankAccountLedgerEntry[];
  summary: LedgerSummary;
  fromDate: string;
  toDate: string;
}

export function BankAccountLedgerReport({
  bankAccount,
  ledgerData,
  summary,
  fromDate,
  toDate,
}: BankAccountLedgerReportProps) {
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

  const totalCreditsTillDate =
    summary.totalCreditsBefore +
    ledgerData.reduce((sum, entry) => sum + entry.credit, 0);
  const totalDebitsTillDate =
    summary.totalDebitsBefore +
    ledgerData.reduce((sum, entry) => sum + entry.debit, 0);
  const closingBalance =
    (bankAccount?.openingBalance || 0) +
    summary.totalCreditsBefore -
    summary.totalDebitsBefore +
    ledgerData.reduce((sum, entry) => sum + entry.credit - entry.debit, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>BANK ACCOUNT LEDGER REPORT</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString('en-IN')} at{' '}
            {new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
          <Text style={styles.accountInfo}>
            {bankAccount.accountHolderName} - {bankAccount.accountNumber}
          </Text>
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
              <Text style={styles.summaryLabel}>Total Credits</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(summary.totalCreditsBefore)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Debits</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(summary.totalDebitsBefore)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(summary.balanceBefore)}
              </Text>
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
                {formatNumber(bankAccount.openingBalance || 0)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Bank Name</Text>
              <Text style={styles.summaryValue}>{bankAccount.bank}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance Date</Text>
              <Text style={styles.summaryValue}>
                {bankAccount.openingBalanceDate
                  ? formatDate(bankAccount.openingBalanceDate)
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
              <View style={styles.colAction}>
                <Text style={styles.headerText}>Action</Text>
              </View>
              <View style={styles.colReference}>
                <Text style={styles.headerText}>Reference</Text>
              </View>
              <View style={styles.colCredit}>
                <Text style={styles.headerText}>Credit</Text>
              </View>
              <View style={styles.colDebit}>
                <Text style={styles.headerText}>Debit</Text>
              </View>
              <View style={styles.colBalance}>
                <Text style={styles.headerText}>Balance</Text>
              </View>
              <View style={styles.colDescription}>
                <Text style={styles.headerText}>Description</Text>
              </View>
              <View style={styles.colEntry}>
                <Text style={styles.headerText}>Entry By</Text>
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
                <View style={styles.colAction}>
                  <Text style={styles.cellTextCenter}>{entry.action}</Text>
                </View>
                <View style={styles.colReference}>
                  <Text style={styles.cellTextCenter}>
                    {entry.reference || '-'}
                  </Text>
                </View>
                <View style={styles.colCredit}>
                  <Text style={styles.cellTextRight}>
                    {entry.credit > 0 ? formatNumber(entry.credit) : '-'}
                  </Text>
                </View>
                <View style={styles.colDebit}>
                  <Text style={styles.cellTextRight}>
                    {entry.debit > 0 ? formatNumber(entry.debit) : '-'}
                  </Text>
                </View>
                <View style={styles.colBalance}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(entry.balance)}
                  </Text>
                </View>
                <View style={styles.colDescription}>
                  <Text style={styles.cellText}>
                    {entry.description
                      ? entry.description.substring(0, 25)
                      : '-'}
                  </Text>
                </View>
                <View style={styles.colEntry}>
                  <Text style={styles.cellTextCenter}>
                    {entry.entryBy || 'System'}
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
            <Text style={styles.summaryRowLabel}>Total Credits Till Date:</Text>
            <Text style={styles.summaryRowValue}>
              {formatNumber(totalCreditsTillDate)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Total Debits Till Date:</Text>
            <Text style={styles.summaryRowValue}>
              {formatNumber(totalDebitsTillDate)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Transactions in Period:</Text>
            <Text style={styles.summaryRowValue}>
              {ledgerData.length} entries
            </Text>
          </View>

          <Text style={styles.closingBalance}>
            Closing Balance: {formatNumber(closingBalance)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

interface BankAccountLedgerReportViewerProps {
  bankAccount: BankAccount;
  ledgerData: BankAccountLedgerEntry[];
  summary: LedgerSummary;
  fromDate: string;
  toDate: string;
}

export function BankAccountLedgerReportViewer({
  bankAccount,
  ledgerData,
  summary,
  fromDate,
  toDate,
}: BankAccountLedgerReportViewerProps) {
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
        <BankAccountLedgerReport
          bankAccount={bankAccount}
          ledgerData={ledgerData}
          summary={summary}
          fromDate={fromDate}
          toDate={toDate}
        />
      </PDFViewer>
    </div>
  );
}
