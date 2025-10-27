package com.reallink.pump.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenUserInfoResponse {

    private UUID userId;
    private String username;
    private UUID pumpMasterId;
    private String role;
    private String mobileNumber;
    private String pumpName;
    private Integer pumpId;
    private String pumpCode;
}
