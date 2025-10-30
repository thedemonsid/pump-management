package com.reallink.pump.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.dto.request.CreateProductSalesUnitChangeLogRequest;
import com.reallink.pump.dto.response.ProductSalesUnitChangeLogResponse;
import com.reallink.pump.entities.Product;
import com.reallink.pump.entities.ProductSalesUnitChangeLog;
import com.reallink.pump.entities.ProductType;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.ProductSalesUnitChangeLogMapper;
import com.reallink.pump.repositories.ProductRepository;
import com.reallink.pump.repositories.ProductSalesUnitChangeLogRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductSalesUnitChangeLogService {

    private final ProductSalesUnitChangeLogRepository changeLogRepository;
    private final ProductRepository productRepository;
    private final ProductSalesUnitChangeLogMapper mapper;

    /**
     * Get all change logs for a pump master
     */
    public List<ProductSalesUnitChangeLogResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return changeLogRepository.findByPumpMaster_IdOrderByCreatedAtDesc(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Get change log by ID
     */
    public ProductSalesUnitChangeLogResponse getById(@NotNull UUID id) {
        ProductSalesUnitChangeLog changeLog = changeLogRepository.findById(id)
                .orElseThrow(() -> new PumpBusinessException("CHANGE_LOG_NOT_FOUND",
                "Change log with ID " + id + " not found"));
        return mapper.toResponse(changeLog);
    }

    /**
     * Get all change logs for a specific product
     */
    public List<ProductSalesUnitChangeLogResponse> getByProductId(@NotNull UUID productId) {
        return changeLogRepository.findByProduct_IdOrderByCreatedAtDesc(productId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Get all change logs for a specific product type in a pump master
     */
    public List<ProductSalesUnitChangeLogResponse> getByPumpMasterIdAndProductType(
            @NotNull UUID pumpMasterId,
            @NotNull ProductType productType) {
        return changeLogRepository.findByPumpMaster_IdAndProductTypeOrderByCreatedAtDesc(pumpMasterId, productType).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Get change logs for a pump master within a date range
     */
    public List<ProductSalesUnitChangeLogResponse> getByPumpMasterIdAndDateRange(
            @NotNull UUID pumpMasterId,
            @NotNull LocalDateTime startDate,
            @NotNull LocalDateTime endDate) {
        return changeLogRepository.findByPumpMasterIdAndDateRange(pumpMasterId, startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Get change logs for a specific product within a date range
     */
    public List<ProductSalesUnitChangeLogResponse> getByProductIdAndDateRange(
            @NotNull UUID productId,
            @NotNull LocalDateTime startDate,
            @NotNull LocalDateTime endDate) {
        return changeLogRepository.findByProductIdAndDateRange(productId, startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Get all fuel product change logs within a date range for a pump master
     */
    public List<ProductSalesUnitChangeLogResponse> getFuelProductChangesByPumpMasterIdAndDateRange(
            @NotNull UUID pumpMasterId,
            @NotNull LocalDateTime startDate,
            @NotNull LocalDateTime endDate) {
        return changeLogRepository.findFuelProductChangesByPumpMasterIdAndDateRange(pumpMasterId, startDate, endDate).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Get the most recent change log for a product
     */
    public ProductSalesUnitChangeLogResponse getMostRecentChangeByProductId(@NotNull UUID productId) {
        ProductSalesUnitChangeLog changeLog = changeLogRepository.findMostRecentChangeByProductId(productId);
        return mapper.toResponse(changeLog);
    }

    /**
     * Create a new change log entry
     */
    @Transactional
    public ProductSalesUnitChangeLogResponse create(@Valid CreateProductSalesUnitChangeLogRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new PumpBusinessException("PRODUCT_NOT_FOUND",
                "Product with ID " + request.getProductId() + " not found"));

        ProductSalesUnitChangeLog changeLog = new ProductSalesUnitChangeLog(
                product,
                request.getOldSalesUnit(),
                request.getNewSalesUnit(),
                request.getOldStockQuantity(),
                request.getNewStockQuantity(),
                request.getOldSalesRate(),
                request.getNewSalesRate(),
                request.getChangeReason(),
                request.getChangedBy()
        );

        if (request.getRemarks() != null) {
            changeLog.setRemarks(request.getRemarks());
        }

        ProductSalesUnitChangeLog savedChangeLog = changeLogRepository.save(changeLog);
        return mapper.toResponse(savedChangeLog);
    }

    /**
     * Get count of change logs for a product
     */
    public long getCountByProductId(@NotNull UUID productId) {
        return changeLogRepository.countByProduct_Id(productId);
    }

    /**
     * Get count of change logs for a pump master
     */
    public long getCountByPumpMasterId(@NotNull UUID pumpMasterId) {
        return changeLogRepository.countByPumpMaster_Id(pumpMasterId);
    }

    /**
     * Check if a product has any change logs
     */
    public boolean existsByProductId(@NotNull UUID productId) {
        return changeLogRepository.existsByProduct_Id(productId);
    }
}
