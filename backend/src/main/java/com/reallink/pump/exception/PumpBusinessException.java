package com.reallink.pump.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class PumpBusinessException extends RuntimeException {

    private final String errorCode;
    private final String message;
    private final Object[] args;

    public PumpBusinessException(String errorCode, String message) {
        this(errorCode, message, new Object[0]);
    }
}
