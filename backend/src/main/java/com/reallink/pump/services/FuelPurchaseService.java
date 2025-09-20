package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateFuelPurchaseRequest;
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
}
