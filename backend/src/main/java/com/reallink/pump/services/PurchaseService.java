package com.reallink.pump.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreatePurchaseRequest;
import com.reallink.pump.dto.request.UpdatePurchaseRequest;
import com.reallink.pump.dto.response.PurchaseResponse;
import com.reallink.pump.entities.Product;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Purchase;
import com.reallink.pump.entities.Supplier;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.PurchaseMapper;
import com.reallink.pump.repositories.ProductRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.PurchaseRepository;
import com.reallink.pump.repositories.SupplierRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseService {

    private final PurchaseRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final PurchaseMapper mapper;

    public List<PurchaseResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<PurchaseResponse> getAllByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public PurchaseResponse getById(@NotNull UUID id) {
        Purchase purchase = repository.findById(id).orElse(null);
        if (purchase == null) {
            throw new PumpBusinessException("PURCHASE_NOT_FOUND", "Purchase with ID " + id + " not found");
        }
        return mapper.toResponse(purchase);
    }

    public List<PurchaseResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public PurchaseResponse getByPurchaseIdAndPumpMasterId(@NotNull Long purchaseId, @NotNull UUID pumpMasterId) {
        Purchase purchase = repository.findByPurchaseIdAndPumpMaster_Id(purchaseId, pumpMasterId).orElse(null);
        if (purchase == null) {
            throw new PumpBusinessException("PURCHASE_NOT_FOUND",
                    "Purchase with purchase ID " + purchaseId + " and pump master ID " + pumpMasterId + " not found");
        }
        return mapper.toResponse(purchase);
    }

    @Transactional
    public PurchaseResponse create(@Valid CreatePurchaseRequest request) {
        // Validate pump master
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }

        // Validate supplier
        Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
        if (supplier == null) {
            throw new PumpBusinessException("INVALID_SUPPLIER",
                    "Supplier with ID " + request.getSupplierId() + " does not exist");
        }

        // Validate product
        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            throw new PumpBusinessException("INVALID_PRODUCT",
                    "Product with ID " + request.getProductId() + " does not exist");
        }

        // Check for duplicate invoice number
        if (repository.existsByInvoiceNumberAndPumpMaster_Id(request.getInvoiceNumber(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_INVOICE",
                    "Purchase with invoice number '" + request.getInvoiceNumber() + "' already exists for this pump master");
        }

        // Generate purchaseId
        Long maxPurchaseId = repository.findMaxPurchaseIdByPumpMasterId(request.getPumpMasterId());
        Long newPurchaseId = maxPurchaseId + 1;

        Purchase purchase = mapper.toEntity(request);
        purchase.setPumpMaster(pumpMaster);
        purchase.setSupplier(supplier);
        purchase.setProduct(product);
        purchase.setPurchaseId(newPurchaseId);
        purchase.setEntryBy(SecurityContextHolder.getContext().getAuthentication().getName());

        Purchase savedPurchase = repository.save(purchase);

        // Update stock if addToStock is true
        if (savedPurchase.getAddToStock()) {
            BigDecimal currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : BigDecimal.ZERO;
            product.setStockQuantity(currentStock.add(savedPurchase.getQuantity()));
            productRepository.save(product);
        }

        return mapper.toResponse(savedPurchase);
    }

    @Transactional
    public PurchaseResponse update(@NotNull UUID id, @Valid UpdatePurchaseRequest request) {
        Purchase existingPurchase = repository.findById(id).orElse(null);
        if (existingPurchase == null) {
            throw new PumpBusinessException("PURCHASE_NOT_FOUND", "Purchase with ID " + id + " not found");
        }

        // Validate supplier if provided
        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId()).orElse(null);
            if (supplier == null) {
                throw new PumpBusinessException("INVALID_SUPPLIER",
                        "Supplier with ID " + request.getSupplierId() + " does not exist");
            }
        }

        // Validate product if provided
        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId()).orElse(null);
            if (product == null) {
                throw new PumpBusinessException("INVALID_PRODUCT",
                        "Product with ID " + request.getProductId() + " does not exist");
            }
        }

        // Check for duplicate invoice number if being updated
        if (request.getInvoiceNumber() != null
                && !request.getInvoiceNumber().equals(existingPurchase.getInvoiceNumber())
                && repository.existsByInvoiceNumberAndPumpMaster_IdAndIdNot(request.getInvoiceNumber(),
                        existingPurchase.getPumpMaster().getId(), id)) {
            throw new PumpBusinessException("DUPLICATE_INVOICE",
                    "Purchase with invoice number '" + request.getInvoiceNumber() + "' already exists for this pump master");
        }

        // Calculate stock adjustment
        Boolean oldAddToStock = existingPurchase.getAddToStock();
        BigDecimal oldQuantity = existingPurchase.getQuantity();
        Product product = existingPurchase.getProduct();

        mapper.updateEntityFromRequest(request, existingPurchase);

        Boolean newAddToStock = existingPurchase.getAddToStock();
        BigDecimal newQuantity = existingPurchase.getQuantity();

        BigDecimal diff = BigDecimal.ZERO;
        if (newAddToStock && !oldAddToStock) {
            diff = newQuantity;
        } else if (oldAddToStock && !newAddToStock) {
            diff = newQuantity.negate();
        } else if (oldAddToStock && newAddToStock) {
            diff = newQuantity.subtract(oldQuantity);
        }

        if (!diff.equals(BigDecimal.ZERO)) {
            BigDecimal currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : BigDecimal.ZERO;
            product.setStockQuantity(currentStock.add(diff));
            productRepository.save(product);
        }

        Purchase updatedPurchase = repository.save(existingPurchase);
        return mapper.toResponse(updatedPurchase);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        Purchase purchase = repository.findById(id).orElse(null);
        if (purchase == null) {
            throw new PumpBusinessException("PURCHASE_NOT_FOUND", "Purchase with ID " + id + " not found");
        }

        // Adjust stock if addToStock was true
        if (purchase.getAddToStock()) {
            Product product = purchase.getProduct();
            BigDecimal currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : BigDecimal.ZERO;
            product.setStockQuantity(currentStock.subtract(purchase.getQuantity()));
            productRepository.save(product);
        }

        repository.deleteById(id);
    }

    public boolean existsByPurchaseIdAndPumpMasterId(@NotNull Long purchaseId, @NotNull UUID pumpMasterId) {
        return repository.existsByPurchaseIdAndPumpMaster_Id(purchaseId, pumpMasterId);
    }

    public boolean existsByInvoiceNumberAndPumpMasterId(@NotNull String invoiceNumber, @NotNull UUID pumpMasterId) {
        return repository.existsByInvoiceNumberAndPumpMaster_Id(invoiceNumber, pumpMasterId);
    }
}
