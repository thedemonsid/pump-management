package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * Base mapper interface providing common mapping methods
 *
 * @param <E> Entity type
 * @param <C> Create request DTO type
 * @param <U> Update request DTO type
 * @param <R> Response DTO type
 */
public interface BaseMapper<E, C, U, R> {

    /**
     * Maps create request DTO to entity
     */
    E toEntity(C createRequest);

    /**
     * Maps entity to response DTO
     */
    R toResponse(E entity);

    /**
     * Maps list of entities to list of response DTOs
     */
    List<R> toResponseList(List<E> entities);

    /**
     * Updates existing entity with update request DTO data Only non-null values
     * from the request will be mapped
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(U updateRequest, @MappingTarget E entity);

    /**
     * Partial update - only updates non-null fields from create request DTO
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(C createRequest, @MappingTarget E entity);
}
