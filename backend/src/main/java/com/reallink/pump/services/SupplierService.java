package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateSupplierRequest;
import com.reallink.pump.dto.request.UpdateSupplierRequest;
import com.reallink.pump.dto.response.SupplierResponse;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Supplier;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.SupplierMapper;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SupplierRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierService {

  private final SupplierRepository repository;
  private final PumpInfoMasterRepository pumpInfoMasterRepository;
  private final SupplierMapper mapper;

  public List<SupplierResponse> getAll() {
    return repository.findAll().stream()
        .map(mapper::toResponse)
        .toList();
  }

  public Page<SupplierResponse> getAllPaginated(Pageable pageable) {
    return repository.findAll(pageable)
        .map(mapper::toResponse);
  }

  public SupplierResponse getById(@NotNull UUID id) {
    Supplier supplier = repository.findById(id).orElse(null);
    if (supplier == null) {
      throw new PumpBusinessException("SUPPLIER_NOT_FOUND", "Supplier with ID " + id + " not found");
    }
    return mapper.toResponse(supplier);
  }

  public List<SupplierResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
    return repository.findByPumpMaster_Id(pumpMasterId).stream()
        .map(mapper::toResponse)
        .toList();
  }

  public SupplierResponse getBySupplierNameAndPumpMasterId(@NotNull String supplierName, @NotNull UUID pumpMasterId) {
    Supplier supplier = repository.findBySupplierNameAndPumpMaster_Id(supplierName, pumpMasterId).orElse(null);
    if (supplier == null) {
      throw new PumpBusinessException("SUPPLIER_NOT_FOUND",
          "Supplier with name '" + supplierName + "' and pump master ID " + pumpMasterId + " not found");
    }
    return mapper.toResponse(supplier);
  }

  public List<SupplierResponse> searchSuppliers(String supplierName, String contactPersonName, String address,
      String gstNumber, String taxIdentificationNumber, UUID pumpMasterId) {
    return repository
        .findBySearchCriteria(supplierName, contactPersonName, address, gstNumber, taxIdentificationNumber,
            pumpMasterId)
        .stream()
        .map(mapper::toResponse)
        .toList();
  }

  public List<SupplierResponse> getBySupplierNameContaining(@NotNull String supplierName) {
    return repository.findBySupplierNameContainingIgnoreCase(supplierName).stream()
        .map(mapper::toResponse)
        .toList();
  }

  public List<SupplierResponse> getByContactPersonNameContaining(@NotNull String contactPersonName) {
    return repository.findByContactPersonNameContainingIgnoreCase(contactPersonName).stream()
        .map(mapper::toResponse)
        .toList();
  }

  @Transactional
  public SupplierResponse create(@Valid CreateSupplierRequest request) {
    System.out.println("Creating supplier: " + request);
    // Check for duplicate supplier name
    if (repository.existsBySupplierNameAndPumpMaster_Id(request.getSupplierName(), request.getPumpMasterId())) {
      throw new PumpBusinessException("DUPLICATE_SUPPLIER",
          "Supplier with name '" + request.getSupplierName() + "' already exists for this pump master");
    }
    System.out.println("No duplicate supplier found");
    // Fetch the PumpInfoMaster entity using pumpMasterId from the request
    PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
    if (pumpMaster == null) {
      throw new PumpBusinessException("INVALID_PUMP_MASTER",
          "Pump master with ID " + request.getPumpMasterId() + " does not exist");
    }
    System.out.println("Pump master found: " + pumpMaster.getPumpName());
    Supplier supplier = mapper.toEntity(request);
    supplier.setPumpMaster(pumpMaster);
    Supplier savedSupplier = repository.save(supplier);
    return mapper.toResponse(savedSupplier);
  }

  @Transactional
  public SupplierResponse update(@NotNull UUID id, @Valid UpdateSupplierRequest request) {
    Supplier existingSupplier = repository.findById(id).orElse(null);
    if (existingSupplier == null) {
      throw new PumpBusinessException("SUPPLIER_NOT_FOUND", "Supplier with ID " + id + " not found");
    }

    // Check for duplicate supplier name if name is being updated
    if (request.getSupplierName() != null
        && !request.getSupplierName().equals(existingSupplier.getSupplierName())
        && repository.existsBySupplierNameAndPumpMaster_IdAndIdNot(request.getSupplierName(),
            existingSupplier.getPumpMaster().getId(), id)) {
      throw new PumpBusinessException("DUPLICATE_SUPPLIER",
          "Supplier with name '" + request.getSupplierName() + "' already exists for this pump master");
    }

    mapper.updateEntityFromRequest(request, existingSupplier);
    Supplier updatedSupplier = repository.save(existingSupplier);
    return mapper.toResponse(updatedSupplier);
  }

  @Transactional
  public void delete(@NotNull UUID id) {
    if (!repository.existsById(id)) {
      throw new PumpBusinessException("SUPPLIER_NOT_FOUND", "Supplier with ID " + id + " not found");
    }
    repository.deleteById(id);
  }

  public boolean existsBySupplierNameAndPumpMasterId(@NotNull String supplierName, @NotNull UUID pumpMasterId) {
    return repository.existsBySupplierNameAndPumpMaster_Id(supplierName, pumpMasterId);
  }

  public long getCountByPumpMasterId(@NotNull UUID pumpMasterId) {
    return repository.countByPumpMasterId(pumpMasterId);
  }

  public List<String> getDistinctContactPersonNames() {
    return repository.findDistinctContactPersonNames();
  }
}
