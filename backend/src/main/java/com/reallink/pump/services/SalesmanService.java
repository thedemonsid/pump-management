package com.reallink.pump.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateSalesmanRequest;
import com.reallink.pump.dto.request.UpdateSalesmanRequest;
import com.reallink.pump.dto.response.SalesmanResponse;
import com.reallink.pump.entities.Salesman;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.SalesmanMapper;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SalesmanRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesmanService {

    private final SalesmanRepository repository;
    private final SalesmanMapper mapper;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;

    public Page<SalesmanResponse> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toResponse);
    }

    public java.util.List<SalesmanResponse> getAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public java.util.List<SalesmanResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream().map(mapper::toResponse).toList();
    }

    public SalesmanResponse getById(@NotNull UUID id) {
        Salesman salesman = repository.findById(id).orElse(null);
        if (salesman == null) {
            throw new PumpBusinessException("SALESMAN_NOT_FOUND", "Salesman with ID " + id + " not found");
        }
        return mapper.toResponse(salesman);
    }

    @Transactional
    public SalesmanResponse create(@Valid CreateSalesmanRequest request) {
        Salesman salesman = mapper.toEntity(request);
        salesman.setPumpMaster(pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElseThrow(() -> new PumpBusinessException("INVALID_PUMP_MASTER", "Pump master with ID " + request.getPumpMasterId() + " does not exist")));
        Salesman savedSalesman = repository.save(salesman);
        return mapper.toResponse(savedSalesman);
    }

    @Transactional
    public SalesmanResponse update(@NotNull UUID id, @Valid UpdateSalesmanRequest request) {
        Salesman existingSalesman = repository.findById(id).orElse(null);
        if (existingSalesman == null) {
            throw new PumpBusinessException("SALESMAN_NOT_FOUND", "Salesman with ID " + id + " not found");
        }
        mapper.updateEntity(request, existingSalesman);
        Salesman updatedSalesman = repository.save(existingSalesman);
        return mapper.toResponse(updatedSalesman);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("SALESMAN_NOT_FOUND", "Salesman with ID " + id + " not found");
        }
        repository.deleteById(id);
    }
}
