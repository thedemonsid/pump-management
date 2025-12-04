package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateCustomerRequest;
import com.reallink.pump.dto.request.UpdateCustomerRequest;
import com.reallink.pump.dto.response.CustomerResponse;
import com.reallink.pump.entities.Customer;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.CustomerMapper;
import com.reallink.pump.repositories.CustomerRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final CustomerMapper mapper;

    public List<CustomerResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public Page<CustomerResponse> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::toResponse);
    }

    public CustomerResponse getById(@NotNull UUID id) {
        Customer customer = repository.findById(id).orElse(null);
        if (customer == null) {
            throw new PumpBusinessException("CUSTOMER_NOT_FOUND", "Customer with ID " + id + " not found");
        }
        return mapper.toResponse(customer);
    }

    public List<CustomerResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public CustomerResponse getByCustomerNameAndPumpMasterId(@NotNull String customerName, @NotNull UUID pumpMasterId) {
        Customer customer = repository.findByCustomerNameAndPumpMaster_Id(customerName, pumpMasterId).orElse(null);
        if (customer == null) {
            throw new PumpBusinessException("CUSTOMER_NOT_FOUND",
                    "Customer with name '" + customerName + "' and pump master ID " + pumpMasterId + " not found");
        }
        return mapper.toResponse(customer);
    }

    public List<CustomerResponse> searchCustomers(String customerName, String address, String phoneNumber,
            String gstNumber, String panNumber, UUID pumpMasterId) {
        return repository
                .findBySearchCriteria(customerName, address, phoneNumber, gstNumber, panNumber, pumpMasterId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<CustomerResponse> getByCustomerNameContaining(@NotNull String customerName) {
        return repository.findByCustomerNameContainingIgnoreCase(customerName).stream()
                .map(mapper::toResponse)
                .toList();
    }

    private static final String UNKNOWN_PHONE_NUMBER = "9999999999";

    @Transactional
    public CustomerResponse create(@Valid CreateCustomerRequest request) {
        // Check for duplicate customer name
        if (repository.existsByCustomerNameAndPumpMaster_Id(request.getCustomerName(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_CUSTOMER",
                    "Customer with name '" + request.getCustomerName() + "' already exists for this pump master");
        }
        // Check for duplicate phone number (skip if it's the unknown phone number)
        if (request.getPhoneNumber() != null
                && !UNKNOWN_PHONE_NUMBER.equals(request.getPhoneNumber())
                && repository.existsByPhoneNumberAndPumpMaster_Id(request.getPhoneNumber(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_PHONE_NUMBER",
                    "Customer with phone number '" + request.getPhoneNumber() + "' already exists for this pump master");
        }
        // Fetch the PumpInfoMaster entity using pumpMasterId from the request
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }
        Customer customer = mapper.toEntity(request);
        customer.setPumpMaster(pumpMaster);
        Customer savedCustomer = repository.save(customer);
        return mapper.toResponse(savedCustomer);
    }

    @Transactional
    public CustomerResponse update(@NotNull UUID id, @Valid UpdateCustomerRequest request) {
        Customer existingCustomer = repository.findById(id).orElse(null);
        if (existingCustomer == null) {
            throw new PumpBusinessException("CUSTOMER_NOT_FOUND", "Customer with ID " + id + " not found");
        }

        // Check for duplicate customer name if name is being updated
        if (request.getCustomerName() != null
                && !request.getCustomerName().equals(existingCustomer.getCustomerName())
                && repository.existsByCustomerNameAndPumpMaster_IdAndIdNot(request.getCustomerName(),
                        existingCustomer.getPumpMaster().getId(), id)) {
            throw new PumpBusinessException("DUPLICATE_CUSTOMER",
                    "Customer with name '" + request.getCustomerName() + "' already exists for this pump master");
        }

        // Check for duplicate phone number if phone number is being updated (skip if it's the unknown phone number)
        if (request.getPhoneNumber() != null
                && !UNKNOWN_PHONE_NUMBER.equals(request.getPhoneNumber())
                && !request.getPhoneNumber().equals(existingCustomer.getPhoneNumber())
                && repository.existsByPhoneNumberAndPumpMaster_IdAndIdNot(request.getPhoneNumber(),
                        existingCustomer.getPumpMaster().getId(), id)) {
            throw new PumpBusinessException("DUPLICATE_PHONE_NUMBER",
                    "Customer with phone number '" + request.getPhoneNumber() + "' already exists for this pump master");
        }

        mapper.updateEntityFromRequest(request, existingCustomer);
        Customer updatedCustomer = repository.save(existingCustomer);
        return mapper.toResponse(updatedCustomer);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("CUSTOMER_NOT_FOUND", "Customer with ID " + id + " not found");
        }
        repository.deleteById(id);
    }

    public boolean existsByCustomerNameAndPumpMasterId(@NotNull String customerName, @NotNull UUID pumpMasterId) {
        return repository.existsByCustomerNameAndPumpMaster_Id(customerName, pumpMasterId);
    }

    public long getCountByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.countByPumpMasterId(pumpMasterId);
    }
}
