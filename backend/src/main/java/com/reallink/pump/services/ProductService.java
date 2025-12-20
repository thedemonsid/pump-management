package com.reallink.pump.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateProductRequest;
import com.reallink.pump.dto.request.UpdateProductRequest;
import com.reallink.pump.dto.response.ProductResponse;
import com.reallink.pump.entities.Product;
import com.reallink.pump.entities.ProductSalesUnitChangeLog;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.ProductMapper;
import com.reallink.pump.repositories.ProductRepository;
import com.reallink.pump.repositories.ProductSalesUnitChangeLogRepository;
import com.reallink.pump.repositories.PumpInfoMasterRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final ProductSalesUnitChangeLogRepository changeLogRepository;
    private final ProductMapper mapper;

    public List<ProductResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public Page<ProductResponse> getAllPaginated(Pageable pageable) {
        return repository.findAll(pageable)
                .map(mapper::toResponse);
    }

    public ProductResponse getById(@NotNull UUID id) {
        Product product = repository.findById(id).orElse(null);
        if (product == null) {
            throw new PumpBusinessException("PRODUCT_NOT_FOUND", "Product with ID " + id + " not found");
        }
        return mapper.toResponse(product);
    }

    public List<ProductResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public ProductResponse getByProductNameAndPumpMasterId(@NotNull String productName, @NotNull UUID pumpMasterId) {
        Product product = repository.findByProductNameAndPumpMaster_Id(productName, pumpMasterId).orElse(null);
        if (product == null) {
            throw new PumpBusinessException("PRODUCT_NOT_FOUND", "Product with name '" + productName + "' and pump master ID " + pumpMasterId + " not found");
        }
        return mapper.toResponse(product);
    }

    public List<ProductResponse> searchProducts(String productName, String hsnCode, UUID pumpMasterId) {
        return repository.findBySearchCriteria(productName, hsnCode, pumpMasterId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ProductResponse> getByPriceRange(@NotNull BigDecimal minRate, @NotNull BigDecimal maxRate) {
        return repository.findBySalesRateBetween(minRate, maxRate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public ProductResponse create(@Valid CreateProductRequest request) {
        // Fetch the PumpInfoMaster entity using pumpMasterId from the request
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER", "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }
        Product product = mapper.toEntity(request);
        product.setPumpMaster(pumpMaster);
        Product savedProduct = repository.save(product);
        return mapper.toResponse(savedProduct);
    }

    @Transactional
    public ProductResponse update(@NotNull UUID id, @Valid UpdateProductRequest request) {
        Product existingProduct = repository.findById(id).orElse(null);
        if (existingProduct == null) {
            throw new PumpBusinessException("PRODUCT_NOT_FOUND", "Product with ID " + id + " not found");
        }

        // Check if opening balance has changed
        Integer oldOpeningBalance = existingProduct.getOpeningBalance();
        Integer newOpeningBalance = request.getOpeningBalance() != null ? request.getOpeningBalance() : oldOpeningBalance;

        // Detect changes: sales unit and/or sales rate
        String oldSalesUnit = existingProduct.getSalesUnit();
        String newSalesUnit = request.getSalesUnit() != null ? request.getSalesUnit() : oldSalesUnit;

        // Sales rate change detection (BigDecimal-safe)
        boolean priceChanged = false;
        if (request.getSalesRate() != null) {
            if (existingProduct.getSalesRate() == null) {
                priceChanged = true;
            } else {
                priceChanged = existingProduct.getSalesRate().compareTo(request.getSalesRate()) != 0;
            }
        }

        boolean unitChanged = newSalesUnit != null && !newSalesUnit.equals(oldSalesUnit);

        if (unitChanged || priceChanged) {
            BigDecimal oldSalesRate = existingProduct.getSalesRate();
            BigDecimal newSalesRate = request.getSalesRate() != null ? request.getSalesRate() : oldSalesRate;

            String reason;
            if (unitChanged && priceChanged) {
                reason = "Sales unit and price changed via product update";
            } else if (unitChanged) {
                reason = "Sales unit changed via product update";
            } else {
                reason = "Sales price changed via product update";
            }

            // Get the current authenticated username
            String changedBy = SecurityContextHolder.getContext().getAuthentication().getName();

            ProductSalesUnitChangeLog changeLog = new ProductSalesUnitChangeLog(
                    existingProduct,
                    oldSalesUnit,
                    newSalesUnit,
                    BigDecimal.valueOf(existingProduct.getStockQuantity()), // old stock quantity
                    BigDecimal.valueOf(existingProduct.getStockQuantity()), // new stock quantity unchanged here
                    oldSalesRate,
                    newSalesRate,
                    reason,
                    changedBy
            );
            changeLogRepository.save(changeLog);
        }

        // Apply updates and save product
        mapper.updateEntity(request, existingProduct);

        // Update stock quantity if opening balance changed
        if (newOpeningBalance != null && !newOpeningBalance.equals(oldOpeningBalance)) {
            Integer stockDifference = newOpeningBalance - oldOpeningBalance;
            Integer currentStockQuantity = existingProduct.getStockQuantity() != null ? existingProduct.getStockQuantity() : 0;
            existingProduct.setStockQuantity(currentStockQuantity + stockDifference);
        }

        Product updatedProduct = repository.save(existingProduct);
        return mapper.toResponse(updatedProduct);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("PRODUCT_NOT_FOUND", "Product with ID " + id + " not found");
        }
        repository.deleteById(id);
    }

    public boolean existsByProductNameAndPumpMasterId(@NotNull String productName, @NotNull UUID pumpMasterId) {
        return repository.existsByProductNameAndPumpMaster_Id(productName, pumpMasterId);
    }

    public long getCountByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.countByPumpMasterId(pumpMasterId);
    }

    public List<String> getDistinctSalesUnits() {
        return repository.findDistinctSalesUnits();
    }

    public List<ProductResponse> getProductsWithoutTanks() {
        return repository.findProductsWithoutTanks().stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Update stock quantity for a product by adjusting it with the given delta.
     * Only updates if the product exists.
     *
     * @param productId the product ID
     * @param quantityDelta the quantity change (positive to increase, negative
     * to decrease)
     */
    @Transactional
    public void updateStockQuantity(@NotNull UUID productId, int quantityDelta) {
        Product product = repository.findById(productId).orElse(null);
        if (product == null) {
            throw new PumpBusinessException("PRODUCT_NOT_FOUND", "Product with ID " + productId + " not found");
        }
        Integer currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(currentStock + quantityDelta);
        repository.save(product);
    }

    // No validation methods needed
}
