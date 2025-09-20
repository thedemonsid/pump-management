package com.reallink.pump.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateTankRequest;
import com.reallink.pump.dto.request.UpdateTankRequest;
import com.reallink.pump.dto.response.TankResponse;
import com.reallink.pump.entities.Product;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Tank;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.TankMapper;
import com.reallink.pump.repositories.ProductRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.TankRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TankService {

    private final TankRepository repository;
    private final ProductRepository productRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final TankMapper mapper;

    public Page<TankResponse> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toResponse);
    }

    public List<TankResponse> getAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public TankResponse getById(@NotNull UUID id) {
        Tank tank = repository.findById(id).orElse(null);
        if (tank == null) {
            throw new PumpBusinessException("TANK_NOT_FOUND", "Tank with ID " + id + " not found");
        }
        return mapper.toResponse(tank);
    }

    public List<TankResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public TankResponse create(@Valid CreateTankRequest request) {
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            throw new PumpBusinessException("INVALID_PRODUCT", "Product with ID " + request.getProductId() + " does not exist");
        }
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER", "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }
        Tank tank = mapper.toEntity(request);
        tank.setProduct(product);
        tank.setPumpMaster(pumpMaster);
        if (tank.getCurrentLevel() == null) {
            tank.setCurrentLevel(BigDecimal.ZERO);
        }
        Tank savedTank = repository.save(tank);
        return mapper.toResponse(savedTank);
    }

    @Transactional
    public TankResponse update(@NotNull UUID id, @Valid UpdateTankRequest request) {
        Tank existingTank = repository.findById(id).orElse(null);
        if (existingTank == null) {
            throw new PumpBusinessException("TANK_NOT_FOUND", "Tank with ID " + id + " not found");
        }
        mapper.updateEntity(request, existingTank);
        Tank updatedTank = repository.save(existingTank);
        return mapper.toResponse(updatedTank);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("TANK_NOT_FOUND", "Tank with ID " + id + " not found");
        }
        repository.deleteById(id);
    }
}
