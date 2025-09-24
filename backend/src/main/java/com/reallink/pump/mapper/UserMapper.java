package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateUserRequest;
import com.reallink.pump.dto.request.UpdateUserRequest;
import com.reallink.pump.dto.response.UserResponse;
import com.reallink.pump.entities.User;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {

    /**
     * Maps CreateUserRequest to User entity
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    @Mapping(target = "role", ignore = true) // Will be set manually in service
    User toEntity(CreateUserRequest request);

    /**
     * Maps User entity to UserResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    @Mapping(target = "role", source = "role.roleName")
    UserResponse toResponse(User entity);

    /**
     * Maps list of User entities to list of UserResponse
     */
    List<UserResponse> toResponseList(List<User> entities);

    /**
     * Updates User entity from UpdateUserRequest
     */
    @Mapping(target = "role", ignore = true) // Will be set manually in service
    void updateEntityFromRequest(UpdateUserRequest request, @MappingTarget User entity);
}
