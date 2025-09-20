package com.reallink.pump.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreatePumpInfoMasterRequest;
import com.reallink.pump.dto.request.UpdatePumpInfoMasterRequest;
import com.reallink.pump.dto.response.PumpInfoMasterResponse;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.mapper.PumpInfoMasterMapper;
import com.reallink.pump.repositories.PumpInfoMasterRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PumpInfoMasterService {

    private final PumpInfoMasterRepository repository;
    private final PumpInfoMasterMapper mapper;

    public Page<PumpInfoMasterResponse> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toResponse);
    }

    public java.util.List<PumpInfoMasterResponse> getAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public PumpInfoMasterResponse getById(@NotNull UUID id) {
        return repository.findById(id).map(mapper::toResponse).orElse(null);
    }

    public PumpInfoMasterResponse getByPumpCode(@NotNull String pumpCode) {
        return repository.findByPumpCode(pumpCode).map(mapper::toResponse).orElse(null);
    }

    public Page<PumpInfoMasterResponse> searchPumps(String pumpName, String pumpCode, Pageable pageable) {
        return repository.findBySearchCriteria(pumpName, pumpCode, pageable).map(mapper::toResponse);
    }

    @Transactional
    public PumpInfoMasterResponse create(@Valid CreatePumpInfoMasterRequest request) {
        PumpInfoMaster pump = mapper.toEntity(request);
        PumpInfoMaster savedPump = repository.save(pump);
        return mapper.toResponse(savedPump);
    }

    @Transactional
    public PumpInfoMasterResponse update(@NotNull UUID id, @Valid UpdatePumpInfoMasterRequest request) {
        PumpInfoMaster existingPump = repository.findById(id).orElse(null);
        if (existingPump == null) {
            return null;
        }
        mapper.updateEntity(request, existingPump);
        PumpInfoMaster updatedPump = repository.save(existingPump);
        return mapper.toResponse(updatedPump);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        repository.deleteById(id);
    }

    public boolean existsByPumpCode(@NotNull String pumpCode) {
        return repository.existsByPumpCode(pumpCode);
    }

    public boolean existsByPumpId(@NotNull Integer pumpId) {
        return repository.existsByPumpId(pumpId);
    }

    public long getTotalCount() {
        return repository.countTotal();
    }

    // Validation removed
}
