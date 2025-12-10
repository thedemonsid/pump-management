package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateFuelPurchaseRequest;
import com.reallink.pump.dto.request.CreateTankTransactionRequest;
import com.reallink.pump.dto.request.UpdateFuelPurchaseRequest;
import com.reallink.pump.dto.response.FuelPurchaseResponse;
import com.reallink.pump.entities.FuelPurchase;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Supplier;
import com.reallink.pump.entities.Tank;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.FuelPurchaseMapper;
import com.reallink.pump.repositories.FuelPurchaseRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SupplierRepository;
import com.reallink.pump.repositories.TankRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FuelPurchaseService {

    private final FuelPurchaseRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final SupplierRepository supplierRepository;
    private final TankRepository tankRepository;
    private final FuelPurchaseMapper mapper;
    private final TankTransactionService tankTransactionService;

    public List<FuelPurchaseResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public FuelPurchaseResponse getById(@NotNull UUID id) {
        FuelPurchase fuelPurchase = repository.findById(id)
                .orElseThrow(() -> new PumpBusinessException("FUEL_PURCHASE_NOT_FOUND",
                "Fuel purchase with ID " + id + " not found"));
        return mapper.toResponse(fuelPurchase);
    }

    public List<FuelPurchaseResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<FuelPurchaseResponse> getBySupplierId(@NotNull UUID supplierId) {
        return repository.findTopNBySupplierIdOrderByPurchaseDateDesc(supplierId, PageRequest.of(0, Integer.MAX_VALUE)).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<FuelPurchaseResponse> getBySupplierId(@NotNull UUID supplierId, Integer limit) {
        if (limit != null && limit > 0) {
            return repository.findTopNBySupplierIdOrderByPurchaseDateDesc(supplierId, PageRequest.of(0, limit)).stream()
                    .map(mapper::toResponse)
                    .toList();
        }
        return getBySupplierId(supplierId);
    }

    /**
     * Get fuel purchases by pump master ID and date range This method provides
     * efficient filtering at the database level
     *
     * @param pumpMasterId The pump master ID
     * @param fromDate The start date (inclusive), if null will use a very old
     * date
     * @param toDate The end date (inclusive), if null will use current date
     * @return List of fuel purchases within the date range
     */
    public List<FuelPurchaseResponse> getByPumpMasterIdAndDateRange(
            @NotNull UUID pumpMasterId,
            java.time.LocalDate fromDate,
            java.time.LocalDate toDate) {

        // Set default values if dates are not provided
        java.time.LocalDate effectiveFromDate = fromDate != null ? fromDate : java.time.LocalDate.of(2000, 1, 1);
        java.time.LocalDate effectiveToDate = toDate != null ? toDate : java.time.LocalDate.now();

        return repository.findByPumpMasterIdAndDateRange(pumpMasterId, effectiveFromDate, effectiveToDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public FuelPurchaseResponse getByFuelPurchaseIdAndPumpMasterId(@NotNull Long fuelPurchaseId, @NotNull UUID pumpMasterId) {
        FuelPurchase fuelPurchase = repository.findByFuelPurchaseIdAndPumpMaster_Id(fuelPurchaseId, pumpMasterId)
                .orElseThrow(() -> new PumpBusinessException("FUEL_PURCHASE_NOT_FOUND",
                "Fuel purchase with ID " + fuelPurchaseId + " not found for pump master " + pumpMasterId));
        return mapper.toResponse(fuelPurchase);
    }

    @Transactional
    public FuelPurchaseResponse create(@Valid CreateFuelPurchaseRequest request) {
        // Validate pump master
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Validate supplier
        Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
        if (supplier == null) {
            throw new PumpBusinessException("INVALID_SUPPLIER",
                    "Supplier with ID " + request.getSupplierId() + " does not exist");
        }

        // Validate tank
        Tank tank = tankRepository.findById(request.getTankId()).orElse(null);
        if (tank == null) {
            throw new PumpBusinessException("INVALID_TANK",
                    "Tank with ID " + request.getTankId() + " does not exist");
        }

        // Check for duplicate invoice number
        if (repository.existsByInvoiceNumberAndPumpMaster_Id(request.getInvoiceNumber(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_INVOICE",
                    "Fuel purchase with invoice number '" + request.getInvoiceNumber() + "' already exists for this pump master");
        }

        // Generate fuelPurchaseId
        Long maxFuelPurchaseId = repository.findMaxFuelPurchaseIdByPumpMasterId(request.getPumpMasterId());
        Long newFuelPurchaseId = maxFuelPurchaseId + 1;

        FuelPurchase fuelPurchase = mapper.toEntity(request);
        fuelPurchase.setPumpMaster(pumpMaster);
        fuelPurchase.setSupplier(supplier);
        fuelPurchase.setTank(tank);
        fuelPurchase.setFuelPurchaseId(newFuelPurchaseId);
        fuelPurchase.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        FuelPurchase savedFuelPurchase = repository.save(fuelPurchase);

        // If addToStock is true, update tank level and create tank transaction
        if (Boolean.TRUE.equals(savedFuelPurchase.getAddToStock())) {
            updateTankLevelAndCreateTransaction(savedFuelPurchase);
        }

        return mapper.toResponse(savedFuelPurchase);
    }

    @Transactional
    public FuelPurchaseResponse update(@NotNull UUID id, @Valid UpdateFuelPurchaseRequest request) {
        FuelPurchase fuelPurchase = repository.findById(id)
                .orElseThrow(() -> new PumpBusinessException("FUEL_PURCHASE_NOT_FOUND",
                "Fuel purchase with ID " + id + " not found"));

        // Validate supplier
        Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
        if (supplier == null) {
            throw new PumpBusinessException("INVALID_SUPPLIER",
                    "Supplier with ID " + request.getSupplierId() + " does not exist");
        }

        // Validate tank
        Tank tank = tankRepository.findById(request.getTankId()).orElse(null);
        if (tank == null) {
            throw new PumpBusinessException("INVALID_TANK",
                    "Tank with ID " + request.getTankId() + " does not exist");
        }

        // Check for duplicate invoice number (excluding current record)
        if (repository.existsByInvoiceNumberAndPumpMaster_IdAndIdNot(request.getInvoiceNumber(),
                fuelPurchase.getPumpMaster().getId(), id)) {
            throw new PumpBusinessException("DUPLICATE_INVOICE",
                    "Fuel purchase with invoice number '" + request.getInvoiceNumber() + "' already exists for this pump master");
        }

        mapper.updateEntityFromRequest(request, fuelPurchase);
        fuelPurchase.setSupplier(supplier);
        fuelPurchase.setTank(tank);

        FuelPurchase savedFuelPurchase = repository.save(fuelPurchase);
        return mapper.toResponse(savedFuelPurchase);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        FuelPurchase fuelPurchase = repository.findById(id)
                .orElseThrow(() -> new PumpBusinessException("FUEL_PURCHASE_NOT_FOUND",
                "Fuel purchase with ID " + id + " not found"));
        repository.delete(fuelPurchase);
    }

    private void updateTankLevelAndCreateTransaction(FuelPurchase fuelPurchase) {
        // NOTE: Tank's current level is now calculated dynamically from transactions
        // No need to update tank.currentLevel anymore

        Tank tank = fuelPurchase.getTank();

        // Create tank transaction - this will be used to calculate current level
        CreateTankTransactionRequest transactionRequest = new CreateTankTransactionRequest();
        transactionRequest.setVolume(fuelPurchase.getQuantity());
        transactionRequest.setTransactionDate(fuelPurchase.getPurchaseDate().atStartOfDay());
        transactionRequest.setDescription("Fuel purchase - Invoice: " + fuelPurchase.getInvoiceNumber());
        transactionRequest.setSupplierName(fuelPurchase.getSupplier().getSupplierName());
        transactionRequest.setInvoiceNumber(fuelPurchase.getInvoiceNumber());

        tankTransactionService.createAdditionTransaction(tank.getId(), transactionRequest, fuelPurchase);
    }
}
