package com.reallink.pump.services;

import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateShiftRequest;
import com.reallink.pump.dto.request.UpdateShiftRequest;
import com.reallink.pump.dto.response.ShiftResponse;
import com.reallink.pump.entities.ShiftMaster;
import com.reallink.pump.mapper.ShiftMasterMapper;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.ShiftMasterRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShiftMasterService {

    private final ShiftMasterRepository repository;
    private final ShiftMasterMapper mapper;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;

    public java.util.List<ShiftResponse> getAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public java.util.List<ShiftResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream().map(mapper::toResponse).toList();
    }

    public ShiftResponse getById(@NotNull UUID id) {
        return repository.findById(id).map(mapper::toResponse).orElse(null);
    }

    @Transactional
    public ShiftResponse create(@Valid CreateShiftRequest request) {
        ShiftMaster shift = mapper.toEntity(request);
        shift.setPumpMaster(pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElseThrow(() -> new RuntimeException("Pump Master not found")));
        shift.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());
        ShiftMaster savedShift = repository.save(shift);
        return mapper.toResponse(savedShift);
    }

    @Transactional
    public ShiftResponse update(@NotNull UUID id, @Valid UpdateShiftRequest request) {
        ShiftMaster existingShift = repository.findById(id).orElse(null);
        if (existingShift == null) {
            return null;
        }
        mapper.updateEntity(request, existingShift);
        ShiftMaster updatedShift = repository.save(existingShift);
        return mapper.toResponse(updatedShift);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        repository.deleteById(id);
    }
}
