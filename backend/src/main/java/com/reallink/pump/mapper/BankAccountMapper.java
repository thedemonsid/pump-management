package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateBankAccountRequest;
import com.reallink.pump.dto.request.UpdateBankAccountRequest;
import com.reallink.pump.dto.response.BankAccountResponse;
import com.reallink.pump.entities.BankAccount;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BankAccountMapper {

    /**
     * Maps CreateBankAccountRequest to BankAccount entity
     */
    @Mapping(target = "pumpMaster.id", source = "pumpMasterId")
    BankAccount toEntity(CreateBankAccountRequest request);

    /**
     * Maps BankAccount entity to BankAccountResponse
     */
    @Mapping(target = "pumpMasterId", source = "pumpMaster.id")
    BankAccountResponse toResponse(BankAccount entity);

    /**
     * Maps list of BankAccount entities to list of BankAccountResponse
     */
    List<BankAccountResponse> toResponseList(List<BankAccount> entities);

    /**
     * Updates BankAccount entity from UpdateBankAccountRequest
     */
    void updateEntityFromRequest(UpdateBankAccountRequest request, @MappingTarget BankAccount entity);
}
