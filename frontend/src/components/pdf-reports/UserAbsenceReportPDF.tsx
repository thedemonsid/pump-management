import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

interface UserAbsence {
  id?: string;
  userId: string;
  username?: string;
  userRole?: string;
  absenceDate: string;
  reason?: string;
  notes?: string;
  isApproved?: boolean;
  approvedBy?: string;
}

interface EmployeeAbsenceCount {
  userId: string;
  username: string;
  userRole: string;
  mobileNumber?: string;
  absenceCount: number;
  absences: UserAbsence[];
}

interface UserAbsenceReportPDFProps {
  sortedByDate: UserAbsence[];
  employeeAbsenceCounts: EmployeeAbsenceCount[];
  fromDate: string;
  toDate: string;
  totalAbsences: number;
  totalEmployees: number;
  employeesWithAbsences: number;
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
    marginBottom: 15,
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
    fontSize: 11,
    fontFamily: "Wotfard",
    color: "#666",
    marginBottom: 3,
  },
  dateRange: {
    fontSize: 10,
    fontFamily: "Wotfard",
    color: "#666",
    marginTop: 5,
  },
  summarySection: {
    marginBottom: 15,
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
    fontSize: 10,
    fontFamily: "Wotfard",
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 10,
    fontFamily: "Wotfard",
    fontWeight: "bold",
    color: "#333",
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
    marginTop: 5,
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
    minHeight: 18,
  },
  // Date-wise table columns
  dateCol: { width: "12%", fontSize: 8 },
  nameCol: { width: "18%", fontSize: 8 },
  roleCol: { width: "12%", fontSize: 8 },
  reasonCol: { width: "25%", fontSize: 7 },
  notesCol: { width: "20%", fontSize: 7 },
  statusCol: { width: "13%", fontSize: 8 },

  // Employee-wise table columns
  indexCol: { width: "8%", fontSize: 8 },
  empNameCol: { width: "25%", fontSize: 8 },
  empRoleCol: { width: "15%", fontSize: 8 },
  countCol: { width: "12%", fontSize: 8, textAlign: "center" },
  datesCol: { width: "40%", fontSize: 7 },

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
  pageNumber: {
    fontSize: 8,
    textAlign: "center",
    color: "#666",
  },
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

export function UserAbsenceReportPDF({
  sortedByDate,
  employeeAbsenceCounts,
  fromDate,
  toDate,
  totalAbsences,
  totalEmployees,
  employeesWithAbsences,
}: UserAbsenceReportPDFProps) {
  return (
    <Document>
      {/* Page 1: Summary and Date-wise Details */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>User Absence Report</Text>
          <Text style={styles.subtitle}>
            Comprehensive Absence Tracking Report
          </Text>
          <Text style={styles.dateRange}>
            Period: {formatDate(fromDate)} to {formatDate(toDate)}
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Absences:</Text>
            <Text style={styles.summaryValue}>{totalAbsences}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Employees:</Text>
            <Text style={styles.summaryValue}>{totalEmployees}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Employees with Absences:</Text>
            <Text style={styles.summaryValue}>{employeesWithAbsences}</Text>
          </View>
        </View>

        {/* Date-wise Detailed List */}
        <Text style={styles.sectionTitle}>Date-wise Absence Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.dateCol}>Date</Text>
            <Text style={styles.nameCol}>Employee</Text>
            <Text style={styles.roleCol}>Role</Text>
            <Text style={styles.reasonCol}>Reason</Text>
            <Text style={styles.notesCol}>Notes</Text>
            <Text style={styles.statusCol}>Status</Text>
          </View>

          {sortedByDate.slice(0, 20).map((absence, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.dateCol}>
                {formatDate(absence.absenceDate)}
              </Text>
              <Text style={styles.nameCol}>{absence.username || "—"}</Text>
              <Text style={styles.roleCol}>{absence.userRole || "—"}</Text>
              <Text style={styles.reasonCol}>{absence.reason || "—"}</Text>
              <Text style={styles.notesCol}>
                {absence.notes
                  ? absence.notes.length > 30
                    ? absence.notes.substring(0, 30) + "..."
                    : absence.notes
                  : "—"}
              </Text>
              <Text style={styles.statusCol}>
                {absence.isApproved ? "Approved" : "Pending"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleString("en-IN")}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
            fixed
          />
        </View>
      </Page>

      {/* Page 2: Continue Date-wise list if needed */}
      {sortedByDate.length > 20 && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>User Absence Report (Continued)</Text>
            <Text style={styles.dateRange}>
              Period: {formatDate(fromDate)} to {formatDate(toDate)}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Date-wise Absence Details (Continued)
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.dateCol}>Date</Text>
              <Text style={styles.nameCol}>Employee</Text>
              <Text style={styles.roleCol}>Role</Text>
              <Text style={styles.reasonCol}>Reason</Text>
              <Text style={styles.notesCol}>Notes</Text>
              <Text style={styles.statusCol}>Status</Text>
            </View>

            {sortedByDate.slice(20).map((absence, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.dateCol}>
                  {formatDate(absence.absenceDate)}
                </Text>
                <Text style={styles.nameCol}>{absence.username || "—"}</Text>
                <Text style={styles.roleCol}>{absence.userRole || "—"}</Text>
                <Text style={styles.reasonCol}>{absence.reason || "—"}</Text>
                <Text style={styles.notesCol}>
                  {absence.notes
                    ? absence.notes.length > 30
                      ? absence.notes.substring(0, 30) + "..."
                      : absence.notes
                    : "—"}
                </Text>
                <Text style={styles.statusCol}>
                  {absence.isApproved ? "Approved" : "Pending"}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text>Generated on {new Date().toLocaleString("en-IN")}</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
              fixed
            />
          </View>
        </Page>
      )}

      {/* Page 3: Employee-wise Summary */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Employee-wise Absence Summary</Text>
          <Text style={styles.dateRange}>
            Period: {formatDate(fromDate)} to {formatDate(toDate)}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.indexCol}>#</Text>
            <Text style={styles.empNameCol}>Employee Name</Text>
            <Text style={styles.empRoleCol}>Role</Text>
            <Text style={styles.countCol}>Absences</Text>
            <Text style={styles.datesCol}>Absence Dates</Text>
          </View>

          {employeeAbsenceCounts.slice(0, 25).map((employee, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.indexCol}>{index + 1}</Text>
              <Text style={styles.empNameCol}>{employee.username}</Text>
              <Text style={styles.empRoleCol}>{employee.userRole}</Text>
              <Text style={styles.countCol}>{employee.absenceCount} days</Text>
              <Text style={styles.datesCol}>
                {employee.absenceCount === 0
                  ? "No absences"
                  : employee.absences
                      .sort(
                        (a, b) =>
                          new Date(a.absenceDate).getTime() -
                          new Date(b.absenceDate).getTime()
                      )
                      .map((a) => formatDateShort(a.absenceDate))
                      .join(", ")}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleString("en-IN")}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
            fixed
          />
        </View>
      </Page>

      {/* Additional pages for remaining employees if needed */}
      {employeeAbsenceCounts.length > 25 && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Employee-wise Absence Summary (Continued)
            </Text>
            <Text style={styles.dateRange}>
              Period: {formatDate(fromDate)} to {formatDate(toDate)}
            </Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.indexCol}>#</Text>
              <Text style={styles.empNameCol}>Employee Name</Text>
              <Text style={styles.empRoleCol}>Role</Text>
              <Text style={styles.countCol}>Absences</Text>
              <Text style={styles.datesCol}>Absence Dates</Text>
            </View>

            {employeeAbsenceCounts.slice(25).map((employee, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.indexCol}>{index + 26}</Text>
                <Text style={styles.empNameCol}>{employee.username}</Text>
                <Text style={styles.empRoleCol}>{employee.userRole}</Text>
                <Text style={styles.countCol}>
                  {employee.absenceCount} days
                </Text>
                <Text style={styles.datesCol}>
                  {employee.absenceCount === 0
                    ? "No absences"
                    : employee.absences
                        .sort(
                          (a, b) =>
                            new Date(a.absenceDate).getTime() -
                            new Date(b.absenceDate).getTime()
                        )
                        .map((a) => formatDateShort(a.absenceDate))
                        .join(", ")}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text>Generated on {new Date().toLocaleString("en-IN")}</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
              fixed
            />
          </View>
        </Page>
      )}
    </Document>
  );
}
