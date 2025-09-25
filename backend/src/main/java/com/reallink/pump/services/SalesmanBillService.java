package com.reallink.pump.services;

import java.math.BigDecimal;
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
import com.reallink.pump.entities.Product;
import com.reallink.pump.entities.ProductType;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.SalesmanBill;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.SalesmanBillMapper;
import com.reallink.pump.repositories.CustomerRepository;
import com.reallink.pump.repositories.ProductRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SalesmanBillRepository;

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
    private final ProductRepository productRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final SalesmanBillMapper mapper;

    public List<SalesmanBillResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public SalesmanBillResponse getById(@NotNull UUID id) {
        SalesmanBill bill = repository.findById(id).orElse(null);
        if (bill == null) {
            throw new PumpBusinessException("SALESMAN_BILL_NOT_FOUND", "Salesman bill with ID " + id + " not found");
        }
        return mapper.toResponse(bill);
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

        // Validate product exists and is FUEL type
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            throw new PumpBusinessException("INVALID_PRODUCT",
                    "Product with ID " + request.getProductId() + " does not exist");
        }
        if (product.getProductType() != ProductType.FUEL) {
            throw new PumpBusinessException("INVALID_PRODUCT_TYPE",
                    "Salesman bills can only contain FUEL products. Product " + product.getProductName() + " is of type " + product.getProductType());
        }

        // Check for duplicate bill number
        if (repository.existsByBillNoAndPumpMaster_Id(request.getBillNo(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_SALESMAN_BILL_NO",
                    "Salesman bill with number " + request.getBillNo() + " already exists for this pump master");
        }

        // Create salesman bill entity
        SalesmanBill bill = mapper.toEntity(request);
        bill.setPumpMaster(pumpMaster);
        bill.setCustomer(customer);
        bill.setProduct(product);
        bill.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        // Calculate amounts
        BigDecimal amount = request.getQuantity().multiply(request.getRate());
        bill.setAmount(amount);
        bill.setNetAmount(amount); // No tax, no discount

        // Save bill
        SalesmanBill savedBill = repository.save(bill);

        return mapper.toResponse(savedBill);
    }

    @Transactional
    public SalesmanBillResponse update(@NotNull UUID id, @Valid UpdateSalesmanBillRequest request) {
        SalesmanBill existingBill = repository.findById(id).orElse(null);
        if (existingBill == null) {
            throw new PumpBusinessException("SALESMAN_BILL_NOT_FOUND", "Salesman bill with ID " + id + " not found");
        }

        // Check for duplicate bill number if number is being updated
        if (request.getBillNo() != null
                && !request.getBillNo().equals(existingBill.getBillNo())
                && repository.existsByBillNoAndPumpMaster_Id(request.getBillNo(), existingBill.getPumpMaster().getId())) {
            throw new PumpBusinessException("DUPLICATE_SALESMAN_BILL_NO",
                    "Salesman bill with number " + request.getBillNo() + " already exists for this pump master");
        }

        // Validate customer exists if being updated
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            if (customer == null) {
                throw new PumpBusinessException("INVALID_CUSTOMER",
                        "Customer with ID " + request.getCustomerId() + " does not exist");
            }
            existingBill.setCustomer(customer);
        }

        // Validate product exists and is FUEL type if being updated
        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId()).orElse(null);
            if (product == null) {
                throw new PumpBusinessException("INVALID_PRODUCT",
                        "Product with ID " + request.getProductId() + " does not exist");
            }
            if (product.getProductType() != ProductType.FUEL) {
                throw new PumpBusinessException("INVALID_PRODUCT_TYPE",
                        "Salesman bills can only contain FUEL products. Product " + product.getProductName() + " is of type " + product.getProductType());
            }
            existingBill.setProduct(product);
        }

        // Update bill fields using mapper
        mapper.updateEntityFromRequest(request, existingBill);

        // Recalculate amounts if quantity or rate changed
        if (request.getQuantity() != null || request.getRate() != null) {
            BigDecimal quantity = request.getQuantity() != null ? request.getQuantity() : existingBill.getQuantity();
            BigDecimal rate = request.getRate() != null ? request.getRate() : existingBill.getRate();
            BigDecimal amount = quantity.multiply(rate);
            existingBill.setAmount(amount);
            existingBill.setNetAmount(amount);
        }

        SalesmanBill updatedBill = repository.save(existingBill);
        return mapper.toResponse(updatedBill);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("SALESMAN_BILL_NOT_FOUND", "Salesman bill with ID " + id + " not found");
        }
        repository.deleteById(id);
    }

    public Long getNextBillNo(@NotNull UUID pumpMasterId) {
        Long maxBillNo = repository.findMaxBillNoByPumpMasterId(pumpMasterId);
        return maxBillNo != null ? maxBillNo + 1 : 1;
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
}
