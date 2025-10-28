package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.entities.Nozzle;
import com.reallink.pump.entities.NozzleAssignment;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.SalesmanShift;
import com.reallink.pump.entities.Tank;
import com.reallink.pump.entities.TankTransaction;
import com.reallink.pump.entities.User;
import com.reallink.pump.repositories.NozzleAssignmentRepository;
import com.reallink.pump.repositories.NozzleRepository;
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
    public SalesmanShift startShift(UUID salesmanId, BigDecimal openingCash) {
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

        // Create new shift
        SalesmanShift shift = new SalesmanShift(
                salesman,
                pumpMaster,
                LocalDateTime.now(),
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
    public NozzleAssignment closeNozzleAssignment(UUID assignmentId, BigDecimal closingBalance) {
        // Get assignment
        NozzleAssignment assignment = nozzleAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntityNotFoundException("Nozzle assignment not found"));

        // Security check
        securityHelper.verifyAccessToSalesmanData(assignment.getSalesman().getId());

        // Verify assignment is open
        if (assignment.isClosed()) {
            throw new IllegalStateException("Nozzle assignment is already closed");
        }

        // Close the assignment
        assignment.closeAssignment(LocalDateTime.now(), closingBalance);

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
    public SalesmanShift closeShift(UUID shiftId) {
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

        // Close the shift
        shift.closeShift(LocalDateTime.now());

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
     * @return List of filtered shifts
     */
    @PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
    public List<SalesmanShift> getAllShifts(UUID salesmanId, SalesmanShift.ShiftStatus status,
            LocalDateTime fromDate, LocalDateTime toDate) {
        UUID pumpMasterId = securityHelper.getCurrentPumpMasterId();

        // Set default date range if not provided (yesterday to tomorrow)
        LocalDateTime effectiveFromDate = fromDate != null ? fromDate : LocalDateTime.now().minusDays(1);
        LocalDateTime effectiveToDate = toDate != null ? toDate : LocalDateTime.now().plusDays(1);

        if (securityHelper.isSalesman()) {
            // Salesmen only see their own shifts
            UUID currentSalesmanId = securityHelper.getCurrentUserId();
            return filterShifts(currentSalesmanId, status, effectiveFromDate, effectiveToDate, pumpMasterId);
        } else {
            // Managers and admins can see all shifts or filter by salesman
            return filterShifts(salesmanId, status, effectiveFromDate, effectiveToDate, pumpMasterId);
        }
    }

    /**
     * Helper method to filter shifts based on criteria.
     */
    private List<SalesmanShift> filterShifts(UUID salesmanId, SalesmanShift.ShiftStatus status,
            LocalDateTime fromDate, LocalDateTime toDate, UUID pumpMasterId) {
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

        return shifts;
    }

    /**
     * @deprecated Use getAllShifts with parameters instead
     */
    @Deprecated
    public List<SalesmanShift> getAllShifts() {
        return getAllShifts(null, null, null, null);
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
        transaction.setDescription(String.format("Fuel dispensed from nozzle %s (Shift: %s, Salesman: %s)",
                assignment.getNozzle().getNozzleName(),
                assignment.getSalesmanShift().getId(),
                assignment.getSalesman().getUsername()));
        transaction.setEntryBy(securityHelper.getCurrentUsername());

        tankTransactionRepository.save(transaction);

        log.info("Created tank transaction for {} liters dispensed from tank {}",
                dispensedAmount, tank.getTankName());
    }
}
