package com.reallink.pump.services;

import java.math.BigDecimal;
import java.time.LocalDate;
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
import com.reallink.pump.repositories.DailyTankLevelRepository;
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
    private final DailyTankLevelRepository dailyTankLevelRepository;

    public Page<TankResponse> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable).map(tank -> {
            TankResponse response = mapper.toResponse(tank);
            setCurrentLevel(response, tank);
            return response;
        });
    }

    public List<TankResponse> getAll() {
        return repository.findAll().stream()
                .map(tank -> {
                    TankResponse response = mapper.toResponse(tank);
                    setCurrentLevel(response, tank);
                    return response;
                })
                .toList();
    }

    public TankResponse getById(@NotNull UUID id) {
        Tank tank = repository.findById(id).orElse(null);
        if (tank == null) {
            throw new PumpBusinessException("TANK_NOT_FOUND", "Tank with ID " + id + " not found");
        }
        TankResponse response = mapper.toResponse(tank);
        setCurrentLevel(response, tank);
        return response;
    }

    public List<TankResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(tank -> {
                    TankResponse response = mapper.toResponse(tank);
                    setCurrentLevel(response, tank);
                    return response;
                })
                .toList();
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
        Tank savedTank = repository.save(tank);
        TankResponse response = mapper.toResponse(savedTank);
        setCurrentLevel(response, savedTank);
        return response;
    }

    @Transactional
    public TankResponse update(@NotNull UUID id, @Valid UpdateTankRequest request) {
        Tank existingTank = repository.findById(id).orElse(null);
        if (existingTank == null) {
            throw new PumpBusinessException("TANK_NOT_FOUND", "Tank with ID " + id + " not found");
        }
        mapper.updateEntity(request, existingTank);
        Tank updatedTank = repository.save(existingTank);
        TankResponse response = mapper.toResponse(updatedTank);
        setCurrentLevel(response, updatedTank);
        return response;
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("TANK_NOT_FOUND", "Tank with ID " + id + " not found");
        }
        repository.deleteById(id);
    }

    private void setCurrentLevel(TankResponse response, Tank tank) {
        BigDecimal cumulativeNetUpToToday = dailyTankLevelRepository.getCumulativeNetUpToDate(tank.getId(), LocalDate.now());
        BigDecimal currentLevel = tank.getOpeningLevel().add(cumulativeNetUpToToday);

        // Set current level
        response.setCurrentLevel(currentLevel);

        // Set calculated fields that depend on current level
        response.setAvailableCapacity(tank.getAvailableCapacity(currentLevel));
        response.setFillPercentage(tank.getFillPercentage(currentLevel));
        response.setIsLowLevel(tank.isLowLevel(currentLevel));
    }

    /**
     * Calculate the current fuel level of a tank (closing balance of today)
     * This is calculated as: Opening Level + Cumulative Net (Additions -
     * Removals) up to today
     *
     * @param tankId the ID of the tank
     * @return the current fuel level as of today
     */
    public BigDecimal getCurrentFuelLevel(@NotNull UUID tankId) {
        Tank tank = repository.findById(tankId).orElse(null);
        if (tank == null) {
            throw new PumpBusinessException("TANK_NOT_FOUND", "Tank with ID " + tankId + " not found");
        }

        // Get cumulative net (additions - removals) up to today
        BigDecimal cumulativeNetUpToToday = dailyTankLevelRepository.getCumulativeNetUpToDate(tankId, LocalDate.now());

        // Current level = Opening level + Cumulative net
        return tank.getOpeningLevel().add(cumulativeNetUpToToday);
    }
}
