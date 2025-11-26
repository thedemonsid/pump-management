package com.reallink.pump.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeLedgerResponse {

    private List<EmployeeLedgerEntryResponse> ledgerEntries;
    private EmployeeLedgerSummaryResponse summary;
}
