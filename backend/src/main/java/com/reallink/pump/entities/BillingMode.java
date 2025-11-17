package com.reallink.pump.entities;

/**
 * Enum to represent how a bill was created - BY_QUANTITY: Customer requested
 * specific quantity (e.g., 10L, 30L) - BY_AMOUNT: Customer requested specific
 * amount (e.g., ₹1000, ₹2000)
 */
public enum BillingMode {
    BY_QUANTITY,
    BY_AMOUNT
}
