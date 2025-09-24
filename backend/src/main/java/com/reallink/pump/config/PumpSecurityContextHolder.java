package com.reallink.pump.config;

import java.util.UUID;

public class PumpSecurityContextHolder {

    private static final ThreadLocal<UUID> pumpMasterId = new ThreadLocal<>();

    public static void setPumpMasterId(UUID id) {
        pumpMasterId.set(id);
    }

    public static UUID getPumpMasterId() {
        return pumpMasterId.get();
    }

    public static void clear() {
        pumpMasterId.remove();
    }
}