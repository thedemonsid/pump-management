package com.reallink.pump.services;

import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateSalesmanShiftRequest;
import com.reallink.pump.dto.request.UpdateSalesmanShiftRequest;
import com.reallink.pump.dto.response.SalesmanShiftResponse;
import com.reallink.pump.entities.SalesmanShift;
import com.reallink.pump.mapper.SalesmanShiftMapper;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SalesmanRepository;
import com.reallink.pump.repositories.SalesmanShiftRepository;
import com.reallink.pump.repositories.ShiftRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesmanShiftService {

    private final SalesmanShiftRepository repository;
    private final SalesmanShiftMapper mapper;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final SalesmanRepository salesmanRepository;
    private final ShiftRepository shiftRepository;

    public java.util.List<SalesmanShiftResponse> getAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    public java.util.List<SalesmanShiftResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream().map(mapper::toResponse).toList();
    }

    public SalesmanShiftResponse getById(@NotNull UUID id) {
        return repository.findById(id).map(mapper::toResponse).orElse(null);
    }

    @Transactional
    public SalesmanShiftResponse create(@Valid CreateSalesmanShiftRequest request) {
        SalesmanShift salesmanShift = mapper.toEntity(request);
        salesmanShift.setPumpMaster(pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElseThrow(() -> new RuntimeException("Pump Master not found")));
        salesmanShift.setSalesman(salesmanRepository.findById(request.getSalesmanId()).orElseThrow(() -> new RuntimeException("Salesman not found")));
        salesmanShift.setShift(shiftRepository.findById(request.getShiftId()).orElseThrow(() -> new RuntimeException("Shift not found")));
        salesmanShift.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());
        SalesmanShift savedSalesmanShift = repository.save(salesmanShift);
        return mapper.toResponse(savedSalesmanShift);
    }

    @Transactional
    public SalesmanShiftResponse update(@NotNull UUID id, @Valid UpdateSalesmanShiftRequest request) {
        SalesmanShift existingSalesmanShift = repository.findById(id).orElse(null);
        if (existingSalesmanShift == null) {
            return null;
        }
        mapper.updateEntity(request, existingSalesmanShift);
        SalesmanShift updatedSalesmanShift = repository.save(existingSalesmanShift);
        return mapper.toResponse(updatedSalesmanShift);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        repository.deleteById(id);
    }
}
