package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.entities.Nozzle;
import com.reallink.pump.entities.NozzleAssignment;
import com.reallink.pump.entities.NozzleTest;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.SalesmanShift;
import com.reallink.pump.entities.Tank;
import com.reallink.pump.entities.TankTransaction;
import com.reallink.pump.entities.User;
import com.reallink.pump.repositories.NozzleAssignmentRepository;
import com.reallink.pump.repositories.NozzleRepository;
import com.reallink.pump.repositories.NozzleTestRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SalesmanShiftRepository;
import com.reallink.pump.repositories.TankTransactionRepository;
import com.reallink.pump.repositories.UserRepository;
import com.reallink.pump.security.SecurityHelper;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing salesman shifts. Implements role-based security: -
 * ADMIN: Full access to all shifts - MANAGER: Full access to all shifts -
 * SALESMAN: Can only manage their own shifts
 */
@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class SalesmanShiftService {

    private final SalesmanShiftRepository salesmanShiftRepository;
    private final NozzleAssignmentRepository nozzleAssignmentRepository;
    private final NozzleTestRepository nozzleTestRepository;
    private final NozzleRepository nozzleRepository;
    private final UserRepository userRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final TankTransactionRepository tankTransactionRepository;
    private final SecurityHelper securityHelper;

    /**
     * Start a new shift for a salesman. SALESMAN can start their own shift,
     * MANAGER/ADMIN can start for any salesman.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public SalesmanShift startShift(UUID salesmanId, BigDecimal openingCash, LocalDateTime startDatetime) {
        UUID pumpMasterId = securityHelper.getCurrentPumpMasterId();

        // Security check: SALESMAN can only start their own shift
        if (securityHelper.isSalesman() && !securityHelper.getCurrentUserId().equals(salesmanId)) {
            throw new IllegalArgumentException("You can only start your own shift");
        }

        // Validate salesman exists
        User salesman = userRepository.findById(salesmanId)
                .orElseThrow(() -> new EntityNotFoundException("Salesman not found"));

        // Check if salesman already has an open shift
        boolean hasOpenShift = salesmanShiftRepository.existsBySalesmanIdAndStatusAndPumpMasterId(
                salesmanId, SalesmanShift.ShiftStatus.OPEN, pumpMasterId);

        if (hasOpenShift) {
            throw new IllegalStateException("Salesman already has an open shift. Please close the existing shift first.");
        }

        // Get pump master
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(pumpMasterId)
                .orElseThrow(() -> new EntityNotFoundException("Pump master not found"));

        // Use provided startDatetime or default to now
        LocalDateTime effectiveStartDatetime = startDatetime != null ? startDatetime : LocalDateTime.now();

        // Create new shift
        SalesmanShift shift = new SalesmanShift(
                salesman,
                pumpMaster,
                effectiveStartDatetime,
                openingCash != null ? openingCash : BigDecimal.ZERO
        );

        shift.setEntryBy(securityHelper.getCurrentUsername());
        SalesmanShift savedShift = salesmanShiftRepository.save(shift);

        log.info("Started new shift {} for salesman {}", savedShift.getId(), salesman.getUsername());
        return savedShift;
    }

    /**
     * Add a nozzle to an existing shift. Creates a NozzleAssignment.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public NozzleAssignment addNozzleToShift(UUID shiftId, UUID nozzleId, BigDecimal openingBalance) {
        UUID pumpMasterId = securityHelper.getCurrentPumpMasterId();

        // Get and validate shift
        SalesmanShift shift = salesmanShiftRepository.findById(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Shift not found"));

        // Security check
        securityHelper.verifyAccessToSalesmanData(shift.getSalesman().getId());

        // Verify shift is open
        if (!shift.isOpen()) {
            throw new IllegalStateException("Cannot add nozzle to a closed shift");
        }

        // Get and validate nozzle
        Nozzle nozzle = nozzleRepository.findById(nozzleId)
                .orElseThrow(() -> new EntityNotFoundException("Nozzle not found"));

        // Check if nozzle is already assigned
        boolean isAssigned = nozzleAssignmentRepository.isNozzleCurrentlyAssigned(nozzleId, pumpMasterId);
        if (isAssigned) {
            throw new IllegalStateException("Nozzle is already assigned to another shift");
        }

        // Validate opening balance matches nozzle's current reading (optional strict mode)
        if (nozzle.getCurrentReading() != null && openingBalance != null) {
            BigDecimal diff = openingBalance.subtract(nozzle.getCurrentReading()).abs();
            if (diff.compareTo(new BigDecimal("0.001")) > 0) {
                log.warn("Opening balance {} differs from nozzle current reading {} by {}",
                        openingBalance, nozzle.getCurrentReading(), diff);
            }
        }

        // Create nozzle assignment
        NozzleAssignment assignment = new NozzleAssignment(
                shift,
                nozzle,
                shift.getSalesman(),
                shift.getPumpMaster(),
                LocalDateTime.now(),
                openingBalance
        );

        assignment.setEntryBy(securityHelper.getCurrentUsername());
        NozzleAssignment savedAssignment = nozzleAssignmentRepository.save(assignment);

        log.info("Added nozzle {} to shift {}", nozzle.getNozzleName(), shiftId);
        return savedAssignment;
    }

    /**
     * Close a nozzle assignment. Records the closing balance and marks it as
     * CLOSED.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public NozzleAssignment closeNozzleAssignment(UUID assignmentId, BigDecimal closingBalance, LocalDateTime endTime) {
        // Get assignment
        NozzleAssignment assignment = nozzleAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntityNotFoundException("Nozzle assignment not found"));

        // Security check
        securityHelper.verifyAccessToSalesmanData(assignment.getSalesman().getId());

        // Verify assignment is open
        if (assignment.isClosed()) {
            throw new IllegalStateException("Nozzle assignment is already closed");
        }

        // Verify at least one test exists for this nozzle assignment
        if (!nozzleTestRepository.existsByNozzleAssignmentId(assignmentId)) {
            throw new IllegalStateException(
                    "Cannot close nozzle assignment. At least one nozzle test (which can be zero) is required before closing.");
        }

        // Use provided endTime or default to now
        // Only ADMIN/MANAGER can set custom endTime (handled in controller)
        LocalDateTime closeTime = endTime != null ? endTime : LocalDateTime.now();

        // Close the assignment
        assignment.closeAssignment(closeTime, closingBalance);

        // Update nozzle's current reading
        Nozzle nozzle = assignment.getNozzle();
        nozzle.setPreviousReading(nozzle.getCurrentReading());
        nozzle.setCurrentReading(closingBalance);
        nozzleRepository.save(nozzle);

        // Create tank transaction for the dispensed fuel
        createTankTransactionForNozzleClose(assignment);

        NozzleAssignment savedAssignment = nozzleAssignmentRepository.save(assignment);

        log.info("Closed nozzle assignment {} for nozzle {}, dispensed: {} liters",
                assignmentId, nozzle.getNozzleName(), assignment.getDispensedAmount());

        return savedAssignment;
    }

    /**
     * Close an entire shift. All nozzles must be closed before the shift can be
     * closed.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public SalesmanShift closeShift(UUID shiftId, LocalDateTime endDatetime) {
        // Get shift
        SalesmanShift shift = salesmanShiftRepository.findById(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Shift not found"));

        // Security check
        securityHelper.verifyCanModifyShift(shift.getSalesman().getId(), shift.isOpen());

        // Verify shift is open
        if (!shift.isOpen()) {
            throw new IllegalStateException("Shift is already closed");
        }

        // Verify all nozzles are closed
        long openNozzleCount = nozzleAssignmentRepository.countOpenAssignmentsByShiftId(shiftId);
        if (openNozzleCount > 0) {
            throw new IllegalStateException("Cannot close shift. " + openNozzleCount + " nozzle(s) are still open.");
        }

        // Use provided endDatetime or default to now
        // Only ADMIN/MANAGER can set custom endDatetime (handled in controller)
        LocalDateTime closeTime = endDatetime != null ? endDatetime : LocalDateTime.now();

        // Close the shift
        shift.closeShift(closeTime);

        SalesmanShift savedShift = salesmanShiftRepository.save(shift);

        log.info("Closed shift {} for salesman {}", shiftId, shift.getSalesman().getUsername());
        return savedShift;
    }

    /**
     * Get shift details by ID. SALESMAN can only view their own shifts.
     */
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public SalesmanShift getShiftById(UUID shiftId) {
        SalesmanShift shift = salesmanShiftRepository.findById(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Shift not found"));

        // Security check
        securityHelper.verifyAccessToSalesmanData(shift.getSalesman().getId());

        return shift;
    }

    /**
     * Get all shifts with optional filters. Applies role-based access control
     * and filtering. SALESMAN sees only their own shifts. MANAGER/ADMIN see all
     * shifts or can filter by salesmanId.
     *
     * @param salesmanId Optional salesman ID filter (ADMIN/MANAGER only)
     * @param status Optional status filter (OPEN, CLOSED)
     * @param fromDate Optional start date filter
     * @param toDate Optional end date filter
     * @param isAccountingDone Optional accounting status filter
     * @return List of filtered shifts
     */
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public List<SalesmanShift> getAllShifts(UUID salesmanId, SalesmanShift.ShiftStatus status,
            LocalDateTime fromDate, LocalDateTime toDate, Boolean isAccountingDone) {
        UUID pumpMasterId = securityHelper.getCurrentPumpMasterId();

        // Set default date range if not provided (yesterday to tomorrow)
        LocalDateTime effectiveFromDate = fromDate != null ? fromDate : LocalDateTime.now().minusDays(1);
        LocalDateTime effectiveToDate = toDate != null ? toDate : LocalDateTime.now().plusDays(1);

        if (securityHelper.isSalesman()) {
            // Salesmen only see their own shifts
            UUID currentSalesmanId = securityHelper.getCurrentUserId();
            return filterShifts(currentSalesmanId, status, effectiveFromDate, effectiveToDate, pumpMasterId, isAccountingDone);
        } else {
            // Managers and admins can see all shifts or filter by salesman
            return filterShifts(salesmanId, status, effectiveFromDate, effectiveToDate, pumpMasterId, isAccountingDone);
        }
    }

    /**
     * Helper method to filter shifts based on criteria.
     */
    private List<SalesmanShift> filterShifts(UUID salesmanId, SalesmanShift.ShiftStatus status,
            LocalDateTime fromDate, LocalDateTime toDate, UUID pumpMasterId, Boolean isAccountingDone) {
        List<SalesmanShift> shifts;

        if (salesmanId != null && status != null) {
            // Filter by salesman and status
            shifts = salesmanShiftRepository.findBySalesmanIdAndStatusAndPumpMasterIdAndDateRange(
                    salesmanId, status, pumpMasterId, fromDate, toDate);
        } else if (salesmanId != null) {
            // Filter by salesman only
            shifts = salesmanShiftRepository.findBySalesmanIdAndPumpMasterIdAndDateRange(
                    salesmanId, pumpMasterId, fromDate, toDate);
        } else if (status != null) {
            // Filter by status only
            shifts = salesmanShiftRepository.findByStatusAndPumpMasterIdAndDateRange(
                    status, pumpMasterId, fromDate, toDate);
        } else {
            // No specific filters, just date range and pump master
            shifts = salesmanShiftRepository.findByPumpMasterIdAndDateRange(
                    pumpMasterId, fromDate, toDate);
        }

        // Apply accounting status filter if provided
        if (isAccountingDone != null) {
            shifts = shifts.stream()
                    .filter(shift -> shift.getIsAccountingDone().equals(isAccountingDone))
                    .collect(Collectors.toList());
        }

        return shifts;
    }

    /**
     * @deprecated Use getAllShifts with parameters instead
     */
    @Deprecated
    public List<SalesmanShift> getAllShifts() {
        return getAllShifts(null, null, null, null, null);
    }

    /**
     * Get open shift for a salesman.
     */
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public SalesmanShift getOpenShiftForSalesman(UUID salesmanId) {
        UUID pumpMasterId = securityHelper.getCurrentPumpMasterId();

        // Security check
        securityHelper.verifyAccessToSalesmanData(salesmanId);

        return salesmanShiftRepository.findBySalesmanIdAndStatusAndPumpMasterId(
                salesmanId, SalesmanShift.ShiftStatus.OPEN, pumpMasterId)
                .orElseThrow(() -> new EntityNotFoundException("No open shift found for salesman"));
    }

    /**
     * Get all nozzle assignments for a shift.
     */
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public List<NozzleAssignment> getNozzleAssignmentsForShift(UUID shiftId) {
        getShiftById(shiftId); // This does security check
        return nozzleAssignmentRepository.findBySalesmanShiftIdOrderByStartTimeDesc(shiftId);
    }

    /**
     * Get all open shifts (for managers/admins).
     */
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public List<SalesmanShift> getAllOpenShifts() {
        UUID pumpMasterId = securityHelper.getCurrentPumpMasterId();
        return salesmanShiftRepository.findOpenShiftsByPumpMasterId(pumpMasterId);
    }

    /**
     * Get shifts needing accounting for a specific salesman. Returns closed
     * shifts where accounting has not been completed.
     */
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public List<SalesmanShift> getShiftsNeedingAccountingForSalesman(UUID salesmanId) {
        UUID pumpMasterId = securityHelper.getCurrentPumpMasterId();

        // Security check: SALESMAN can only view their own shifts
        if (securityHelper.isSalesman() && !securityHelper.getCurrentUserId().equals(salesmanId)) {
            throw new IllegalArgumentException("You can only view your own shifts");
        }

        return salesmanShiftRepository.findShiftsNeedingAccountingBySalesman(salesmanId, pumpMasterId);
    }

    // Private helper methods
    private void createTankTransactionForNozzleClose(NozzleAssignment assignment) {
        Tank tank = assignment.getNozzle().getTank();
        if (tank == null) {
            log.warn("No tank associated with nozzle {}", assignment.getNozzle().getNozzleName());
            return;
        }

        BigDecimal dispensedAmount = assignment.getDispensedAmount();
        if (dispensedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return; // No fuel dispensed
        }

        // Create removal transaction (fuel out - dispensed from tank)
        TankTransaction transaction = new TankTransaction();
        transaction.setTank(tank);
        transaction.setTransactionType(TankTransaction.TransactionType.REMOVAL);
        transaction.setVolume(dispensedAmount);
        transaction.setTransactionDate(assignment.getEndTime());
        transaction.setDescription(String.format("Fuel dispensed from nozzle %s (Salesman: %s)",
                assignment.getNozzle().getNozzleName(),
                assignment.getSalesman().getUsername()));
        transaction.setEntryBy(securityHelper.getCurrentUsername());

        tankTransactionRepository.save(transaction);

        log.info("Created tank transaction for {} liters dispensed from tank {}",
                dispensedAmount, tank.getTankName());

        // Create ADDITION transactions for each nozzle test to return test fuel to tank
        DateTimeFormatter dtFormatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm");
        List<NozzleTest> tests = nozzleTestRepository.findByNozzleAssignmentIdOrderByTestDatetimeDesc(assignment.getId());
        for (NozzleTest test : tests) {
            // Skip tests with zero or negative quantity - no fuel to return
            if (test.getTestQuantity() == null || test.getTestQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                log.debug("Skipping tank transaction for zero-quantity nozzle test from nozzle {}",
                        assignment.getNozzle().getNozzleName());
                continue;
            }

            TankTransaction testTransaction = new TankTransaction();
            testTransaction.setTank(tank);
            testTransaction.setTransactionType(TankTransaction.TransactionType.ADDITION);
            testTransaction.setVolume(test.getTestQuantity());
            testTransaction.setTransactionDate(assignment.getEndTime());
            testTransaction.setDescription(String.format("Test fuel returned (%s L) from nozzle %s - %s",
                    test.getTestQuantity(),
                    assignment.getNozzle().getNozzleName(),
                    test.getTestDatetime().format(dtFormatter)));
            testTransaction.setNozzleTest(test);
            testTransaction.setEntryBy(securityHelper.getCurrentUsername());

            tankTransactionRepository.save(testTransaction);

            log.info("Created tank transaction for {} liters test fuel returned to tank {}",
                    test.getTestQuantity(), tank.getTankName());
        }
    }

    // ============================================
    // Nozzle Test Management
    // ============================================
    /**
     * Register a nozzle test for a shift. Tests are when salesmen dispense fuel
     * to verify nozzle accuracy and return it to tank.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALESMAN')")
    public NozzleTest registerNozzleTest(UUID shiftId, UUID nozzleId, LocalDateTime testDatetime,
            BigDecimal testQuantity, String remarks) {

        // Fetch and validate shift
        SalesmanShift shift = salesmanShiftRepository.findById(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Shift not found with id: " + shiftId));

        // Security check for salesmen
        if (securityHelper.isSalesman()) {
            if (!shift.getSalesman().getId().equals(securityHelper.getCurrentUserId())) {
                throw new SecurityException("Salesmen can only register tests for their own shifts");
            }
        }

        // Validate shift is open
        if (!shift.isOpen()) {
            throw new IllegalStateException("Cannot register test for a closed shift");
        }

        // Fetch and validate nozzle
        Nozzle nozzle = nozzleRepository.findById(nozzleId)
                .orElseThrow(() -> new EntityNotFoundException("Nozzle not found with id: " + nozzleId));

        // Find the nozzle assignment for this shift and nozzle
        NozzleAssignment assignment = nozzleAssignmentRepository
                .findBySalesmanShiftIdAndNozzleId(shiftId, nozzleId)
                .orElseThrow(() -> new IllegalStateException(
                "Nozzle " + nozzle.getNozzleName() + " is not assigned to this shift"));

        // Validate assignment is open
        if (!assignment.isOpen()) {
            throw new IllegalStateException("Cannot register test for a closed nozzle assignment");
        }

        // Create test entity
        NozzleTest test = new NozzleTest();
        test.setPumpMaster(shift.getPumpMaster());
        test.setSalesmanShift(shift);
        test.setNozzleAssignment(assignment);
        test.setTestDatetime(testDatetime);
        test.setTestQuantity(testQuantity);
        test.setRemarks(remarks);

        NozzleTest savedTest = nozzleTestRepository.save(test);

        log.info("Registered nozzle test: {} liters for nozzle {} in shift {}",
                testQuantity, nozzle.getNozzleName(), shiftId);

        return savedTest;
    }

    /**
     * Get all nozzle tests for a specific shift.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALESMAN')")
    public List<NozzleTest> getNozzleTestsForShift(UUID shiftId) {
        // Fetch shift to validate it exists
        SalesmanShift shift = salesmanShiftRepository.findById(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Shift not found with id: " + shiftId));

        // Security check for salesmen
        if (securityHelper.isSalesman()) {
            if (!shift.getSalesman().getId().equals(securityHelper.getCurrentUserId())) {
                throw new SecurityException("Salesmen can only view tests for their own shifts");
            }
        }

        return nozzleTestRepository.findBySalesmanShiftIdOrderByTestDatetimeDesc(shiftId);
    }

    /**
     * Get all nozzle tests for a specific nozzle assignment.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALESMAN')")
    public List<NozzleTest> getNozzleTestsForAssignment(UUID assignmentId) {
        NozzleAssignment assignment = nozzleAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntityNotFoundException("Nozzle assignment not found with id: " + assignmentId));

        // Security check for salesmen
        if (securityHelper.isSalesman()) {
            if (!assignment.getSalesman().getId().equals(securityHelper.getCurrentUserId())) {
                throw new SecurityException("Salesmen can only view tests for their own assignments");
            }
        }

        return nozzleTestRepository.findByNozzleAssignmentIdOrderByTestDatetimeDesc(assignmentId);
    }

    /**
     * Calculate total test quantity for a specific nozzle assignment.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALESMAN')")
    public BigDecimal getTotalTestQuantityForAssignment(UUID assignmentId) {
        return nozzleTestRepository.sumTestQuantityByNozzleAssignment(assignmentId);
    }

    /**
     * Calculate total test quantity for a specific shift.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALESMAN')")
    public BigDecimal getTotalTestQuantityForShift(UUID shiftId) {
        return nozzleTestRepository.sumTestQuantityByShift(shiftId);
    }

    /**
     * Delete a shift. Only admin and manager can delete shifts. Can only delete
     * if: - Shift is OPEN (not closed) - No nozzle assignments are closed - No
     * nozzle tests exist - No bills exist - No payments exist - No expenses
     * exist
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void deleteShift(UUID shiftId) {
        SalesmanShift shift = salesmanShiftRepository.findById(shiftId)
                .orElseThrow(() -> new EntityNotFoundException("Shift not found with id: " + shiftId));

        // Check 1: Shift must be OPEN
        if (shift.isClosed()) {
            throw new IllegalStateException("Cannot delete a closed shift. Only open shifts can be deleted.");
        }

        // Check 2: No closed nozzle assignments
        long closedNozzleCount = shift.getNozzleAssignments().stream()
                .filter(NozzleAssignment::isClosed)
                .count();
        if (closedNozzleCount > 0) {
            throw new IllegalStateException("Cannot delete shift. " + closedNozzleCount + " nozzle(s) have been closed.");
        }

        // Check 3: No nozzle tests
        if (!shift.getNozzleTests().isEmpty()) {
            throw new IllegalStateException("Cannot delete shift. " + shift.getNozzleTests().size() + " nozzle test(s) exist.");
        }

        // Check 4: No bills
        if (!shift.getCreditBills().isEmpty()) {
            throw new IllegalStateException("Cannot delete shift. " + shift.getCreditBills().size() + " bill(s) exist.");
        }

        // Check 5: No payments
        if (!shift.getPayments().isEmpty()) {
            throw new IllegalStateException("Cannot delete shift. " + shift.getPayments().size() + " payment(s) exist.");
        }

        // Check 6: No expenses
        if (!shift.getExpenses().isEmpty()) {
            throw new IllegalStateException("Cannot delete shift. " + shift.getExpenses().size() + " expense(s) exist.");
        }

        // If we have any open nozzle assignments, we need to delete them first
        // This is safe because they are OPEN and have no tests
        if (!shift.getNozzleAssignments().isEmpty()) {
            shift.getNozzleAssignments().clear();
        }

        // Delete the shift
        salesmanShiftRepository.delete(shift);

        log.info("Deleted shift {} for salesman {}", shiftId, shift.getSalesman().getUsername());
    }

    /**
     * Delete a nozzle test. Only admin and manager can delete tests.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public void deleteNozzleTest(UUID testId) {
        NozzleTest test = nozzleTestRepository.findById(testId)
                .orElseThrow(() -> new EntityNotFoundException("Nozzle test not found with id: " + testId));

        // Don't allow deletion if shift is closed and accounting is done
        if (test.getSalesmanShift().isClosed() && test.getSalesmanShift().getIsAccountingDone()) {
            throw new IllegalStateException("Cannot delete test from a shift with completed accounting");
        }

        // Delete associated tank transaction if it exists (only if nozzle was already closed)
        List<TankTransaction> transactions = tankTransactionRepository.findByNozzleTest(test);
        if (!transactions.isEmpty()) {
            tankTransactionRepository.deleteAll(transactions);
            log.info("Deleted {} tank transaction(s) associated with nozzle test {}", transactions.size(), testId);
        }

        nozzleTestRepository.delete(test);
        log.info("Deleted nozzle test {} from shift {}", testId, test.getSalesmanShift().getId());
    }

    /**
     * Get all nozzle IDs that are currently assigned (status = OPEN) to any
     * shift. This is optimized for checking nozzle availability when starting a
     * new shift.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALESMAN')")
    public List<UUID> getAllAssignedNozzleIds() {
        UUID pumpMasterId = securityHelper.getCurrentPumpMasterId();
        return nozzleAssignmentRepository.findAllAssignedNozzleIds(pumpMasterId);
    }
}
