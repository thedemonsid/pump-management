import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFViewer,
} from '@react-pdf/renderer';
import type { Product } from '@/types';
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
  colProductName: {
    width: '25%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colAlias: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colHsnCode: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colPurchaseRate: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colSalesRate: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  colUnits: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
  },
  colStockQty: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colLowStock: {
    width: '15%',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
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

interface ProductsReportProps {
  products: Product[];
}

export function ProductsReport({ products }: ProductsReportProps) {
  const formatNumber = (num: number) => {
    return normalizeNumberString(new Intl.NumberFormat('en-IN').format(num));
  };

  const totalProducts = products.length;
  const totalStockValue = products.reduce(
    (sum, product) => sum + (product.stockQuantity || 0) * product.purchaseRate,
    0
  );
  const lowStockProducts = products.filter(
    (product) => (product.stockQuantity || 0) <= product.lowStockCount
  ).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PRODUCTS REPORT</Text>
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
              <Text style={styles.summaryLabel}>Total Products</Text>
              <Text style={styles.summaryValue}>{totalProducts}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Stock Value</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(totalStockValue)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Low Stock Items</Text>
              <Text style={styles.summaryValue}>{lowStockProducts}</Text>
            </View>
          </View>
        </View>

        {/* Products Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.colProductName}>
                <Text style={styles.headerText}>Product Name</Text>
              </View>
              <View style={styles.colAlias}>
                <Text style={styles.headerText}>Alias</Text>
              </View>
              <View style={styles.colHsnCode}>
                <Text style={styles.headerText}>HSN Code</Text>
              </View>
              <View style={styles.colPurchaseRate}>
                <Text style={styles.headerText}>Purchase Rate</Text>
              </View>
              <View style={styles.colSalesRate}>
                <Text style={styles.headerText}>Sales Rate</Text>
              </View>
              <View style={styles.colUnits}>
                <Text style={styles.headerText}>Units</Text>
              </View>
              <View style={styles.colStockQty}>
                <Text style={styles.headerText}>Stock Qty</Text>
              </View>
              <View style={styles.colLowStock}>
                <Text style={styles.headerText}>Low Stock</Text>
              </View>
            </View>

            {/* Table Rows */}
            {products.map((product) => (
              <View style={styles.tableRow} key={product.id}>
                <View style={styles.colProductName}>
                  <Text style={styles.cellText}>{product.productName}</Text>
                </View>
                <View style={styles.colAlias}>
                  <Text style={styles.cellTextCenter}>{product.alias}</Text>
                </View>
                <View style={styles.colHsnCode}>
                  <Text style={styles.cellTextCenter}>{product.hsnCode}</Text>
                </View>
                <View style={styles.colPurchaseRate}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(product.purchaseRate)}
                  </Text>
                </View>
                <View style={styles.colSalesRate}>
                  <Text style={styles.cellTextRight}>
                    {formatNumber(product.salesRate)}
                  </Text>
                </View>
                <View style={styles.colUnits}>
                  <Text style={styles.cellTextCenter}>
                    {product.salesUnit}
                    {product.salesUnit !== product.purchaseUnit &&
                      ` / ${product.purchaseUnit}`}
                  </Text>
                </View>
                <View style={styles.colStockQty}>
                  <Text style={styles.cellTextCenter}>
                    {product.stockQuantity || 0} {product.salesUnit}
                  </Text>
                </View>
                <View style={styles.colLowStock}>
                  <Text style={styles.cellTextCenter}>
                    {product.lowStockCount}
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
            <Text style={styles.summaryRowLabel}>Total Products:</Text>
            <Text style={styles.summaryRowValue}>{totalProducts}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Total Stock Value:</Text>
            <Text style={styles.summaryRowValue}>
              {formatNumber(totalStockValue)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Products with Low Stock:</Text>
            <Text style={styles.summaryRowValue}>{lowStockProducts}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

interface ProductsReportViewerProps {
  products: Product[];
}

export function ProductsReportViewer({ products }: ProductsReportViewerProps) {
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
        <ProductsReport products={products} />
      </PDFViewer>
    </div>
  );
}
