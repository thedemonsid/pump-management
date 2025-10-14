# Tank Current Level Refactoring Summary

## Overview

Removed the `current_level` column from the `pump_tank_master` table and refactored the codebase to calculate the current level dynamically based on transactions.

## Date

October 14, 2025

## Motivation

- **Eliminate Data Redundancy**: The `current_level` was redundant since it can be calculated from `opening_level` + cumulative transactions
- **Ensure Data Consistency**: Calculating dynamically eliminates potential inconsistencies between stored level and transaction history
- **Single Source of Truth**: Transaction records become the single source of truth for fuel movements

## Changes Made

### 1. Database Schema (`Tank` Entity)

**File**: `backend/src/main/java/com/reallink/pump/entities/Tank.java`

#### Removed:

```java
@Column(name = "current_level", precision = 12, scale = 2)
private BigDecimal currentLevel = BigDecimal.ZERO;
```

#### Updated Business Methods:

All business methods now accept `currentLevel` as a parameter:

- `isLowLevel(BigDecimal currentLevel)` - Check if tank is at low level
- `getAvailableCapacity(BigDecimal currentLevel)` - Calculate available capacity
- `getFillPercentage(BigDecimal currentLevel)` - Calculate fill percentage

### 2. Database Migration

**File**: `backend/src/main/resources/db-migrations/14-oct-2025-remove-tank-current-level.sql`

```sql
ALTER TABLE pump_tank_master DROP COLUMN IF EXISTS current_level;
```

### 3. Service Layer Updates

#### TankService

**File**: `backend/src/main/java/com/reallink/pump/services/TankService.java`

##### New Method:

```java
public BigDecimal getCurrentFuelLevel(@NotNull UUID tankId)
```

- Calculates current fuel level (closing balance of today)
- Formula: `Opening Level + Cumulative Net (Additions - Removals) up to today`

##### Enhanced Method:

```java
private void setCurrentLevel(TankResponse response, Tank tank)
```

- Calculates and sets current level on response DTO
- Also sets calculated fields: `availableCapacity`, `fillPercentage`, `isLowLevel`

##### Updated Methods:

All methods returning `TankResponse` now call `setCurrentLevel()`:

- `getAllPaginated()`
- `getAll()`
- `getById()`
- `getByPumpMasterId()`
- `create()`
- `update()`

#### FuelPurchaseService

**File**: `backend/src/main/java/com/reallink/pump/services/FuelPurchaseService.java`

Removed tank level update logic since current level is now calculated dynamically:

```java
// REMOVED:
// tank.setCurrentLevel(newLevel);
// tankRepository.save(tank);
```

### 4. Repository Updates

**File**: `backend/src/main/java/com/reallink/pump/repositories/TankRepository.java`

#### Commented Out Methods:

- `findLowLevelTanks()` - Should be determined by calculating current level in service layer
- `getTotalCurrentLevelByPumpMasterId()` - Should be calculated by summing individual tank levels

### 5. Mapper Updates

#### TankMapper

**File**: `backend/src/main/java/com/reallink/pump/mapper/TankMapper.java`

Updated `toResponse()` mapping to ignore calculated fields:

```java
@Mapping(target = "currentLevel", ignore = true)
@Mapping(target = "availableCapacity", ignore = true)
@Mapping(target = "fillPercentage", ignore = true)
@Mapping(target = "isLowLevel", ignore = true)
```

#### NozzleMapper

**File**: `backend/src/main/java/com/reallink/pump/mapper/NozzleMapper.java`

Updated to ignore `tank.currentLevel`:

```java
@Mapping(target = "tank.currentLevel", ignore = true)
```

### 6. Controller Updates

**File**: `backend/src/main/java/com/reallink/pump/controllers/TankController.java`

#### Updated Endpoint:

```java
GET /api/v1/tanks/{tankId}/fuel-level
```

- Returns current fuel level as `BigDecimal`
- Calls `service.getCurrentFuelLevel(tankId)`

## Calculation Logic

### Current Level Formula:

```
Current Level = Opening Level + Cumulative Net (up to today)
```

Where:

- **Opening Level**: The initial fuel level when tank was set up (from `opening_level` field)
- **Cumulative Net**: Sum of all daily net changes from `daily_tank_level` table
  - Net = (Additions - Removals)
  - Calculated by: `SUM(daily_net) WHERE date <= today`

### Data Flow:

1. Fuel transactions (additions/removals) are recorded in `tank_transactions` table
2. Daily net changes are aggregated in `daily_tank_level` table
3. Current level is calculated on-demand: `opening_level + SUM(daily_net)`

## API Impact

### Existing Endpoints (No Breaking Changes):

All tank endpoints continue to return `currentLevel` in the response:

- `GET /api/v1/tanks` - Returns all tanks with calculated levels
- `GET /api/v1/tanks/{id}` - Returns single tank with calculated level
- `GET /api/v1/tanks/pump/{pumpMasterId}` - Returns tanks by pump with calculated levels

### New Endpoint:

- `GET /api/v1/tanks/{tankId}/fuel-level` - Returns only the current fuel level as a number

## Frontend Compatibility

### No Changes Required:

The `TankResponse` DTO still includes `currentLevel` field, so the frontend continues to work without modifications. The difference is that `currentLevel` is now calculated dynamically instead of being stored.

### Frontend Already Uses Dynamic Calculation:

The tank ledger page (`TankLedgerPage.tsx`) already calculates current level dynamically:

```typescript
const closingLevel = openingLevel + totalAdditions - totalRemovals;
```

This aligns perfectly with the new backend approach.

## Benefits

1. **Data Integrity**: Single source of truth (transactions) eliminates inconsistencies
2. **Auditability**: Full transaction history provides complete audit trail
3. **Accuracy**: Current level always reflects actual transaction history
4. **Simplicity**: Removes need to maintain synchronized redundant data
5. **Flexibility**: Easy to calculate level for any date, not just today

## Testing Recommendations

1. **Verify Current Level Calculation**: Compare calculated levels with previous stored values
2. **Test Fuel Transactions**: Ensure additions/removals correctly update daily net
3. **Test Date Ranges**: Verify level calculation for different date ranges
4. **Test Low Level Alerts**: Ensure alerts trigger correctly with calculated levels
5. **Performance Testing**: Monitor query performance for large transaction volumes

## Migration Steps

1. ✅ Update entity to remove `current_level` field
2. ✅ Update business methods to accept current level as parameter
3. ✅ Update service layer to calculate and set current level
4. ✅ Update mappers to ignore calculated fields
5. ✅ Comment out repository methods that query `current_level`
6. ✅ Remove tank level updates from fuel purchase service
7. ✅ Create database migration to drop column
8. ✅ Build and test

## Rollback Plan

If rollback is needed:

1. Revert the migration file
2. Add back `current_level` column with default value 0
3. Run a script to populate `current_level` from calculated values
4. Revert code changes

## Notes

- The `TankResponse` DTO retains `currentLevel` field for API compatibility
- Current level is calculated in service layer before returning responses
- No breaking changes to API contracts
- Frontend requires no modifications
