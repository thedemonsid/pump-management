package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.reallink.pump.dto.request.CreateBankTransactionRequest;
import com.reallink.pump.dto.response.BankTransactionResponse;
import com.reallink.pump.entities.BankTransaction;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface BankTransactionMapper {

    /**
     * Maps CreateBankTransactionRequest to BankTransaction entity
     */
    BankTransaction toEntity(CreateBankTransactionRequest request);

    /**
     * Maps BankTransaction entity to BankTransactionResponse
     */
    @Mapping(target = "bankAccountId", source = "bankAccount.id")
    BankTransactionResponse toResponse(BankTransaction entity);

    /**
     * Maps list of BankTransaction entities to list of BankTransactionResponse
     */
    List<BankTransactionResponse> toResponseList(List<BankTransaction> entities);
}
