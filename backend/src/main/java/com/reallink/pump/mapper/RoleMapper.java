package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.RoleRequest;
import com.reallink.pump.dto.response.RoleResponse;
import com.reallink.pump.entities.Role;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface RoleMapper {

    /**
     * Maps RoleRequest to Role entity
     */
    Role toEntity(RoleRequest request);

    /**
     * Maps Role entity to RoleResponse
     */
    RoleResponse toResponse(Role entity);

    /**
     * Maps list of Role entities to list of RoleResponse
     */
    List<RoleResponse> toResponseList(List<Role> entities);

    /**
     * Updates Role entity from RoleRequest
     */
    void updateEntityFromRequest(RoleRequest request, @MappingTarget Role entity);
}
