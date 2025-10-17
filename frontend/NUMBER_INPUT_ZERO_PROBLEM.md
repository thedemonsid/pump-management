# Number Input Zero Problem - Solution Guide

## Problem Description

When using number inputs in React, a common issue occurs where:

- If you clear the input field completely, it automatically shows "0"
- You cannot remove the "0" value from the input
- The input feels "sticky" and doesn't behave naturally

This happens because of how the default value handling works:

```typescript
// ❌ PROBLEMATIC CODE
<Input
  type="number"
  value={count}
  onChange={(e) => setCount(parseInt(e.target.value) || 0)}
/>
```

**Why it happens:**

- `parseInt("")` returns `NaN`
- `NaN || 0` evaluates to `0`
- So an empty input immediately becomes `0`
- User sees "0" appear and cannot delete it

---

## Solution

### Method 1: Display Empty String for Zero Values

This is the **recommended approach** - show an empty field when the value is 0:

```typescript
// ✅ CORRECT CODE
<Input
  type="number"
  min="0"
  value={count === 0 ? "" : count} // Show empty string when 0
  onChange={(e) => {
    const value = e.target.value;
    setCount(value === "" ? 0 : parseInt(value) || 0);
  }}
  placeholder="0" // Show "0" as placeholder hint
/>
```

**Benefits:**

- ✅ Users can clear the input completely
- ✅ Field shows empty (not "0") when cleared
- ✅ Placeholder "0" provides visual hint
- ✅ Internal value remains 0 for calculations
- ✅ Natural input behavior

---

### Method 2: Allow Undefined/Null State

For cases where you need to distinguish between "not entered" and "0":

```typescript
// ✅ ALTERNATIVE: Allow undefined state
const [count, setCount] = useState<number | undefined>(undefined);

<Input
  type="number"
  value={count ?? ""} // Empty if undefined
  onChange={(e) => {
    const value = e.target.value;
    setCount(value === "" ? undefined : parseInt(value) || 0);
  }}
  placeholder="Enter amount"
/>;
```

**Use when:**

- You need to differentiate between "user entered 0" vs "user didn't enter anything"
- Form validation requires knowing if field was touched
- Backend expects `null` for empty numeric fields

---

## Implementation Examples

### Example 1: Cash Denominations Dialog

**Location:** `frontend/src/pages/salesman-shifts/AccountingTablePage.tsx`

```typescript
// Cash form state
const [cashForm, setCashForm] = useState({
  notes2000: 0,
  notes1000: 0,
  // ... other denominations
});

// Render with proper empty handling
<Input
  type="number"
  min="0"
  value={cashForm.notes2000 === 0 ? "" : cashForm.notes2000}
  onChange={(e) => {
    const value = e.target.value;
    setCashForm((prev) => ({
      ...prev,
      notes2000: value === "" ? 0 : parseInt(value) || 0,
    }));
  }}
  placeholder="0"
/>;
```

### Example 2: Amount Input with ReactSelect Alternative

For amount fields using CreatableSelect, this issue doesn't occur because the library handles it internally. However, if you switch to regular inputs:

```typescript
// If you need to use regular input for amounts
<Input
  type="number"
  min="0"
  step="0.01"
  value={amount === 0 ? "" : amount}
  onChange={(e) => {
    const value = e.target.value;
    setAmount(value === "" ? 0 : parseFloat(value) || 0);
  }}
  placeholder="0.00"
  className="text-right"
/>
```

---

## Common Pitfalls to Avoid

### ❌ Don't do this:

```typescript
// BAD: Forces 0 immediately
onChange={(e) => setCount(parseInt(e.target.value) || 0)}

// BAD: Shows "0" in the field
value={count}  // when count is 0
```

### ✅ Do this instead:

```typescript
// GOOD: Allows empty field
value={count === 0 ? "" : count}
onChange={(e) => {
  const value = e.target.value;
  setCount(value === "" ? 0 : parseInt(value) || 0);
}}
```

---

## Quick Reference

| Scenario                    | Value Prop                   | onChange Handler                                    |
| --------------------------- | ---------------------------- | --------------------------------------------------- |
| **Integer (0 means empty)** | `count === 0 ? "" : count`   | `value === "" ? 0 : parseInt(value) \|\| 0`         |
| **Decimal (0 means empty)** | `amount === 0 ? "" : amount` | `value === "" ? 0 : parseFloat(value) \|\| 0`       |
| **Optional number**         | `count ?? ""`                | `value === "" ? undefined : parseInt(value) \|\| 0` |

---

## Testing Checklist

After implementing the fix, verify:

- [ ] Can clear the input completely without "0" appearing
- [ ] Placeholder shows when input is empty
- [ ] Typing numbers works normally
- [ ] Calculations still work with empty fields (treat as 0)
- [ ] Negative values are blocked if `min="0"` is set
- [ ] Decimal values work if using `parseFloat` instead of `parseInt`
- [ ] Form submission handles empty fields correctly

---

## Related Issues

This solution also fixes related problems:

- Input doesn't allow backspace to fully clear
- Cannot start typing from empty state
- Field always shows a number even when "cleared"
- Poor UX where users fight with the input field

---

## Additional Notes

- This pattern works with any controlled number input in React
- Apply the same logic to all number fields in the application for consistency
- Consider creating a reusable `NumberInput` component with this behavior built-in
- For money amounts, use `parseFloat` instead of `parseInt` to preserve decimals

---

**Last Updated:** October 17, 2025  
**Applies To:** React + TypeScript projects with controlled number inputs
