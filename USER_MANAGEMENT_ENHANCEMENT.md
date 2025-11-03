# User Management Enhancement Implementation Summary

## Overview

This document outlines the implementation of three major enhancements to the pump management system:

1. User absence tracking functionality
2. Manager management (similar to salesman management)
3. Removal of delete functionality for salesmen

## Changes Implemented

### 1. User Absence Tracking

#### Backend Changes

**New Entity: `UserAbsence.java`**

- Location: `backend/src/main/java/com/reallink/pump/entities/UserAbsence.java`
- Fields:
  - `user`: Reference to the User entity (salesman/manager)
  - `pumpMaster`: Reference to the PumpInfoMaster
  - `absenceDate`: Date of absence (LocalDate)
  - `reason`: Optional reason for absence (max 500 chars)
  - `notes`: Additional notes (max 1000 chars)
  - `isApproved`: Approval status (boolean)
  - `approvedBy`: Username of the approver
- Indexes on `user_id`, `pump_master_id`, and `absence_date` for query performance

**DTOs Created:**

- `CreateUserAbsenceRequest.java`: For creating absence records
- `UpdateUserAbsenceRequest.java`: For updating absence records
- `UserAbsenceResponse.java`: Response DTO with user details

**Repository: `UserAbsenceRepository.java`**

- Query methods:
  - `findByPumpMasterId()`: Get all absences for a pump
  - `findByUserIdAndPumpMasterId()`: Get absences for a specific user
  - `findByDateRangeAndPumpMasterId()`: Filter by date range
  - `findByApprovalStatusAndPumpMasterId()`: Filter by approval status
  - `existsByUserIdAndAbsenceDateAndPumpMaster_Id()`: Check for duplicates

**Mapper: `UserAbsenceMapper.java`**

- MapStruct mapper for entity-DTO conversions
- Converts timestamps to IST timezone

**Service: `UserAbsenceService.java`**

- Business logic for absence management
- Validates user belongs to pump master
- Prevents duplicate absence records for same user/date
- Records approver username when approved
- Full CRUD operations

**Controller: `UserAbsenceController.java`**

- Endpoints:
  - `GET /api/v1/user-absences`: Get all absences
  - `GET /api/v1/user-absences/{id}`: Get by ID
  - `GET /api/v1/user-absences/user/{userId}`: Get by user
  - `GET /api/v1/user-absences/date-range`: Filter by date range
  - `GET /api/v1/user-absences/approval-status`: Filter by approval
  - `POST /api/v1/user-absences`: Create absence record
  - `PUT /api/v1/user-absences/{id}`: Update absence record
  - `DELETE /api/v1/user-absences/{id}`: Delete absence record

#### Frontend Changes

**Types: `user-absence.ts`**

- `UserAbsence`: Main type with Zod validation
- `CreateUserAbsence`: Type for creation
- `UpdateUserAbsence`: Type for updates
- Validation rules for reason (500 chars) and notes (1000 chars)

**Service: `user-absence-service.ts`**

- API methods matching backend endpoints
- Type-safe API calls using axios

### 2. Manager Management

#### Backend Changes

**DTOs Created:**

- `CreateManagerRequest.java`: For creating managers
- `UpdateManagerRequest.java`: For updating managers
- `ManagerResponse.java`: Response DTO for manager data

**Repository: `ManagerRepository.java`**

- Queries filter by `role.roleName = 'MANAGER'`
- Methods:
  - `findByPumpMasterId()`: Get all managers for a pump
  - `findByUsernameAndPumpMasterId()`: Find by username
  - `countByPumpMasterId()`: Count managers
  - `existsByUsernameAndPumpMaster_Id()`: Check username uniqueness

**Mapper: `ManagerMapper.java`**

- MapStruct mapper for entity-DTO conversions
- Converts timestamps to IST timezone

**Service: `ManagerService.java`**

- Similar to SalesmanService but for MANAGER role
- Business logic:
  - Validates username uniqueness per pump
  - Sets role to MANAGER automatically
  - Encodes passwords before saving
  - Validates user is actually a manager
- Methods:
  - `getAllByPumpMasterId()`: List all managers
  - `getById()`: Get manager details
  - `create()`: Create new manager
  - `update()`: Update manager details
- **NO DELETE METHOD** (as per requirements)

**Controller: `ManagerController.java`**

- Endpoints:
  - `GET /api/v1/managers`: Get all managers
  - `GET /api/v1/managers/{id}`: Get by ID
  - `POST /api/v1/managers`: Create manager
  - `PUT /api/v1/managers/{id}`: Update manager
- **NO DELETE ENDPOINT** (as per requirements)

#### Frontend Changes

**Types: `manager.ts`**

- `Manager`: Main type with Zod validation
- `CreateManager`: Type for creation (requires password)
- `UpdateManager`: Type for updates
- Same field validations as Salesman

**Service: `manager-service.ts`**

- API methods:
  - `getAll()`: Fetch all managers
  - `getById()`: Fetch manager by ID
  - `create()`: Create new manager
  - `update()`: Update manager
- **NO DELETE METHOD** (as per requirements)

### 3. Removed Delete Functionality for Salesmen

#### Backend Changes

**Modified: `SalesmanService.java`**

- Removed `delete()` method entirely
- Users can now only be disabled via the `enabled` field, not deleted

**Modified: `SalesmanController.java`**

- Removed `@DeleteMapping("/{id}")` endpoint
- Removed unused `DeleteMapping` import

#### Frontend Changes

**Modified: `salesman-service.ts`**

- Removed `delete()` method

**Modified: `salesman-store.ts`**

- Removed `deleteSalesman` action from state interface
- Removed `deleteSalesman` implementation
- Removed `removeSalesman` async method
- Store no longer supports deletion operations

**Note:** The UI in `SalesmenPage.tsx` already doesn't display delete buttons, only edit buttons.

## Database Schema Changes

### New Table: `user_absence`

```sql
CREATE TABLE user_absence (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    pump_master_id UUID NOT NULL,
    absence_date DATE NOT NULL,
    reason VARCHAR(500),
    notes VARCHAR(1000),
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    version BIGINT,
    entry_by VARCHAR(255) NOT NULL DEFAULT 'system',

    CONSTRAINT fk_absence_user FOREIGN KEY (user_id) REFERENCES pump_user_master(id),
    CONSTRAINT fk_absence_pump_master FOREIGN KEY (pump_master_id) REFERENCES pump_info_master(id)
);

CREATE INDEX idx_user_id_absence ON user_absence(user_id);
CREATE INDEX idx_pump_master_id_absence ON user_absence(pump_master_id);
CREATE INDEX idx_absence_date ON user_absence(absence_date);
```

## Security Considerations

1. **Role-Based Access**: Both manager creation and absence management should be restricted to ADMIN users
2. **Pump Master Isolation**: All operations validate data belongs to the authenticated pump master
3. **Approval Tracking**: Absence approvals record the approver's username for audit trails
4. **Password Security**: All passwords are bcrypt-encoded before storage

## Usage Examples

### Creating a Manager (Admin only)

```typescript
const manager = await ManagerService.create({
  username: "jane_manager",
  password: "securePass123",
  mobileNumber: "+919876543210",
  email: "jane@example.com",
  enabled: true,
});
```

### Recording User Absence

```typescript
const absence = await UserAbsenceService.create({
  userId: "user-uuid-here",
  absenceDate: "2025-11-03",
  reason: "Medical leave",
  notes: "Doctor appointment",
});
```

### Approving Absence

```typescript
const approved = await UserAbsenceService.update("absence-id", {
  isApproved: true,
});
// approvedBy is automatically set to current user's username
```

### Disabling a Salesman (instead of deleting)

```typescript
const disabled = await SalesmanService.update("salesman-id", {
  enabled: false,
});
```

## Future Enhancements

1. **Frontend UI Components**: Create complete UI for:

   - Manager management page (similar to SalesmenPage)
   - User absence management page
   - Absence approval workflow

2. **Reporting**: Add reports for:

   - Attendance statistics
   - Absence trends
   - Approval audit logs

3. **Notifications**: Add notifications for:

   - New absence requests
   - Absence approvals/rejections

4. **Bulk Operations**: Allow bulk absence recording for holidays/events

## Notes

- Delete functionality has been completely removed from the codebase to preserve historical data
- Users should be disabled (enabled=false) rather than deleted
- All timestamps are automatically converted to IST timezone
- Optimistic locking is enabled via `@Version` field on all entities
