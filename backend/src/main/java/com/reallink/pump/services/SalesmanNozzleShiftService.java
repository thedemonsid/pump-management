package com.reallink.pump.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CloseSalesmanNozzleShiftRequest;
import com.reallink.pump.dto.request.CreateSalesmanNozzleShiftRequest;
import com.reallink.pump.dto.request.CreateTankTransactionRequest;
import com.reallink.pump.dto.request.UpdateSalesmanNozzleShiftRequest;
import com.reallink.pump.dto.response.SalesmanNozzleShiftResponse;
import com.reallink.pump.entities.Nozzle;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.SalesmanNozzleShift;
import com.reallink.pump.entities.User;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.SalesmanNozzleShiftMapper;
import com.reallink.pump.repositories.NozzleRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SalesmanNozzleShiftRepository;
import com.reallink.pump.repositories.SalesmanRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesmanNozzleShiftService {

    private final SalesmanNozzleShiftRepository repository;
    private final SalesmanRepository salesmanRepository;
    private final NozzleRepository nozzleRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final SalesmanNozzleShiftMapper mapper;
    private final TankTransactionService tankTransactionService;

    public List<SalesmanNozzleShiftResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterIdOrderByStartDateTimeDesc(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SalesmanNozzleShiftResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId, LocalDateTime fromDate, LocalDateTime toDate) {
        if (fromDate != null && toDate != null) {
            return repository.findByPumpMasterIdAndStartDateTimeBetweenOrderByStartDateTimeDesc(pumpMasterId, fromDate, toDate).stream()
                    .map(mapper::toResponse)
                    .toList();
        } else {
            return getAllByPumpMasterId(pumpMasterId);
        }
    }

    public List<SalesmanNozzleShiftResponse> getBySalesmanIdAndPumpMasterId(@NotNull UUID salesmanId, @NotNull UUID pumpMasterId, LocalDateTime fromDate, LocalDateTime toDate) {
        if (fromDate != null && toDate != null) {
            return repository.findBySalesmanIdAndPumpMasterIdAndStartDateTimeBetweenOrderByStartDateTimeDesc(salesmanId, pumpMasterId, fromDate, toDate).stream()
                    .map(mapper::toResponse)
                    .toList();
        } else {
            return repository.findBySalesmanIdAndPumpMasterIdOrderByStartDateTimeDesc(salesmanId, pumpMasterId).stream()
                    .map(mapper::toResponse)
                    .toList();
        }
    }

    public List<SalesmanNozzleShiftResponse> getOpenShifts(@NotNull UUID pumpMasterId, UUID salesmanId) {
        if (salesmanId != null) {
            return repository.findOpenShiftsBySalesmanIdAndPumpMasterId(salesmanId, pumpMasterId).stream()
                    .map(mapper::toResponse)
                    .toList();
        } else {
            return repository.findAllOpenShiftsByPumpMasterId(pumpMasterId).stream()
                    .map(mapper::toResponse)
                    .toList();
        }
    }

    public SalesmanNozzleShiftResponse getById(@NotNull UUID id) {
        SalesmanNozzleShift shift = repository.findByIdWithDetails(id).orElse(null);
        if (shift == null) {
            throw new PumpBusinessException("SHIFT_NOT_FOUND", "Salesman nozzle shift with ID " + id + " not found");
        }
        return mapper.toResponse(shift);
    }

    public List<SalesmanNozzleShiftResponse> getByNozzleId(@NotNull UUID nozzleId, @NotNull UUID pumpMasterId) {
        return repository.findByNozzleIdAndPumpMasterIdOrderByEndDateTimeDesc(nozzleId, pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public SalesmanNozzleShiftResponse create(@Valid CreateSalesmanNozzleShiftRequest request, @NotNull UUID pumpMasterId) {
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(pumpMasterId)
                .orElseThrow(() -> new PumpBusinessException("PUMP_MASTER_NOT_FOUND", "Pump master not found"));

        User salesman = salesmanRepository.findById(request.getSalesmanId())
                .orElseThrow(() -> new PumpBusinessException("SALESMAN_NOT_FOUND", "Salesman not found"));
        if (!"SALESMAN".equals(salesman.getRole().getRoleName())) {
            throw new PumpBusinessException("INVALID_ROLE", "User is not a salesman");
        }
        if (!pumpMasterId.equals(salesman.getPumpMaster().getId())) {
            throw new PumpBusinessException("TENANT_MISMATCH", "Salesman does not belong to this pump master");
        }

        Nozzle nozzle = nozzleRepository.findById(request.getNozzleId())
                .orElseThrow(() -> new PumpBusinessException("NOZZLE_NOT_FOUND", "Nozzle not found"));
        if (!pumpMasterId.equals(nozzle.getPumpMaster().getId())) {
            throw new PumpBusinessException("TENANT_MISMATCH", "Nozzle does not belong to this pump master");
        }

        List<SalesmanNozzleShift> recentShifts = repository.findByNozzleIdAndPumpMasterIdOrderByEndDateTimeDesc(request.getNozzleId(), pumpMasterId);
        if (!recentShifts.isEmpty()) {
            SalesmanNozzleShift lastShift = recentShifts.get(0);
            if (SalesmanNozzleShift.ShiftStatus.OPEN.equals(lastShift.getStatus())) {
                throw new PumpBusinessException("NOZZLE_IN_USE", "Nozzle is currently in use by another salesman. Previous shift must be closed first.");
            }
            // Validate opening balance matches previous closing balance
            if (lastShift.getClosingBalance() != null && lastShift.getClosingBalance().compareTo(request.getOpeningBalance()) != 0) {
                throw new PumpBusinessException("OPENING_BALANCE_MISMATCH",
                        "Opening balance (" + request.getOpeningBalance() + ") does not match previous closing balance (" + lastShift.getClosingBalance() + ")");
            }
        }

        BigDecimal productPrice = nozzle.getTank().getProduct().getSalesRate();
        if (productPrice == null) {
            throw new PumpBusinessException("PRODUCT_PRICE_NOT_FOUND", "Product sales rate not found for nozzle");
        }

        SalesmanNozzleShift shift = new SalesmanNozzleShift(
                salesman,
                nozzle,
                LocalDateTime.now(ZoneOffset.UTC), // Set start time automatically in UTC
                request.getOpeningBalance(),
                productPrice,
                pumpMaster
        );

        if (request.getEndDateTime() != null) {
            shift.setEndDateTime(request.getEndDateTime());
            shift.setStatus(SalesmanNozzleShift.ShiftStatus.CLOSED);
        }
        if (request.getClosingBalance() != null) {
            shift.setClosingBalance(request.getClosingBalance());
            shift.setStatus(SalesmanNozzleShift.ShiftStatus.CLOSED);
            BigDecimal dispensedAmount = request.getClosingBalance().subtract(request.getOpeningBalance());
            BigDecimal totalAmount = dispensedAmount.multiply(productPrice);
            totalAmount = totalAmount.setScale(2, RoundingMode.HALF_UP);
            shift.setTotalAmount(totalAmount);

            // Create tank transaction for fuel removal
            CreateTankTransactionRequest tankTransactionRequest = new CreateTankTransactionRequest();
            tankTransactionRequest.setVolume(dispensedAmount);
            tankTransactionRequest.setDescription("Fuel dispensed during shift creation closure for salesman: " + salesman.getUsername() + ", nozzle: " + nozzle.getNozzleName());
            tankTransactionRequest.setTransactionDate(LocalDateTime.now(ZoneOffset.UTC));
            tankTransactionService.createRemovalTransaction(nozzle.getTank().getId(), tankTransactionRequest);
        }

        SalesmanNozzleShift saved = repository.save(shift);
        return mapper.toResponse(saved);
    }

    @Transactional
    public SalesmanNozzleShiftResponse closeShift(@NotNull UUID shiftId, @Valid CloseSalesmanNozzleShiftRequest request, @NotNull UUID pumpMasterId) {
        SalesmanNozzleShift shift = repository.findById(shiftId)
                .orElseThrow(() -> new PumpBusinessException("SHIFT_NOT_FOUND", "Salesman nozzle shift with ID " + shiftId + " not found"));

        // Validate tenant access
        if (!pumpMasterId.equals(shift.getPumpMaster().getId())) {
            throw new PumpBusinessException("TENANT_MISMATCH", "Shift does not belong to this pump master");
        }

        // Validate shift is not already closed
        if (SalesmanNozzleShift.ShiftStatus.CLOSED.equals(shift.getStatus())) {
            throw new PumpBusinessException("SHIFT_ALREADY_CLOSED", "Shift is already closed");
        }

        // Validate closing balance is greater than opening balance
        if (request.getClosingBalance().compareTo(shift.getOpeningBalance()) <= 0) {
            throw new PumpBusinessException("INVALID_CLOSING_BALANCE", "Closing balance must be greater than opening balance");
        }

        // Update shift with closing details
        shift.setEndDateTime(LocalDateTime.now(ZoneOffset.UTC)); // Set end time automatically in UTC
        shift.setClosingBalance(request.getClosingBalance());

        // Calculate and set total amount: (closing - opening) * productPrice
        BigDecimal dispensedAmount = request.getClosingBalance().subtract(shift.getOpeningBalance());
        BigDecimal totalAmount = dispensedAmount.multiply(shift.getProductPrice());
        System.out.println("Dispensed Amount: " + dispensedAmount + ", Product Price: " + shift.getProductPrice() + ", Total Amount: " + totalAmount);

        totalAmount = totalAmount.setScale(2, RoundingMode.HALF_UP);
        shift.setTotalAmount(totalAmount);

        // Create tank transaction for fuel removal
        CreateTankTransactionRequest tankTransactionRequest = new CreateTankTransactionRequest();
        tankTransactionRequest.setVolume(dispensedAmount);
        tankTransactionRequest.setDescription("Fuel dispensed during shift closure for salesman: " + shift.getSalesman().getUsername() + ", nozzle: " + shift.getNozzle().getNozzleName());
        tankTransactionRequest.setTransactionDate(LocalDateTime.now(ZoneOffset.UTC));
        tankTransactionService.createRemovalTransaction(shift.getNozzle().getTank().getId(), tankTransactionRequest);

        shift.closeShift(); // Set status to CLOSED

        SalesmanNozzleShift saved = repository.save(shift);

        // If next salesman is specified, create a new shift for them
        if (request.getNextSalesmanId() != null) {
            createNextShiftForSalesman(shift, request.getNextSalesmanId(), pumpMasterId);
        }

        return mapper.toResponse(saved);
    }

    // Admin methods for managing shifts
    @Transactional
    public SalesmanNozzleShiftResponse adminCreateShift(@Valid CreateSalesmanNozzleShiftRequest request, @NotNull UUID pumpMasterId) {
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(pumpMasterId)
                .orElseThrow(() -> new PumpBusinessException("PUMP_MASTER_NOT_FOUND", "Pump master not found"));

        User salesman = salesmanRepository.findById(request.getSalesmanId())
                .orElseThrow(() -> new PumpBusinessException("SALESMAN_NOT_FOUND", "Salesman not found"));
        if (!"SALESMAN".equals(salesman.getRole().getRoleName())) {
            throw new PumpBusinessException("INVALID_ROLE", "User is not a salesman");
        }
        if (!pumpMasterId.equals(salesman.getPumpMaster().getId())) {
            throw new PumpBusinessException("TENANT_MISMATCH", "Salesman does not belong to this pump master");
        }

        Nozzle nozzle = nozzleRepository.findById(request.getNozzleId())
                .orElseThrow(() -> new PumpBusinessException("NOZZLE_NOT_FOUND", "Nozzle not found"));
        if (!pumpMasterId.equals(nozzle.getPumpMaster().getId())) {
            throw new PumpBusinessException("TENANT_MISMATCH", "Nozzle does not belong to this pump master");
        }

        BigDecimal productPrice = nozzle.getTank().getProduct().getSalesRate();
        if (productPrice == null) {
            throw new PumpBusinessException("PRODUCT_PRICE_NOT_FOUND", "Product sales rate not found for nozzle");
        }

        SalesmanNozzleShift shift = new SalesmanNozzleShift(
                salesman,
                nozzle,
                LocalDateTime.now(ZoneOffset.UTC), // Set start time automatically in UTC
                request.getOpeningBalance(),
                productPrice,
                pumpMaster
        );

        if (request.getEndDateTime() != null) {
            shift.setEndDateTime(request.getEndDateTime());
            shift.setStatus(SalesmanNozzleShift.ShiftStatus.CLOSED);
        }
        if (request.getClosingBalance() != null) {
            shift.setClosingBalance(request.getClosingBalance());
            shift.setStatus(SalesmanNozzleShift.ShiftStatus.CLOSED);
            BigDecimal dispensedAmount = request.getClosingBalance().subtract(request.getOpeningBalance());
            BigDecimal totalAmount = dispensedAmount.multiply(productPrice);
            totalAmount = totalAmount.setScale(2, RoundingMode.HALF_UP);
            shift.setTotalAmount(totalAmount);

            // Create tank transaction for fuel removal
            CreateTankTransactionRequest tankTransactionRequest = new CreateTankTransactionRequest();
            tankTransactionRequest.setVolume(dispensedAmount);
            tankTransactionRequest.setDescription("Fuel dispensed during admin shift creation closure for salesman: " + salesman.getUsername() + ", nozzle: " + nozzle.getNozzleName());
            tankTransactionRequest.setTransactionDate(LocalDateTime.now(ZoneOffset.UTC));
            tankTransactionService.createRemovalTransaction(nozzle.getTank().getId(), tankTransactionRequest);
        }

        SalesmanNozzleShift saved = repository.save(shift);
        return mapper.toResponse(saved);
    }

    @Transactional
    public SalesmanNozzleShiftResponse adminCloseShift(@NotNull UUID shiftId, @Valid CloseSalesmanNozzleShiftRequest request, @NotNull UUID pumpMasterId) {
        SalesmanNozzleShift shift = repository.findById(shiftId)
                .orElseThrow(() -> new PumpBusinessException("SHIFT_NOT_FOUND", "Salesman nozzle shift with ID " + shiftId + " not found"));

        // Validate tenant access
        if (!pumpMasterId.equals(shift.getPumpMaster().getId())) {
            throw new PumpBusinessException("TENANT_MISMATCH", "Shift does not belong to this pump master");
        }

        // Admin can force close even if already closed or with any balance
        shift.setEndDateTime(LocalDateTime.now(ZoneOffset.UTC)); // Set end time automatically in UTC
        shift.setClosingBalance(request.getClosingBalance());

        // Calculate and set total amount: (closing - opening) * productPrice
        BigDecimal dispensedAmount = request.getClosingBalance().subtract(shift.getOpeningBalance());
        BigDecimal totalAmount = dispensedAmount.multiply(shift.getProductPrice());
        System.out.println("Dispensed Amount: " + dispensedAmount + ", Product Price: " + shift.getProductPrice() + ", Total Amount: " + totalAmount);

        totalAmount = totalAmount.setScale(2, RoundingMode.HALF_UP);
        shift.setTotalAmount(totalAmount);

        // Create tank transaction for fuel removal
        CreateTankTransactionRequest tankTransactionRequest = new CreateTankTransactionRequest();
        tankTransactionRequest.setVolume(dispensedAmount);
        tankTransactionRequest.setDescription("Fuel dispensed during admin shift closure for salesman: " + shift.getSalesman().getUsername() + ", nozzle: " + shift.getNozzle().getNozzleName());
        tankTransactionRequest.setTransactionDate(LocalDateTime.now(ZoneOffset.UTC));
        tankTransactionService.createRemovalTransaction(shift.getNozzle().getTank().getId(), tankTransactionRequest);

        shift.closeShift(); // Set status to CLOSED

        SalesmanNozzleShift saved = repository.save(shift);

        // If next salesman is specified, create a new shift for them
        if (request.getNextSalesmanId() != null) {
            createNextShiftForSalesman(shift, request.getNextSalesmanId(), pumpMasterId);
        }

        return mapper.toResponse(saved);
    }

    @Transactional
    public SalesmanNozzleShiftResponse adminUpdateShift(@NotNull UUID shiftId, @Valid UpdateSalesmanNozzleShiftRequest request, @NotNull UUID pumpMasterId) {
        SalesmanNozzleShift shift = repository.findById(shiftId)
                .orElseThrow(() -> new PumpBusinessException("SHIFT_NOT_FOUND", "Salesman nozzle shift with ID " + shiftId + " not found"));

        // Validate tenant access
        if (!pumpMasterId.equals(shift.getPumpMaster().getId())) {
            throw new PumpBusinessException("TENANT_MISMATCH", "Shift does not belong to this pump master");
        }

        // Update fields if provided
        if (request.getSalesmanId() != null) {
            User salesman = salesmanRepository.findById(request.getSalesmanId())
                    .orElseThrow(() -> new PumpBusinessException("SALESMAN_NOT_FOUND", "Salesman not found"));
            if (!"SALESMAN".equals(salesman.getRole().getRoleName())) {
                throw new PumpBusinessException("INVALID_ROLE", "User is not a salesman");
            }
            if (!pumpMasterId.equals(salesman.getPumpMaster().getId())) {
                throw new PumpBusinessException("TENANT_MISMATCH", "Salesman does not belong to this pump master");
            }
            shift.setSalesman(salesman);
        }

        if (request.getNozzleId() != null) {
            Nozzle nozzle = nozzleRepository.findById(request.getNozzleId())
                    .orElseThrow(() -> new PumpBusinessException("NOZZLE_NOT_FOUND", "Nozzle not found"));
            if (!pumpMasterId.equals(nozzle.getPumpMaster().getId())) {
                throw new PumpBusinessException("TENANT_MISMATCH", "Nozzle does not belong to this pump master");
            }
            shift.setNozzle(nozzle);
        }

        if (request.getStartDateTime() != null) {
            shift.setStartDateTime(request.getStartDateTime());
        }

        if (request.getEndDateTime() != null) {
            shift.setEndDateTime(request.getEndDateTime());
        }

        if (request.getOpeningBalance() != null) {
            shift.setOpeningBalance(request.getOpeningBalance());
        }

        if (request.getClosingBalance() != null) {
            shift.setClosingBalance(request.getClosingBalance());
        }

        if (request.getProductPrice() != null) {
            shift.setProductPrice(request.getProductPrice());
        }

        if (request.getStatus() != null) {
            shift.setStatus(request.getStatus());
        }

        // Recalculate total amount if balances or price changed
        BigDecimal oldDispensedAmount = null;
        if (request.getOpeningBalance() != null || request.getClosingBalance() != null || request.getProductPrice() != null) {
            // Store old dispensed amount before updating
            if (shift.getClosingBalance() != null && shift.getOpeningBalance() != null) {
                oldDispensedAmount = shift.getClosingBalance().subtract(shift.getOpeningBalance());
            }
            shift.updateTotalAmount();
        }

        // Handle tank transaction if closing balance changed and shift is closed
        if (request.getClosingBalance() != null && SalesmanNozzleShift.ShiftStatus.CLOSED.equals(shift.getStatus())) {
            BigDecimal newDispensedAmount = shift.getClosingBalance().subtract(shift.getOpeningBalance());
            BigDecimal transactionVolume;

            if (oldDispensedAmount != null) {
                // This is an update - calculate the difference
                transactionVolume = newDispensedAmount.subtract(oldDispensedAmount);
            } else {
                // First time setting closing balance
                transactionVolume = newDispensedAmount;
            }

            if (transactionVolume.compareTo(BigDecimal.ZERO) != 0) {
                CreateTankTransactionRequest tankTransactionRequest = new CreateTankTransactionRequest();
                tankTransactionRequest.setVolume(transactionVolume.abs());
                tankTransactionRequest.setDescription("Fuel adjustment during admin shift update for salesman: " + shift.getSalesman().getUsername() + ", nozzle: " + shift.getNozzle().getNozzleName());
                tankTransactionRequest.setTransactionDate(LocalDateTime.now(ZoneOffset.UTC));

                if (transactionVolume.compareTo(BigDecimal.ZERO) > 0) {
                    // More fuel dispensed - create removal transaction
                    tankTransactionService.createRemovalTransaction(shift.getNozzle().getTank().getId(), tankTransactionRequest);
                } else {
                    // Less fuel dispensed - create addition transaction (fuel returned to tank)
                    tankTransactionService.createAdditionTransaction(shift.getNozzle().getTank().getId(), tankTransactionRequest);
                }
            }
        }

        SalesmanNozzleShift saved = repository.save(shift);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void adminDeleteShift(@NotNull UUID shiftId, @NotNull UUID pumpMasterId) {
        SalesmanNozzleShift shift = repository.findById(shiftId)
                .orElseThrow(() -> new PumpBusinessException("SHIFT_NOT_FOUND", "Salesman nozzle shift with ID " + shiftId + " not found"));

        // Validate tenant access
        if (!pumpMasterId.equals(shift.getPumpMaster().getId())) {
            throw new PumpBusinessException("TENANT_MISMATCH", "Shift does not belong to this pump master");
        }

        repository.delete(shift);
    }

    private void createNextShiftForSalesman(SalesmanNozzleShift previousShift, UUID nextSalesmanId, UUID pumpMasterId) {
        // Validate next salesman
        User nextSalesman = salesmanRepository.findById(nextSalesmanId)
                .orElseThrow(() -> new PumpBusinessException("SALESMAN_NOT_FOUND", "Next salesman not found"));
        if (!"SALESMAN".equals(nextSalesman.getRole().getRoleName())) {
            throw new PumpBusinessException("INVALID_ROLE", "User is not a salesman");
        }
        if (!pumpMasterId.equals(nextSalesman.getPumpMaster().getId())) {
            throw new PumpBusinessException("TENANT_MISMATCH", "Next salesman does not belong to this pump master");
        }

        // Get product price
        BigDecimal productPrice = previousShift.getNozzle().getTank().getProduct().getSalesRate();
        if (productPrice == null) {
            throw new PumpBusinessException("PRODUCT_PRICE_NOT_FOUND", "Product sales rate not found for nozzle");
        }

        // Create new shift with opening balance auto-populated from previous closing balance
        SalesmanNozzleShift newShift = new SalesmanNozzleShift(
                nextSalesman,
                previousShift.getNozzle(),
                LocalDateTime.now(ZoneOffset.UTC), // Set start time automatically in UTC
                previousShift.getClosingBalance(), // Auto-populate opening balance from previous closing balance
                productPrice,
                previousShift.getPumpMaster()
        );

        repository.save(newShift);
    }
}
