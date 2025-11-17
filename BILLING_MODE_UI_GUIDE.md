# Billing Mode UI Flow

## Visual Guide to the New Feature

### 1. Form Header (Unchanged)

```
┌─────────────────────────────────────────┐
│  Create Credit Bill                     │
│  Issue a credit sale bill to a customer │
└─────────────────────────────────────────┘
```

### 2. Customer & Product Selection (Unchanged)

```
┌─────────────────────────────────────────┐
│ Customer *                              │
│ [Select customer... ▼]                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Product *                               │
│ [Select product... ▼]                   │
└─────────────────────────────────────────┘
```

### 3. NEW: Billing Mode Toggle

```
┌─────────────────────────────────────────┐
│ Billing Mode *                          │
│                                         │
│ ┌──────────────────┐ ┌────────────────┐│
│ │ By Quantity (L)  │ │ By Amount (₹) ││
│ │   [SELECTED]     │ │               ││
│ └──────────────────┘ └────────────────┘│
│                                         │
│ ℹ Customer requests specific liters    │
│   (e.g., 10L, 30L)                     │
└─────────────────────────────────────────┘
```

### 4. Rate Display (Unchanged)

```
┌─────────────────────────────────────────┐
│ Rate per Liter *                        │
│ [96.50] (read-only, from product)       │
└─────────────────────────────────────────┘
```

### 5A. BY_QUANTITY Mode - Show Quantity Input

```
┌─────────────────────────────────────────┐
│ Quantity (Liters) *                     │
│ [30.000]                                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ╔═══════════════════════════════════╗   │
│ ║ Calculated Amount:                ║   │
│ ║            ₹2,895.00              ║   │
│ ╚═══════════════════════════════════╝   │
└─────────────────────────────────────────┘
```

### 5B. BY_AMOUNT Mode - Show Amount Input

```
┌─────────────────────────────────────────┐
│ Amount (₹) *                            │
│ [2000.00]                               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ╔═══════════════════════════════════╗   │
│ ║ Calculated Quantity:              ║   │
│ ║            20.725 L               ║   │
│ ╚═══════════════════════════════════╝   │
└─────────────────────────────────────────┘
```

### 6. Vehicle Details (Unchanged)

```
┌─────────────────────────────────────────┐
│ Vehicle Number *                        │
│ [MH12AB1234]                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Driver Name *                           │
│ [Rajesh Kumar]                          │
└─────────────────────────────────────────┘
```

### 7. Images (Unchanged)

```
┌─────────────────────────────────────────┐
│ Images (Optional)                       │
│ Upload meter, vehicle, and other images │
│                                         │
│ [Meter Image] [Vehicle Image] [Extra]  │
└─────────────────────────────────────────┘
```

### 8. Action Buttons (Unchanged)

```
┌─────────────────────────────────────────┐
│  [Cancel]            [Create Bill]      │
└─────────────────────────────────────────┘
```

---

## User Interaction Flow

### Scenario 1: Customer Wants 30 Liters

1. User selects "By Quantity (Liters)" toggle ✅
2. User enters 30.000 in Quantity field
3. System shows: "Calculated Amount: ₹2,895.00" ✅
4. User clicks "Create Bill"
5. Backend receives:
   ```json
   {
     "billingMode": "BY_QUANTITY",
     "quantity": 30.0,
     "rate": 96.5
   }
   ```
6. Backend calculates: `amount = 30.000 × 96.50 = 2895.00`

### Scenario 2: Customer Wants ₹2000 Worth

1. User selects "By Amount (₹)" toggle ✅
2. Quantity field disappears, Amount field appears
3. User enters 2000.00 in Amount field
4. System shows: "Calculated Quantity: 20.725 L" ✅
5. User clicks "Create Bill"
6. Backend receives:
   ```json
   {
     "billingMode": "BY_AMOUNT",
     "requestedAmount": 2000.0,
     "rate": 96.5
   }
   ```
7. Backend calculates: `quantity = 2000.00 ÷ 96.50 = 20.725`

---

## Visual States

### State 1: BY_QUANTITY Selected (Default)

```
[████████████████] [              ]
 By Quantity (L)    By Amount (₹)
     ACTIVE            INACTIVE

     ↓ Shows

Quantity Input Field
+ Calculated Amount Display
```

### State 2: BY_AMOUNT Selected

```
[              ] [████████████████]
 By Quantity (L)    By Amount (₹)
    INACTIVE           ACTIVE

     ↓ Shows

Amount Input Field
+ Calculated Quantity Display
```

---

## Color Coding

- **Active Toggle**: Primary color (blue background, white text)
- **Inactive Toggle**: Outline style (gray border, black text)
- **Calculation Display**: Light primary background with border
- **Required Fields**: Red asterisk (\*)
- **Read-only Fields**: Muted background

---

## Mobile Responsiveness

### Desktop View (Toggles Side by Side)

```
┌──────────────────┐ ┌────────────────┐
│ By Quantity (L)  │ │ By Amount (₹) │
└──────────────────┘ └────────────────┘
```

### Mobile View (Stacked if needed)

```
┌────────────────────────────────────┐
│      By Quantity (L)               │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│      By Amount (₹)                 │
└────────────────────────────────────┘
```

---

## Error Messages

### BY_QUANTITY Mode Validation

- ❌ "Please enter a valid quantity" (if empty or ≤ 0)

### BY_AMOUNT Mode Validation

- ❌ "Please enter a valid amount" (if empty or ≤ 0)

### Common Validation

- ❌ "Please select a customer" (if no customer selected)
- ❌ "Please select a product" (if no product selected)
- ❌ "Please enter a valid rate" (if rate missing)

---

## Accessibility

- Toggle buttons are keyboard accessible (Tab navigation)
- Clear labels with asterisks for required fields
- Descriptive helper text under toggle buttons
- Focus states for all interactive elements
- Screen reader friendly field labels
