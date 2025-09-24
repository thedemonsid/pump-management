package com.reallink.pump.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateSalesmanBillRequest;
import com.reallink.pump.dto.request.UpdateSalesmanBillRequest;
import com.reallink.pump.dto.response.SalesmanBillResponse;
import com.reallink.pump.entities.Customer;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Salesman;
import com.reallink.pump.entities.SalesmanBill;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.SalesmanBillMapper;
import com.reallink.pump.repositories.CustomerRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SalesmanBillRepository;
import com.reallink.pump.repositories.SalesmanRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesmanBillService {

    private final SalesmanBillRepository repository;
    private final CustomerRepository customerRepository;
    private final SalesmanRepository salesmanRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final SalesmanBillMapper mapper;

    public SalesmanBillResponse getById(@NotNull UUID id) {
        SalesmanBill salesmanBill = repository.findById(id).orElse(null);
        if (salesmanBill == null) {
            throw new PumpBusinessException("SALESMAN_BILL_NOT_FOUND", "Salesman bill with ID " + id + " not found");
        }
        return mapper.toResponse(salesmanBill);
    }

    public List<SalesmanBillResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterIdOrderByBillDateDesc(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SalesmanBillResponse> getByPumpMasterIdAndDateRange(@NotNull UUID pumpMasterId, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {
        return repository.findByPumpMasterIdAndBillDateBetweenOrderByBillDateDesc(pumpMasterId, startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SalesmanBillResponse> getByCustomerId(@NotNull UUID customerId) {
        return repository.findByCustomer_Id(customerId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SalesmanBillResponse> getBySalesmanId(@NotNull UUID salesmanId) {
        return repository.findBySalesman_Id(salesmanId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SalesmanBillResponse> getBySalesmanIdAndDateRange(@NotNull UUID salesmanId, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {
        return repository.findBySalesmanIdAndBillDateBetweenOrderByBillDateDesc(salesmanId, startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public Long getNextBillNo(@NotNull UUID pumpMasterId) {
        return repository.findMaxBillNoByPumpMasterId(pumpMasterId) + 1;
    }

    @Transactional
    public SalesmanBillResponse create(@Valid CreateSalesmanBillRequest request) {
        // Validate pump master exists
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Validate customer exists
        Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        if (customer == null) {
            throw new PumpBusinessException("INVALID_CUSTOMER",
                    "Customer with ID " + request.getCustomerId() + " does not exist");
        }

        // Validate salesman exists if provided
        Salesman salesman = null;
        if (request.getSalesmanId() != null) {
            salesman = salesmanRepository.findById(request.getSalesmanId()).orElse(null);
            if (salesman == null) {
                throw new PumpBusinessException("INVALID_SALESMAN",
                        "Salesman with ID " + request.getSalesmanId() + " does not exist");
            }
        }

        // Check for duplicate bill number
        if (repository.existsByBillNoAndPumpMaster_Id(request.getBillNo(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_BILL_NO",
                    "Salesman bill with number " + request.getBillNo() + " already exists for this pump master");
        }

        // Create salesman bill entity
        SalesmanBill salesmanBill = mapper.toEntity(request);
        salesmanBill.setPumpMaster(pumpMaster);
        salesmanBill.setCustomer(customer);
        salesmanBill.setSalesman(salesman);
        salesmanBill.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        SalesmanBill saved = repository.save(salesmanBill);
        return mapper.toResponse(saved);
    }

    @Transactional
    public SalesmanBillResponse update(@NotNull UUID id, @Valid UpdateSalesmanBillRequest request) {
        SalesmanBill salesmanBill = repository.findById(id).orElse(null);
        if (salesmanBill == null) {
            throw new PumpBusinessException("SALESMAN_BILL_NOT_FOUND", "Salesman bill with ID " + id + " not found");
        }

        // Validate customer exists if provided
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            if (customer == null) {
                throw new PumpBusinessException("INVALID_CUSTOMER",
                        "Customer with ID " + request.getCustomerId() + " does not exist");
            }
            salesmanBill.setCustomer(customer);
        }

        // Validate salesman exists if provided
        if (request.getSalesmanId() != null) {
            Salesman salesman = salesmanRepository.findById(request.getSalesmanId()).orElse(null);
            if (salesman == null) {
                throw new PumpBusinessException("INVALID_SALESMAN",
                        "Salesman with ID " + request.getSalesmanId() + " does not exist");
            }
            salesmanBill.setSalesman(salesman);
        } else {
            // Allow setting salesman to null
            salesmanBill.setSalesman(null);
        }

        // Check for duplicate bill number if bill number is being updated
        if (request.getBillNo() != null && !request.getBillNo().equals(salesmanBill.getBillNo())) {
            if (repository.existsByBillNoAndPumpMaster_IdAndIdNot(request.getBillNo(), salesmanBill.getPumpMaster().getId(), id)) {
                throw new PumpBusinessException("DUPLICATE_BILL_NO",
                        "Salesman bill with number " + request.getBillNo() + " already exists for this pump master");
            }
        }

        // Update entity
        mapper.updateEntityFromRequest(request, salesmanBill);
        salesmanBill.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        SalesmanBill saved = repository.save(salesmanBill);
        return mapper.toResponse(saved);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        SalesmanBill salesmanBill = repository.findById(id).orElse(null);
        if (salesmanBill == null) {
            throw new PumpBusinessException("SALESMAN_BILL_NOT_FOUND", "Salesman bill with ID " + id + " not found");
        }
        repository.delete(salesmanBill);
    }
}
