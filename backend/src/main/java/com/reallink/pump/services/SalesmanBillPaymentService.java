package com.reallink.pump.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateSalesmanBillPaymentRequest;
import com.reallink.pump.dto.request.UpdateSalesmanBillPaymentRequest;
import com.reallink.pump.dto.response.SalesmanBillPaymentResponse;
import com.reallink.pump.entities.Customer;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.SalesmanBillPayment;
import com.reallink.pump.entities.SalesmanShift;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.SalesmanBillPaymentMapper;
import com.reallink.pump.repositories.CustomerRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.SalesmanBillPaymentRepository;
import com.reallink.pump.repositories.SalesmanShiftRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesmanBillPaymentService {

    private final SalesmanBillPaymentRepository repository;
    private final SalesmanShiftRepository salesmanShiftRepository;
    private final CustomerRepository customerRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final SalesmanBillPaymentMapper mapper;

    public List<SalesmanBillPaymentResponse> getAll() {
        return repository.findAllWithRelations().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public SalesmanBillPaymentResponse getById(@NotNull UUID id) {
        SalesmanBillPayment payment = repository.findByIdWithRelations(id);
        if (payment == null) {
            throw new PumpBusinessException("SALESMAN_BILL_PAYMENT_NOT_FOUND", "Salesman bill payment with ID " + id + " not found");
        }
        return mapper.toResponse(payment);
    }

    @Transactional
    public SalesmanBillPaymentResponse create(@Valid CreateSalesmanBillPaymentRequest request) {
        // Validate pump master exists
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Validate salesman shift exists and is open
        SalesmanShift salesmanShift = salesmanShiftRepository.findById(request.getSalesmanShiftId()).orElse(null);
        if (salesmanShift == null) {
            throw new PumpBusinessException("INVALID_SALESMAN_SHIFT",
                    "Salesman shift with ID " + request.getSalesmanShiftId() + " does not exist");
        }

        // Validate that the shift is still open (or recently closed for payment recording)
        if (salesmanShift.getStatus() != SalesmanShift.ShiftStatus.OPEN
                && salesmanShift.getStatus() != SalesmanShift.ShiftStatus.CLOSED) {
            throw new PumpBusinessException("INVALID_SHIFT_STATUS",
                    "Cannot record payment for shift with status: " + salesmanShift.getStatus());
        }

        // Validate customer exists
        Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        if (customer == null) {
            throw new PumpBusinessException("INVALID_CUSTOMER",
                    "Customer with ID " + request.getCustomerId() + " does not exist");
        }

        // Create payment entity
        SalesmanBillPayment payment = mapper.toEntity(request);
        payment.setPumpMaster(pumpMaster);
        payment.setSalesmanShift(salesmanShift);
        payment.setCustomer(customer);

        // Save payment
        SalesmanBillPayment savedPayment = repository.save(payment);

        return mapper.toResponse(savedPayment);
    }

    @Transactional
    public SalesmanBillPaymentResponse update(@NotNull UUID id, @Valid UpdateSalesmanBillPaymentRequest request) {
        SalesmanBillPayment existingPayment = repository.findById(id).orElse(null);
        if (existingPayment == null) {
            throw new PumpBusinessException("SALESMAN_BILL_PAYMENT_NOT_FOUND", "Salesman bill payment with ID " + id + " not found");
        }

        // Validate salesman shift if being updated
        if (request.getSalesmanShiftId() != null) {
            SalesmanShift salesmanShift = salesmanShiftRepository.findById(request.getSalesmanShiftId()).orElse(null);
            if (salesmanShift == null) {
                throw new PumpBusinessException("INVALID_SALESMAN_SHIFT",
                        "Salesman shift with ID " + request.getSalesmanShiftId() + " does not exist");
            }

            existingPayment.setSalesmanShift(salesmanShift);
        }

        // Validate customer if being updated
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            if (customer == null) {
                throw new PumpBusinessException("INVALID_CUSTOMER",
                        "Customer with ID " + request.getCustomerId() + " does not exist");
            }
            existingPayment.setCustomer(customer);
        }

        // Update payment fields using mapper
        mapper.updateEntityFromRequest(request, existingPayment);

        SalesmanBillPayment updatedPayment = repository.save(existingPayment);
        return mapper.toResponse(updatedPayment);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("SALESMAN_BILL_PAYMENT_NOT_FOUND", "Salesman bill payment with ID " + id + " not found");
        }
        repository.deleteById(id);
    }

    public List<SalesmanBillPaymentResponse> getBySalesmanShiftId(@NotNull UUID salesmanShiftId) {
        return repository.findBySalesmanShiftId(salesmanShiftId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SalesmanBillPaymentResponse> getByCustomerId(@NotNull UUID customerId) {
        return repository.findByCustomer_Id(customerId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public BigDecimal getTotalPaymentsForShift(@NotNull UUID shiftId) {
        return repository.getTotalPaymentsForShift(shiftId);
    }
}
