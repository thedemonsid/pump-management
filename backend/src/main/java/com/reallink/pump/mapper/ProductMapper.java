package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.reallink.pump.dto.request.CreateProductRequest;
import com.reallink.pump.dto.request.UpdateProductRequest;
import com.reallink.pump.dto.response.ProductResponse;
import com.reallink.pump.entities.Product;
import com.reallink.pump.mapper.config.MapperConfiguration;

@Mapper(config = MapperConfiguration.class)
public interface ProductMapper extends BaseMapper<Product, CreateProductRequest, UpdateProductRequest, ProductResponse> {

    /**
     * Maps CreateProductRequest to Product entity
     */
    @Override
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    Product toEntity(CreateProductRequest request);

    /**
     * Maps Product entity to ProductResponse
     */
    @Override
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "tankCount", expression = "java(entity.getTanks() != null ? entity.getTanks().size() : 0)")
    @Mapping(target = "stockQuantity", source = "stockQuantity")
    ProductResponse toResponse(Product entity);

    /**
     * Maps list of Product entities to list of ProductResponse
     */
    @Override
    List<ProductResponse> toResponseList(List<Product> entities);

    /**
     * Updates existing Product entity with UpdateProductRequest data Only
     * non-null values from the request will be mapped
     */
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tanks", ignore = true)
    void updateEntity(UpdateProductRequest request, @MappingTarget Product entity);

    /**
     * Partial update - only updates non-null fields from CreateProductRequest
     */
    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tanks", ignore = true)
    void partialUpdate(CreateProductRequest request, @MappingTarget Product entity);
}
