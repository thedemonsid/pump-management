package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateExpenseHeadRequest;
import com.reallink.pump.dto.request.UpdateExpenseHeadRequest;
import com.reallink.pump.dto.response.ExpenseHeadResponse;
import com.reallink.pump.entities.ExpenseHead;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.ExpenseHeadMapper;
import com.reallink.pump.repositories.ExpenseHeadRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseHeadService {

    private final ExpenseHeadRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final ExpenseHeadMapper mapper;

    public List<ExpenseHeadResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public Page<ExpenseHeadResponse> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::toResponse);
    }

    public ExpenseHeadResponse getById(@NotNull UUID id) {
        ExpenseHead expenseHead = repository.findById(id).orElse(null);
        if (expenseHead == null) {
            throw new PumpBusinessException("EXPENSE_HEAD_NOT_FOUND", "Expense head with ID " + id + " not found");
        }
        return mapper.toResponse(expenseHead);
    }

    public List<ExpenseHeadResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ExpenseHeadResponse> getActiveByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_IdAndIsActive(pumpMasterId, true).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public ExpenseHeadResponse getByHeadNameAndPumpMasterId(@NotNull String headName, @NotNull UUID pumpMasterId) {
        ExpenseHead expenseHead = repository.findByHeadNameAndPumpMaster_Id(headName, pumpMasterId).orElse(null);
        if (expenseHead == null) {
            throw new PumpBusinessException("EXPENSE_HEAD_NOT_FOUND",
                    "Expense head with name '" + headName + "' and pump master ID " + pumpMasterId + " not found");
        }
        return mapper.toResponse(expenseHead);
    }

    public List<ExpenseHeadResponse> searchExpenseHeads(String headName, Boolean isActive, UUID pumpMasterId) {
        return repository.findBySearchCriteria(headName, isActive, pumpMasterId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public long countByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.countByPumpMasterId(pumpMasterId);
    }

    public long countActiveByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.countActiveByPumpMasterId(pumpMasterId);
    }

    @Transactional
    public ExpenseHeadResponse create(@Valid CreateExpenseHeadRequest request) {
        // Fetch the PumpInfoMaster entity using pumpMasterId from the request
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Check for duplicate head name within the same pump master
        if (repository.existsByHeadNameAndPumpMaster_Id(request.getHeadName(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_EXPENSE_HEAD",
                    "Expense head with name '" + request.getHeadName() + "' already exists for this pump master");
        }

        ExpenseHead expenseHead = mapper.toEntity(request);
        expenseHead.setPumpMaster(pumpMaster);
        ExpenseHead savedExpenseHead = repository.save(expenseHead);
        return mapper.toResponse(savedExpenseHead);
    }

    @Transactional
    public ExpenseHeadResponse update(@NotNull UUID id, @Valid UpdateExpenseHeadRequest request) {
        ExpenseHead existingExpenseHead = repository.findById(id).orElse(null);
        if (existingExpenseHead == null) {
            throw new PumpBusinessException("EXPENSE_HEAD_NOT_FOUND", "Expense head with ID " + id + " not found");
        }

        // Check for duplicate head name within the same pump master (excluding current record)
        if (request.getHeadName() != null
                && !request.getHeadName().equals(existingExpenseHead.getHeadName())
                && repository.existsByHeadNameAndPumpMaster_IdAndIdNot(
                        request.getHeadName(),
                        existingExpenseHead.getPumpMaster().getId(),
                        id)) {
            throw new PumpBusinessException("DUPLICATE_EXPENSE_HEAD",
                    "Expense head with name '" + request.getHeadName() + "' already exists for this pump master");
        }

        mapper.updateEntityFromRequest(request, existingExpenseHead);
        ExpenseHead updatedExpenseHead = repository.save(existingExpenseHead);
        return mapper.toResponse(updatedExpenseHead);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        ExpenseHead expenseHead = repository.findById(id).orElse(null);
        if (expenseHead == null) {
            throw new PumpBusinessException("EXPENSE_HEAD_NOT_FOUND", "Expense head with ID " + id + " not found");
        }

        // Note: If there are expenses associated with this head, you may want to prevent deletion
        // or handle it appropriately based on your business logic
        repository.delete(expenseHead);
    }

    @Transactional
    public ExpenseHeadResponse toggleActive(@NotNull UUID id) {
        ExpenseHead expenseHead = repository.findById(id).orElse(null);
        if (expenseHead == null) {
            throw new PumpBusinessException("EXPENSE_HEAD_NOT_FOUND", "Expense head with ID " + id + " not found");
        }

        expenseHead.setIsActive(!expenseHead.getIsActive());
        ExpenseHead updatedExpenseHead = repository.save(expenseHead);
        return mapper.toResponse(updatedExpenseHead);
    }
}
