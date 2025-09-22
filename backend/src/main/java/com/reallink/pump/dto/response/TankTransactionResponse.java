package com.reallink.pump.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.reallink.pump.entities.TankTransaction;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Response DTO for tank transaction")
public class TankTransactionResponse {

    @Schema(description = "Transaction ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID id;

    @Schema(description = "Tank ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID tankId;

    @Schema(description = "Transaction type", example = "ADDITION")
    private TankTransaction.TransactionType transactionType;

    @Schema(description = "Transaction amount", example = "1000.00")
    private BigDecimal amount;

    @Schema(description = "Entry by user", example = "admin")
    private String entryBy;

    @Schema(description = "Transaction date and time", example = "2023-12-01T10:30:00")
    private LocalDateTime transactionDate;

    @Schema(description = "Transaction remarks", example = "Fuel delivery from supplier")
    private String remarks;
}
