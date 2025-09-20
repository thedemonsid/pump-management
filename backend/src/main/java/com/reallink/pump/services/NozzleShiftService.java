package com.reallink.pump.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateNozzleShiftRequest;
import com.reallink.pump.dto.request.UpdateNozzleShiftRequest;
import com.reallink.pump.dto.response.NozzleShiftResponse;
import com.reallink.pump.entities.Nozzle;
import com.reallink.pump.entities.NozzleShift;
import com.reallink.pump.entities.Salesman;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.NozzleShiftMapper;
import com.reallink.pump.repositories.NozzleRepository;
import com.reallink.pump.repositories.NozzleShiftRepository;
import com.reallink.pump.repositories.SalesmanRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NozzleShiftService {

    private final NozzleShiftRepository repository;
    private final NozzleShiftMapper mapper;
    private final NozzleRepository nozzleRepository;
    private final SalesmanRepository salesmanRepository;

    public List<NozzleShiftResponse> getAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public List<NozzleShiftResponse> getByNozzleId(@NotNull UUID nozzleId) {
        return repository.findByNozzle_Id(nozzleId).stream().map(mapper::toResponse).toList();
    }

    public List<NozzleShiftResponse> getBySalesmanId(@NotNull UUID salesmanId) {
        return repository.findBySalesman_Id(salesmanId).stream().map(mapper::toResponse).toList();
    }

    public List<NozzleShiftResponse> getByShiftDate(@NotNull LocalDate shiftDate) {
        return repository.findByShiftDate(shiftDate).stream().map(mapper::toResponse).toList();
    }

    public List<NozzleShiftResponse> getOpenShifts() {
        return repository.findByClosingTimeIsNull().stream().map(mapper::toResponse).toList();
    }

    public NozzleShiftResponse getById(@NotNull UUID id) {
        NozzleShift shift = repository.findById(id).orElse(null);
        if (shift == null) {
            throw new PumpBusinessException("NOZZLE_SHIFT_NOT_FOUND", "Nozzle shift with ID " + id + " not found");
        }
        return mapper.toResponse(shift);
    }

    @Transactional
    public NozzleShiftResponse create(@Valid CreateNozzleShiftRequest request) {
        // Validate nozzle exists
        Nozzle nozzle = nozzleRepository.findById(request.getNozzleId()).orElse(null);
        if (nozzle == null) {
            throw new PumpBusinessException("INVALID_NOZZLE", "Nozzle with ID " + request.getNozzleId() + " does not exist");
        }

        // Validate salesman exists
        Salesman salesman = salesmanRepository.findById(request.getSalesmanId()).orElse(null);
        if (salesman == null) {
            throw new PumpBusinessException("INVALID_SALESMAN", "Salesman with ID " + request.getSalesmanId() + " does not exist");
        }

        // Check if there's already an open shift for this nozzle on this date
        if (repository.existsByNozzle_IdAndShiftDateAndClosingTimeIsNull(request.getNozzleId(), request.getShiftDate())) {
            throw new PumpBusinessException("OPEN_SHIFT_EXISTS", "There is already an open shift for this nozzle on the specified date");
        }

        // Validate next salesman if provided
        if (request.getNextSalesmanId() != null) {
            Salesman nextSalesman = salesmanRepository.findById(request.getNextSalesmanId()).orElse(null);
            if (nextSalesman == null) {
                throw new PumpBusinessException("INVALID_NEXT_SALESMAN", "Next salesman with ID " + request.getNextSalesmanId() + " does not exist");
            }
        }

        NozzleShift shift = mapper.toEntity(request);
        shift.setNozzle(nozzle);
        shift.setSalesman(salesman);
        shift.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        if (request.getNextSalesmanId() != null) {
            Salesman nextSalesman = salesmanRepository.findById(request.getNextSalesmanId()).get();
            shift.setNextSalesman(nextSalesman);
        }

        NozzleShift savedShift = repository.save(shift);
        return mapper.toResponse(savedShift);
    }

    @Transactional
    public NozzleShiftResponse update(@NotNull UUID id, @Valid UpdateNozzleShiftRequest request) {
        NozzleShift existingShift = repository.findById(id).orElse(null);
        if (existingShift == null) {
            throw new PumpBusinessException("NOZZLE_SHIFT_NOT_FOUND", "Nozzle shift with ID " + id + " not found");
        }

        // If closing the shift
        if (request.getClosingReading() != null && existingShift.getClosingTime() == null) {
            existingShift.setClosingTime(LocalTime.now());
            existingShift.setClosingReading(request.getClosingReading());

            // If next salesman is specified, create the next shift
            if (request.getNextSalesmanId() != null) {
                Salesman nextSalesman = salesmanRepository.findById(request.getNextSalesmanId()).orElse(null);
                if (nextSalesman == null) {
                    throw new PumpBusinessException("INVALID_NEXT_SALESMAN", "Next salesman with ID " + request.getNextSalesmanId() + " does not exist");
                }

                // Create next shift
                NozzleShift nextShift = new NozzleShift();
                nextShift.setShiftDate(existingShift.getShiftDate()); // Same day
                nextShift.setOpeningTime(existingShift.getClosingTime()); // Start from closing time
                nextShift.setNozzle(existingShift.getNozzle());
                nextShift.setSalesman(nextSalesman);
                nextShift.setOpeningReading(request.getClosingReading()); // Carry over reading
                nextShift.setFuelPrice(request.getFuelPrice() != null ? request.getFuelPrice() : existingShift.getFuelPrice()); // Use updated price if provided

                repository.save(nextShift);
            }
        }

        // Update other fields
        mapper.updateEntity(existingShift, request);

        NozzleShift updatedShift = repository.save(existingShift);
        return mapper.toResponse(updatedShift);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("NOZZLE_SHIFT_NOT_FOUND", "Nozzle shift with ID " + id + " not found");
        }
        repository.deleteById(id);
    }
}
