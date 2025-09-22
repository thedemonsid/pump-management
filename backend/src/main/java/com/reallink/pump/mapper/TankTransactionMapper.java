package com.reallink.pump.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.reallink.pump.dto.request.CreateTankTransactionRequest;
import com.reallink.pump.dto.response.TankTransactionResponse;
import com.reallink.pump.entities.TankTransaction;

@Mapper(componentModel = "spring")
public interface TankTransactionMapper {

    @Mapping(target = "tankId", source = "tank.id")
    TankTransactionResponse toResponse(TankTransaction entity);

    List<TankTransactionResponse> toResponseList(List<TankTransaction> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "tank", ignore = true)
    @Mapping(target = "transactionType", ignore = true)
    @Mapping(target = "entryBy", ignore = true)
    TankTransaction toEntity(CreateTankTransactionRequest request);
}
