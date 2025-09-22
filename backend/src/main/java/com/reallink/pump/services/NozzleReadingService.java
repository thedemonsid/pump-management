package com.reallink.pump.services;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateNozzleReadingRequest;
import com.reallink.pump.dto.request.UpdateNozzleReadingRequest;
import com.reallink.pump.dto.response.NozzleReadingResponse;
import com.reallink.pump.entities.Nozzle;
import com.reallink.pump.entities.NozzleReading;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.mapper.NozzleReadingMapper;
import com.reallink.pump.repositories.NozzleReadingRepository;
import com.reallink.pump.repositories.NozzleRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NozzleReadingService {

    private final NozzleReadingRepository repository;
    private final NozzleReadingMapper mapper;
    private final NozzleRepository nozzleRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;

    public java.util.List<NozzleReadingResponse> getAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public java.util.List<NozzleReadingResponse> getByDateAndPumpMasterId(LocalDate date, UUID pumpMasterId) {
        return repository.findByDateAndPumpMasterId(date, pumpMasterId).stream().map(mapper::toResponse).toList();
    }

    public NozzleReadingResponse getById(@NotNull UUID id) {
        return repository.findById(id).map(mapper::toResponse).orElse(null);
    }

    @Transactional
    public NozzleReadingResponse create(@Valid CreateNozzleReadingRequest request) {
        // Fetch the Nozzle entity
        Nozzle nozzle = nozzleRepository.findById(request.getNozzleId()).orElse(null);
        if (nozzle == null) {
            throw new IllegalArgumentException("Invalid nozzleId: " + request.getNozzleId());
        }
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new IllegalArgumentException("Invalid pumpMasterId: " + request.getPumpMasterId());
        }
        NozzleReading nozzleReading = mapper.toEntity(request);
        nozzleReading.setNozzle(nozzle);
        nozzleReading.setPumpMaster(pumpMaster);
        nozzleReading.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());
        NozzleReading savedNozzleReading = repository.save(nozzleReading);
        return mapper.toResponse(savedNozzleReading);
    }

    @Transactional
    public NozzleReadingResponse update(@NotNull UUID id, @Valid UpdateNozzleReadingRequest request) {
        NozzleReading existing = repository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        mapper.updateEntity(request, existing);
        NozzleReading updated = repository.save(existing);
        return mapper.toResponse(updated);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        repository.deleteById(id);
    }
}
