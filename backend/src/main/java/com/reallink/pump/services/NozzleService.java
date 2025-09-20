package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateNozzleRequest;
import com.reallink.pump.dto.request.UpdateNozzleRequest;
import com.reallink.pump.dto.response.NozzleResponse;
import com.reallink.pump.entities.Nozzle;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Tank;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.NozzleMapper;
import com.reallink.pump.repositories.NozzleRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.TankRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NozzleService {

    private final NozzleRepository repository;
    private final NozzleMapper mapper;
    private final TankRepository tankRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;

    public Page<NozzleResponse> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toResponse);
    }

    public List<NozzleResponse> getAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public List<NozzleResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream().map(mapper::toResponse).toList();
    }

    public NozzleResponse getById(@NotNull UUID id) {
        Nozzle nozzle = repository.findById(id).orElse(null);
        if (nozzle == null) {
            throw new PumpBusinessException("NOZZLE_NOT_FOUND", "Nozzle with ID " + id + " not found");
        }
        return mapper.toResponse(nozzle);
    }

    @Transactional
    public NozzleResponse create(@Valid CreateNozzleRequest request) {
        // Fetch the Tank entity using tankId from the request
        Tank tank = tankRepository.findById(request.getTankId()).orElse(null);
        if (tank == null) {
            throw new PumpBusinessException("INVALID_TANK", "Tank with ID " + request.getTankId() + " does not exist");
        }
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER", "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }
        Nozzle nozzle = mapper.toEntity(request);
        nozzle.setTank(tank);
        nozzle.setPumpMaster(pumpMaster);
        Nozzle savedNozzle = repository.save(nozzle);
        return mapper.toResponse(savedNozzle);
    }

    @Transactional
    public NozzleResponse update(@NotNull UUID id, @Valid UpdateNozzleRequest request) {
        Nozzle existingNozzle = repository.findById(id).orElse(null);
        if (existingNozzle == null) {
            throw new PumpBusinessException("NOZZLE_NOT_FOUND", "Nozzle with ID " + id + " not found");
        }
        mapper.updateEntity(request, existingNozzle);
        Nozzle updatedNozzle = repository.save(existingNozzle);
        return mapper.toResponse(updatedNozzle);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("NOZZLE_NOT_FOUND", "Nozzle with ID " + id + " not found");
        }
        repository.deleteById(id);
    }
}
