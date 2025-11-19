# Absence Type Feature Implementation Summary

**Date:** November 19, 2025  
**Feature:** Added Absence Type (Full Day, Half Day, Overtime) to User Absence Management

---

## Overview

Enhanced the user absence system to track different types of absences:

- **FULL_DAY**: Standard full-day absence
- **HALF_DAY**: Half-day absence (partial day off)
- **OVERTIME**: Overtime work record

---

## Changes Made

### 1. Backend Changes

#### New Files Created:

1. **`backend/src/main/java/com/reallink/pump/enums/AbsenceType.java`**

   - Enum with three values: FULL_DAY, HALF_DAY, OVERTIME

2. **`backend/add_absence_type_columns.sql`**
   - Migration script to add `absence_type` column
   - Adds constraints and indexes
   - Sets default value to FULL_DAY for existing records

#### Modified Files:

3. **`backend/src/main/java/com/reallink/pump/entities/UserAbsence.java`**

   - Added `absenceType` field with default value FULL_DAY

   ```java
   @NotNull(message = "Absence type is required")
   @Enumerated(EnumType.STRING)
   @Column(name = "absence_type", nullable = false, length = 20)
   private AbsenceType absenceType = AbsenceType.FULL_DAY;
   ```

4. **`backend/src/main/java/com/reallink/pump/dto/request/CreateUserAbsenceRequest.java`**

   - Added `absenceType` field (required)

5. **`backend/src/main/java/com/reallink/pump/dto/request/UpdateUserAbsenceRequest.java`**

   - Added `absenceType` field (optional for updates)

6. **`backend/src/main/java/com/reallink/pump/dto/response/UserAbsenceResponse.java`**
   - Added `absenceType` field in response

---

### 2. Frontend Changes

#### Modified Files:

7. **`frontend/src/types/user-absence.ts`**

   - Added `AbsenceType` enum
   - Updated schemas to include `absenceType` field with default FULL_DAY

8. **`frontend/src/services/user-absence-service.ts`**

   - Updated `create()` method to require `absenceType`
   - Updated `update()` method to accept optional `absenceType`

9. **`frontend/src/store/user-absence-store.ts`**

   - Updated state interface to include `absenceType` in create/edit methods

10. **`frontend/src/pages/user-absences/CreateAbsenceForm.tsx`**

    - Added Absence Type dropdown field with three options
    - Required field with visual indicator
    - Form validation includes absenceType

11. **`frontend/src/pages/user-absences/UpdateAbsenceForm.tsx`**

    - Added Absence Type dropdown field (editable)
    - Pre-fills with existing absence type value

12. **`frontend/src/pages/user-absences/UserAbsencesPage.tsx`**
    - Added **Absence Type filter** in the filters card (4-column grid)
    - Added **Type column** in the absences table
    - Color-coded badges:
      - 🔵 **Blue** for Full Day
      - 🟡 **Yellow** for Half Day
      - 🟢 **Green** for Overtime
    - Updated filter logic to include absence type filtering

---

## Database Migration

Run the SQL migration script:

```bash
mysql -u your_username -p your_database < backend/add_absence_type_columns.sql
```

Or execute manually:

```sql
-- Add absence_type column with default
ALTER TABLE user_absence
ADD COLUMN absence_type VARCHAR(20) DEFAULT 'FULL_DAY' NOT NULL;

-- Add constraint
ALTER TABLE user_absence
ADD CONSTRAINT chk_absence_type
CHECK (absence_type IN ('FULL_DAY', 'HALF_DAY', 'OVERTIME'));

-- Add index
CREATE INDEX idx_user_absence_type ON user_absence(absence_type);

-- Update existing records
UPDATE user_absence SET absence_type = 'FULL_DAY' WHERE absence_type IS NULL;
```

---

## Usage Instructions

### Creating an Absence Record:

1. Navigate to User Absences page
2. Click "Record Absence" button
3. Fill in the form:
   - **User**: Select the salesman or manager
   - **Absence Date**: Pick the date
   - **Absence Type**: Choose Full Day, Half Day, or Overtime
   - **Reason**: Optional description
   - **Notes**: Optional additional info
4. Click "Record Absence"

### Filtering by Absence Type:

1. In the filters section (4 filters available):
   - Absence Date
   - User
   - Status (Approved/Pending)
   - **Absence Type** (NEW) ← Select Full Day, Half Day, or Overtime
2. Apply filters to view specific absence types
3. Click "Reset to Default" to clear all filters

### Table Display:

The absences table now shows:

- Date
- User
- Role
- **Type** (NEW) ← Color-coded badge
- Reason
- Status
- Approved By
- Actions

---

## API Changes

### Create Absence Endpoint

**POST** `/api/v1/user-absences`

New required field in request body:

```json
{
  "userId": "uuid",
  "absenceDate": "2025-11-19",
  "absenceType": "FULL_DAY", // NEW: Required
  "reason": "Optional",
  "notes": "Optional"
}
```

### Update Absence Endpoint

**PUT** `/api/v1/user-absences/{id}`

New optional field:

```json
{
  "absenceDate": "2025-11-19",
  "absenceType": "HALF_DAY", // NEW: Optional
  "reason": "Updated reason",
  "notes": "Updated notes",
  "isApproved": true
}
```

### Response Format

All absence responses now include:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "username": "John Doe",
  "userRole": "SALESMAN",
  "pumpMasterId": "uuid",
  "absenceDate": "2025-11-19",
  "absenceType": "FULL_DAY", // NEW
  "reason": "Sick leave",
  "notes": "Doctor appointment",
  "isApproved": false,
  "approvedBy": null,
  "createdAt": "2025-11-19T10:30:00",
  "updatedAt": "2025-11-19T10:30:00",
  "version": 0
}
```

---

## Testing Checklist

- [ ] Run database migration script
- [ ] Restart backend server
- [ ] Verify enum loads correctly
- [ ] Create absence with FULL_DAY type
- [ ] Create absence with HALF_DAY type
- [ ] Create absence with OVERTIME type
- [ ] Filter by absence type
- [ ] Edit absence and change type
- [ ] Verify badge colors display correctly
- [ ] Test on mobile responsive view
- [ ] Verify existing absences show FULL_DAY as default

---

## Future Enhancements (Not Implemented)

These features were considered but not included in this simplified implementation:

- ❌ Half-day period (morning/afternoon/evening)
- ❌ Overtime hours tracking
- ❌ Overtime rate calculation
- ❌ Leave type categorization (sick leave, casual leave, etc.)
- ❌ Salary impact tracking
- ❌ Attachment uploads
- ❌ Summary statistics and reports
- ❌ Department-wise analytics

---

## Files Summary

**Backend:** 6 files modified + 2 new files  
**Frontend:** 6 files modified  
**Database:** 1 migration script  
**Documentation:** This file

**Total:** 15 files changed

---

## Rollback Instructions

If you need to rollback this feature:

### Database Rollback:

```sql
-- Remove constraint and index
ALTER TABLE user_absence DROP CONSTRAINT chk_absence_type;
DROP INDEX idx_user_absence_type ON user_absence;

-- Remove column
ALTER TABLE user_absence DROP COLUMN absence_type;
```

### Code Rollback:

```bash
git checkout HEAD~1 -- backend/src/main/java/com/reallink/pump/entities/UserAbsence.java
git checkout HEAD~1 -- backend/src/main/java/com/reallink/pump/dto/
git checkout HEAD~1 -- frontend/src/types/user-absence.ts
git checkout HEAD~1 -- frontend/src/services/user-absence-service.ts
git checkout HEAD~1 -- frontend/src/store/user-absence-store.ts
git checkout HEAD~1 -- frontend/src/pages/user-absences/
rm backend/src/main/java/com/reallink/pump/enums/AbsenceType.java
rm backend/add_absence_type_columns.sql
```

---

**Implementation Complete! ✅**
