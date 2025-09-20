package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateSupplierPaymentRequest;
import com.reallink.pump.dto.request.UpdateSupplierPaymentRequest;
import com.reallink.pump.dto.response.SupplierPaymentResponse;
import com.reallink.pump.entities.BankAccount;
import com.reallink.pump.entities.BankTransaction;
import com.reallink.pump.entities.FuelPurchase;
import com.reallink.pump.entities.PaymentMethod;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Purchase;
import com.reallink.pump.entities.Supplier;
import com.reallink.pump.entities.SupplierPayment;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.SupplierPaymentMapper;
import com.reallink.pump.repositories.BankAccountRepository;
import com.reallink.pump.repositories.FuelPurchaseRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.PurchaseRepository;
import com.reallink.pump.repositories.SupplierPaymentRepository;
import com.reallink.pump.repositories.SupplierRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierPaymentService {

    private final SupplierPaymentRepository repository;
    private final PurchaseRepository purchaseRepository;
    private final FuelPurchaseRepository fuelPurchaseRepository;
    private final SupplierRepository supplierRepository;
    private final BankAccountRepository bankAccountRepository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final SupplierPaymentMapper mapper;

    public List<SupplierPaymentResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SupplierPaymentResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterIdOrderByPaymentDateDesc(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public SupplierPaymentResponse getById(@NotNull UUID id) {
        SupplierPayment payment = repository.findById(id).orElse(null);
        if (payment == null) {
            throw new PumpBusinessException("PAYMENT_NOT_FOUND", "Supplier payment with ID " + id + " not found");
        }
        return mapper.toResponse(payment);
    }

    public List<SupplierPaymentResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMasterIdOrderByPaymentDateDesc(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SupplierPaymentResponse> getByPurchaseId(@NotNull UUID purchaseId) {
        return repository.findByPurchase_Id(purchaseId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SupplierPaymentResponse> getByFuelPurchaseId(@NotNull UUID fuelPurchaseId) {
        return repository.findByFuelPurchase_Id(fuelPurchaseId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<SupplierPaymentResponse> getGeneralPaymentsByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findGeneralPaymentsByPumpMasterId(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public SupplierPaymentResponse create(@Valid CreateSupplierPaymentRequest request) {
        // Validate pump master exists
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Validate that either purchase or fuelPurchase is provided (optional for general payments)
        // No validation needed - allow general payments without specific purchase
        // Validate purchase exists (if provided)
        Purchase purchase = null;
        if (request.getPurchaseId() != null) {
            purchase = purchaseRepository.findById(request.getPurchaseId()).orElse(null);
            if (purchase == null) {
                throw new PumpBusinessException("INVALID_PURCHASE",
                        "Purchase with ID " + request.getPurchaseId() + " does not exist");
            }
        }

        // Validate fuelPurchase exists (if provided)
        FuelPurchase fuelPurchase = null;
        if (request.getFuelPurchaseId() != null) {
            fuelPurchase = fuelPurchaseRepository.findById(request.getFuelPurchaseId()).orElse(null);
            if (fuelPurchase == null) {
                throw new PumpBusinessException("INVALID_FUEL_PURCHASE",
                        "Fuel purchase with ID " + request.getFuelPurchaseId() + " does not exist");
            }
        }

        // Validate supplier exists
        Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
        if (supplier == null) {
            throw new PumpBusinessException("INVALID_SUPPLIER",
                    "Supplier with ID " + request.getSupplierId() + " does not exist");
        }

        // Validate bank account exists
        BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId()).orElse(null);
        if (bankAccount == null) {
            throw new PumpBusinessException("INVALID_BANK_ACCOUNT",
                    "Bank account with ID " + request.getBankAccountId() + " does not exist");
        }

        // Create bank transaction
        BankTransaction bankTransaction = createBankTransaction(request, bankAccount, purchase, fuelPurchase);

        // Create payment entity
        SupplierPayment payment = mapper.toEntity(request);
        payment.setPumpMaster(pumpMaster);
        payment.setPurchase(purchase);
        payment.setFuelPurchase(fuelPurchase);
        payment.setSupplier(supplier);
        payment.setBankAccount(bankAccount);
        payment.setBankTransaction(bankTransaction);
        payment.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        // Save payment (bank transaction will be saved via cascade)
        SupplierPayment savedPayment = repository.save(payment);

        return mapper.toResponse(savedPayment);
    }

    @Transactional
    public SupplierPaymentResponse update(@NotNull UUID id, @Valid UpdateSupplierPaymentRequest request) {
        SupplierPayment existingPayment = repository.findById(id).orElse(null);
        if (existingPayment == null) {
            throw new PumpBusinessException("PAYMENT_NOT_FOUND", "Supplier payment with ID " + id + " not found");
        }

        // Validate updated entities if provided
        if (request.getPumpMasterId() != null) {
            PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
            if (pumpMaster == null) {
                throw new PumpBusinessException("INVALID_PUMP_MASTER",
                        "Pump master with ID " + request.getPumpMasterId() + " does not exist");
            }
            existingPayment.setPumpMaster(pumpMaster);
        }

        if (request.getPurchaseId() != null) {
            Purchase purchase = purchaseRepository.findById(request.getPurchaseId()).orElse(null);
            if (purchase == null) {
                throw new PumpBusinessException("INVALID_PURCHASE",
                        "Purchase with ID " + request.getPurchaseId() + " does not exist");
            }
            existingPayment.setPurchase(purchase);
        } else if (request.getPurchaseId() == null && existingPayment.getPurchase() != null) {
            // Allow clearing the purchase reference
            existingPayment.setPurchase(null);
        }

        if (request.getFuelPurchaseId() != null) {
            FuelPurchase fuelPurchase = fuelPurchaseRepository.findById(request.getFuelPurchaseId()).orElse(null);
            if (fuelPurchase == null) {
                throw new PumpBusinessException("INVALID_FUEL_PURCHASE",
                        "Fuel purchase with ID " + request.getFuelPurchaseId() + " does not exist");
            }
            existingPayment.setFuelPurchase(fuelPurchase);
        } else if (request.getFuelPurchaseId() == null && existingPayment.getFuelPurchase() != null) {
            // Allow clearing the fuel purchase reference
            existingPayment.setFuelPurchase(null);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
            if (supplier == null) {
                throw new PumpBusinessException("INVALID_SUPPLIER",
                        "Supplier with ID " + request.getSupplierId() + " does not exist");
            }
            existingPayment.setSupplier(supplier);
        }

        if (request.getBankAccountId() != null) {
            BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId()).orElse(null);
            if (bankAccount == null) {
                throw new PumpBusinessException("INVALID_BANK_ACCOUNT",
                        "Bank account with ID " + request.getBankAccountId() + " does not exist");
            }
            existingPayment.setBankAccount(bankAccount);
        }

        // Update payment fields using mapper
        mapper.updateEntityFromRequest(request, existingPayment);

        // Update bank transaction if amount or payment method changed
        if (request.getAmount() != null || request.getPaymentMethod() != null) {
            updateBankTransaction(existingPayment.getBankTransaction(), request, existingPayment.getPurchase(), existingPayment.getFuelPurchase());
        }

        SupplierPayment savedPayment = repository.save(existingPayment);
        return mapper.toResponse(savedPayment);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        SupplierPayment payment = repository.findById(id).orElse(null);
        if (payment == null) {
            throw new PumpBusinessException("PAYMENT_NOT_FOUND", "Supplier payment with ID " + id + " not found");
        }
        repository.delete(payment); // Bank transaction will be deleted via cascade
    }

    private BankTransaction createBankTransaction(CreateSupplierPaymentRequest request, BankAccount bankAccount, Purchase purchase, FuelPurchase fuelPurchase) {
        BankTransaction transaction = new BankTransaction();
        transaction.setBankAccount(bankAccount);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(BankTransaction.TransactionType.DEBIT);
        String purchaseIdStr = purchase != null ? purchase.getId().toString() : (fuelPurchase != null ? fuelPurchase.getId().toString() : "General Payment");
        String purchaseType = purchase != null ? "Purchase" : (fuelPurchase != null ? "Fuel Purchase" : "General");
        transaction.setDescription("Payment to Supplier for " + purchaseType + " #" + purchaseIdStr + " - " + request.getReferenceNumber());
        transaction.setTransactionDate(request.getPaymentDate());
        transaction.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().name()));
        return transaction;
    }

    private void updateBankTransaction(BankTransaction transaction, UpdateSupplierPaymentRequest request, Purchase purchase, FuelPurchase fuelPurchase) {
        if (request.getAmount() != null) {
            transaction.setAmount(request.getAmount());
        }
        if (request.getPaymentMethod() != null) {
            transaction.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().name()));
        }
        if (request.getPaymentDate() != null) {
            transaction.setTransactionDate(request.getPaymentDate());
        }
        if (request.getReferenceNumber() != null) {
            String purchaseIdStr = purchase != null ? purchase.getId().toString() : (fuelPurchase != null ? fuelPurchase.getId().toString() : "General Payment");
            String purchaseType = purchase != null ? "Purchase" : (fuelPurchase != null ? "Fuel Purchase" : "General");
            transaction.setDescription("Payment to Supplier for " + purchaseType + " #" + purchaseIdStr + " - " + request.getReferenceNumber());
        }
    }
}
