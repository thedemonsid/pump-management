package com.reallink.pump.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateDipReadingRequest;
import com.reallink.pump.dto.request.UpdateDipReadingRequest;
import com.reallink.pump.dto.response.DipReadingResponse;
import com.reallink.pump.entities.DipReading;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Tank;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.DipReadingMapper;
import com.reallink.pump.repositories.DipReadingRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.TankRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DipReadingService {

    private final DipReadingRepository repository;
    private final TankRepository tankRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final DipReadingMapper mapper;

    /**
     * Get dip reading by ID (for pump master context only)
     */
    public DipReadingResponse getById(@NotNull UUID id, @NotNull UUID pumpMasterId) {
        DipReading dipReading = repository.findById(id)
                .orElseThrow(() -> new PumpBusinessException(
                "DIP_READING_NOT_FOUND",
                "Dip reading with ID " + id + " not found"
        ));

        // Ensure dip reading belongs to the pump master
        if (!dipReading.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "UNAUTHORIZED_ACCESS",
                    "Dip reading does not belong to the specified pump master"
            );
        }

        return mapper.toResponse(dipReading);
    }

    /**
     * Get dip readings by pump master ID with date range filter (paginated)
     * This is the primary method for fetching dip readings
     */
    public Page<DipReadingResponse> getByPumpMasterIdWithDateRange(
            @NotNull UUID pumpMasterId,
            @NotNull LocalDateTime startDate,
            @NotNull LocalDateTime endDate,
            Pageable pageable) {
        return repository.searchDipReadings(null, pumpMasterId, startDate, endDate, pageable)
                .map(mapper::toResponse);
    }

    /**
     * Get dip readings by pump master ID with date range filter (list)
     */
    public List<DipReadingResponse> getByPumpMasterIdAndDateRange(
            @NotNull UUID pumpMasterId,
            @NotNull LocalDateTime startDate,
            @NotNull LocalDateTime endDate) {
        return repository.findByPumpMasterIdAndDateRange(pumpMasterId, startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Get dip readings by tank and date range (for specific tank within pump
     * master)
     */
    public List<DipReadingResponse> getByTankIdAndDateRange(
            @NotNull UUID tankId,
            @NotNull UUID pumpMasterId,
            @NotNull LocalDateTime startDate,
            @NotNull LocalDateTime endDate) {
        // Verify tank belongs to pump master
        Tank tank = tankRepository.findById(tankId)
                .orElseThrow(() -> new PumpBusinessException(
                "INVALID_TANK",
                "Tank with ID " + tankId + " does not exist"
        ));

        if (!tank.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "UNAUTHORIZED_ACCESS",
                    "Tank does not belong to the specified pump master"
            );
        }

        return repository.findByTankIdAndDateRange(tankId, startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Get dip readings by tank with date range (paginated)
     */
    public Page<DipReadingResponse> getByTankIdAndDateRangePaginated(
            @NotNull UUID tankId,
            @NotNull UUID pumpMasterId,
            @NotNull LocalDateTime startDate,
            @NotNull LocalDateTime endDate,
            Pageable pageable) {
        // Verify tank belongs to pump master
        Tank tank = tankRepository.findById(tankId)
                .orElseThrow(() -> new PumpBusinessException(
                "INVALID_TANK",
                "Tank with ID " + tankId + " does not exist"
        ));

        if (!tank.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "UNAUTHORIZED_ACCESS",
                    "Tank does not belong to the specified pump master"
            );
        }

        return repository.searchDipReadings(tankId, pumpMasterId, startDate, endDate, pageable)
                .map(mapper::toResponse);
    }

    /**
     * Get latest dip reading for a tank (within pump master context)
     */
    public DipReadingResponse getLatestByTankId(@NotNull UUID tankId, @NotNull UUID pumpMasterId) {
        // Verify tank belongs to pump master
        Tank tank = tankRepository.findById(tankId)
                .orElseThrow(() -> new PumpBusinessException(
                "INVALID_TANK",
                "Tank with ID " + tankId + " does not exist"
        ));

        if (!tank.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "UNAUTHORIZED_ACCESS",
                    "Tank does not belong to the specified pump master"
            );
        }

        DipReading dipReading = repository.findFirstByTankIdOrderByReadingTimestampDesc(tankId)
                .orElseThrow(() -> new PumpBusinessException(
                "DIP_READING_NOT_FOUND",
                "No dip reading found for tank with ID " + tankId
        ));
        return mapper.toResponse(dipReading);
    }

    /**
     * Get dip readings with high variance for a pump master
     */
    public List<DipReadingResponse> getReadingsWithHighVariance(
            @NotNull UUID pumpMasterId,
            @NotNull Double threshold) {
        return repository.findReadingsWithHighVariance(threshold).stream()
                .filter(reading -> reading.getPumpMaster().getId().equals(pumpMasterId))
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Create a new dip reading
     */
    @Transactional
    public DipReadingResponse create(@Valid CreateDipReadingRequest request, @NotNull UUID pumpMasterId) {
        // Validate tank exists and belongs to pump master
        Tank tank = tankRepository.findById(request.getTankId())
                .orElseThrow(() -> new PumpBusinessException(
                "INVALID_TANK",
                "Tank with ID " + request.getTankId() + " does not exist"
        ));

        if (!tank.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "UNAUTHORIZED_ACCESS",
                    "Tank does not belong to the specified pump master"
            );
        }

        // Validate pump master exists
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(pumpMasterId)
                .orElseThrow(() -> new PumpBusinessException(
                "INVALID_PUMP_MASTER",
                "Pump master with ID " + pumpMasterId + " does not exist"
        ));

        // Ensure request pump master ID matches
        if (!request.getPumpMasterId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "PUMP_MASTER_MISMATCH",
                    "Request pump master ID does not match the authenticated pump master"
            );
        }

        // Check for duplicate reading at same timestamp
        if (repository.existsByTankIdAndReadingTimestamp(request.getTankId(), LocalDateTime.now())) {
            throw new PumpBusinessException(
                    "DUPLICATE_DIP_READING",
                    "A dip reading already exists for this tank at the current timestamp"
            );
        }

        // Create entity
        DipReading dipReading = mapper.toEntity(request);
        dipReading.setTank(tank);
        dipReading.setPumpMaster(pumpMaster);
        // Set reading timestamp to current server time
        dipReading.setReadingTimestamp(LocalDateTime.now());

        // Save and return response
        DipReading savedDipReading = repository.save(dipReading);
        return mapper.toResponse(savedDipReading);
    }

    /**
     * Update an existing dip reading
     */
    @Transactional
    public DipReadingResponse update(@NotNull UUID id, @Valid UpdateDipReadingRequest request, @NotNull UUID pumpMasterId) {
        // Find existing dip reading
        DipReading dipReading = repository.findById(id)
                .orElseThrow(() -> new PumpBusinessException(
                "DIP_READING_NOT_FOUND",
                "Dip reading with ID " + id + " not found"
        ));

        // Ensure dip reading belongs to the pump master
        if (!dipReading.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "UNAUTHORIZED_ACCESS",
                    "Dip reading does not belong to the specified pump master"
            );
        }

        // Validate tank exists and belongs to pump master
        Tank tank = tankRepository.findById(request.getTankId())
                .orElseThrow(() -> new PumpBusinessException(
                "INVALID_TANK",
                "Tank with ID " + request.getTankId() + " does not exist"
        ));

        if (!tank.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "UNAUTHORIZED_ACCESS",
                    "Tank does not belong to the specified pump master"
            );
        }

        // Validate pump master exists
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(pumpMasterId)
                .orElseThrow(() -> new PumpBusinessException(
                "INVALID_PUMP_MASTER",
                "Pump master with ID " + pumpMasterId + " does not exist"
        ));

        // Ensure request pump master ID matches
        if (!request.getPumpMasterId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "PUMP_MASTER_MISMATCH",
                    "Request pump master ID does not match the authenticated pump master"
            );
        }

        // Update entity
        mapper.updateEntityFromRequest(request, dipReading);
        dipReading.setTank(tank);
        dipReading.setPumpMaster(pumpMaster);
        // Note: We do NOT update readingTimestamp - it should remain the original timestamp

        // Save and return response
        DipReading updatedDipReading = repository.save(dipReading);
        return mapper.toResponse(updatedDipReading);
    }

    /**
     * Delete a dip reading
     */
    @Transactional
    public void delete(@NotNull UUID id, @NotNull UUID pumpMasterId) {
        DipReading dipReading = repository.findById(id)
                .orElseThrow(() -> new PumpBusinessException(
                "DIP_READING_NOT_FOUND",
                "Dip reading with ID " + id + " not found"
        ));

        // Ensure dip reading belongs to the pump master
        if (!dipReading.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "UNAUTHORIZED_ACCESS",
                    "Dip reading does not belong to the specified pump master"
            );
        }

        repository.deleteById(id);
    }

    /**
     * Get count of dip readings for a tank (within pump master context)
     */
    public long countByTankId(@NotNull UUID tankId, @NotNull UUID pumpMasterId) {
        // Verify tank belongs to pump master
        Tank tank = tankRepository.findById(tankId)
                .orElseThrow(() -> new PumpBusinessException(
                "INVALID_TANK",
                "Tank with ID " + tankId + " does not exist"
        ));

        if (!tank.getPumpMaster().getId().equals(pumpMasterId)) {
            throw new PumpBusinessException(
                    "UNAUTHORIZED_ACCESS",
                    "Tank does not belong to the specified pump master"
            );
        }

        return repository.countByTankId(tankId);
    }
}
