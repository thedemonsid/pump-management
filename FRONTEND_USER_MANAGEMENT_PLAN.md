# Frontend Implementation Plan: User Management Enhancement

## Overview

This document outlines the frontend implementation plan for:

1. Manager Management UI
2. User Absence Management UI
3. Updates to existing Salesman UI

---

## 1. Manager Management UI

### 1.1 Store Implementation

**File:** `frontend/src/store/manager-store.ts`

```typescript
interface ManagerState {
  managers: Manager[];
  loading: boolean;
  error: string | null;

  // Actions
  setManagers: (managers: Manager[]) => void;
  addManager: (manager: Manager) => void;
  updateManager: (id: string, manager: Partial<Manager>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchManagers: () => Promise<void>;
  createManager: (manager: CreateManagerData) => Promise<void>;
  editManager: (id: string, manager: Partial<Manager>) => Promise<void>;
}
```

**Key Features:**

- Similar structure to `salesman-store.ts`
- No delete functionality
- Toast notifications for success/error
- Loading and error states

---

### 1.2 Manager Form Components

#### A. Create Manager Form

**File:** `frontend/src/pages/managers/CreateManagerForm.tsx`

**Features:**

- Username (required, 3-50 chars)
- Password (required, 6-255 chars, with show/hide toggle)
- Mobile Number (required, E.164 format validation)
- Email (optional, email validation)
- Aadhar Number (optional, 12 digits)
- PAN Number (optional, 10 chars)
- Enabled toggle (default: true)

**Validation:**

- Real-time field validation using Zod schema
- Form submission validation
- Server-side error display

**UI Components:**

- Form fields with labels
- Password visibility toggle
- Submit and Cancel buttons
- Loading state during submission

#### B. Update Manager Form

**File:** `frontend/src/pages/managers/UpdateManagerForm.tsx`

**Features:**

- Pre-populated with existing manager data
- All fields optional except username
- Password field optional (only shown if user wants to change it)
- "Change Password" toggle/section
- Enabled/disabled toggle

**Differences from Create:**

- Password is optional
- Shows current values
- Version field for optimistic locking

---

### 1.3 Manager List Page

**File:** `frontend/src/pages/managers/ManagersPage.tsx`

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Managers                                    [+ Add Manager] │
│ Manage your pump station managers                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─── Managers List ─────────────────────────────────┐  │
│ │ Username | Mobile     | Email    | Status | Actions│  │
│ │──────────┼────────────┼──────────┼────────┼────────│  │
│ │ john_mgr │ +91987...  │ john@... │ ✓ Enab │ [Edit] │  │
│ │ jane_mgr │ +91876...  │ jane@... │ ✓ Enab │ [Edit] │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Features:**

- Data table with columns:
  - Username
  - Mobile Number
  - Email
  - Aadhar Number
  - PAN Number
  - Status (Enabled/Disabled badge)
  - Actions (Edit button only)
- Search/filter functionality
- Sort by columns
- Pagination (if needed)
- Loading skeleton
- Empty state when no managers

**Access Control:**

- Only ADMIN role can access
- Show access denied message for other roles

**Dialogs:**

- Create Manager Dialog (modal)
- Edit Manager Dialog (modal)

---

## 2. User Absence Management UI

### 2.1 Store Implementation

**File:** `frontend/src/store/user-absence-store.ts`

```typescript
interface UserAbsenceState {
  absences: UserAbsence[];
  loading: boolean;
  error: string | null;

  // Actions
  setAbsences: (absences: UserAbsence[]) => void;
  addAbsence: (absence: UserAbsence) => void;
  updateAbsence: (id: string, absence: Partial<UserAbsence>) => void;
  deleteAbsence: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchAbsences: () => Promise<void>;
  fetchAbsencesByUser: (userId: string) => Promise<void>;
  fetchAbsencesByDateRange: (
    startDate: string,
    endDate: string
  ) => Promise<void>;
  fetchAbsencesByApproval: (isApproved: boolean) => Promise<void>;
  createAbsence: (absence: CreateAbsenceData) => Promise<void>;
  editAbsence: (id: string, absence: Partial<UserAbsence>) => Promise<void>;
  removeAbsence: (id: string) => Promise<void>;
  approveAbsence: (id: string) => Promise<void>;
}
```

---

### 2.2 Absence Form Components

#### A. Create Absence Form

**File:** `frontend/src/pages/user-absences/CreateAbsenceForm.tsx`

**Features:**

- User Selection (dropdown with search)
  - Shows username and role
  - Filtered by pump master
  - Includes both salesmen and managers
- Absence Date (date picker)
  - Cannot select dates in the past (optional)
  - Duplicate date validation
- Reason (textarea, optional, 500 chars)
- Notes (textarea, optional, 1000 chars)

**Validation:**

- User required
- Date required and not duplicate
- Character limits enforced

#### B. Update Absence Form

**File:** `frontend/src/pages/user-absences/UpdateAbsenceForm.tsx`

**Features:**

- Pre-populated fields
- Cannot change user (disabled field)
- Can update date, reason, notes
- Approve/Reject toggle (ADMIN only)

---

### 2.3 User Absence List Page

**File:** `frontend/src/pages/user-absences/UserAbsencesPage.tsx`

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│ User Absences                             [+ Record Absence] │
│ Track and manage employee absences                           │
├──────────────────────────────────────────────────────────────┤
│ Filters:                                                      │
│ [User: All ▼] [Status: All ▼] [From: Date] [To: Date] [Apply]│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─── Absence Records ────────────────────────────────────┐  │
│ │ Date       │ User    │ Role    │ Reason │ Status │ Actions│
│ │────────────┼─────────┼─────────┼────────┼────────┼────────│
│ │ 2025-11-03 │ john_s  │ SALES.. │ Sick   │ ⏳ Pend│[Edit]│Del││
│ │ 2025-11-02 │ jane_m  │ MANAGER │ Leave  │ ✓ Appr │[Edit]│Del││
│ └──────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Features:**

- Filter Panel:
  - User dropdown (all users)
  - Approval status (All/Pending/Approved)
  - Date range picker
  - Apply/Clear filters button
- Data Table:
  - Absence Date
  - Username
  - User Role (SALESMAN/MANAGER)
  - Reason (truncated with tooltip)
  - Status Badge:
    - ⏳ Pending (yellow)
    - ✓ Approved (green)
  - Approved By (if approved)
  - Actions: Edit, Delete

**Access Control:**

- ADMIN can view all, approve, and delete
- MANAGER can view all and create
- SALESMAN can only view their own absences

**Dialogs:**

- Create Absence Dialog
- Edit Absence Dialog
- Approve Confirmation Dialog
- Delete Confirmation Dialog

---

### 2.4 User-Specific Absence View

**File:** `frontend/src/pages/user-absences/UserAbsenceCalendar.tsx` (Optional)

**Features:**

- Calendar view showing absence dates
- Color-coded by approval status
- Month/Week view toggle
- Click date to add absence
- Hover to see details

---

## 3. Navigation & Routing Updates

### 3.1 Add New Routes

**File:** `frontend/src/App.tsx` or router config

```typescript
{
  path: '/managers',
  element: <ProtectedRoute><ManagersPage /></ProtectedRoute>,
  adminOnly: true
},
{
  path: '/user-absences',
  element: <ProtectedRoute><UserAbsencesPage /></ProtectedRoute>,
  roles: ['ADMIN', 'MANAGER']
}
```

### 3.2 Update Sidebar Navigation

**File:** `frontend/src/components/app-sidebar.tsx`

Add navigation items:

```typescript
{
  title: "Managers",
  icon: UserCog,
  url: "/managers",
  roles: ["ADMIN"]
},
{
  title: "Absences",
  icon: CalendarX,
  url: "/user-absences",
  roles: ["ADMIN", "MANAGER"]
}
```

---

## 4. Shared Components to Create/Update

### 4.1 User Selector Component

**File:** `frontend/src/components/shared/UserSelector.tsx`

**Features:**

- Searchable dropdown
- Shows username, role, mobile
- Filters by role (optional prop)
- Grouped by role (optional)

**Props:**

```typescript
interface UserSelectorProps {
  value?: string;
  onChange: (userId: string) => void;
  roles?: ("SALESMAN" | "MANAGER")[];
  placeholder?: string;
  disabled?: boolean;
}
```

### 4.2 Approval Status Badge

**File:** `frontend/src/components/shared/ApprovalBadge.tsx`

**Features:**

- Shows approval status with icon
- Color-coded (pending/approved)
- Tooltip with approver name

---

## 5. Updates to Existing Components

### 5.1 Salesmen Page Updates

**File:** `frontend/src/pages/salesmen/SalesmenPage.tsx`

**Changes:**

- Verify delete button is removed (already done)
- Add "View Absences" button for each salesman
- Links to filtered absence view

### 5.2 Dashboard Updates

**File:** `frontend/src/pages/DashboardPage.tsx`

**Add Quick Stats:**

- Total Managers count
- Pending absences count (ADMIN/MANAGER)
- Today's absences

---

## 6. TypeScript Types & Interfaces

### 6.1 Additional Types Needed

**File:** `frontend/src/types/user.ts` (new)

```typescript
export interface UserSummary {
  id: string;
  username: string;
  role: "ADMIN" | "MANAGER" | "SALESMAN";
  mobileNumber: string;
  enabled: boolean;
}

export interface AbsenceSummary {
  totalAbsences: number;
  pendingAbsences: number;
  approvedAbsences: number;
  currentMonthAbsences: number;
}
```

---

## 7. API Integration Checklist

### 7.1 Manager Service ✓

- [x] `getAll()`
- [x] `getById()`
- [x] `create()`
- [x] `update()`

### 7.2 User Absence Service ✓

- [x] `getAll()`
- [x] `getById()`
- [x] `getByUserId()`
- [x] `getByDateRange()`
- [x] `getByApprovalStatus()`
- [x] `create()`
- [x] `update()`
- [x] `delete()`

---

## 8. Form Validation Rules

### Manager Forms

```typescript
username: z.string().min(3).max(50);
password: z.string().min(6).max(255); // only on create or when changing
mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/);
email: z.string().email().optional().or(z.literal(""));
aadharNumber: z.string().max(12).optional();
panNumber: z.string().max(10).optional();
enabled: z.boolean();
```

### Absence Forms

```typescript
userId: z.string().uuid();
absenceDate: z.string().date();
reason: z.string().max(500).optional();
notes: z.string().max(1000).optional();
isApproved: z.boolean();
```

---

## 9. UI/UX Considerations

### Color Scheme

- **Pending Status**: Yellow/Amber (#F59E0B)
- **Approved Status**: Green (#10B981)
- **Disabled User**: Gray (#9CA3AF)
- **Active User**: Blue (#3B82F6)

### Icons (Lucide React)

- Manager: `UserCog`
- Absence: `CalendarX`
- Approved: `CheckCircle`
- Pending: `Clock`
- Add: `Plus`
- Edit: `Pencil`
- Delete: `Trash2`

### Responsive Design

- Mobile: Stack filters vertically
- Tablet: 2-column layout for forms
- Desktop: Full table view with all columns

---

## 10. Implementation Order

### Phase 1: Manager Management (Priority 1)

1. ✅ Create `manager-store.ts`
2. ✅ Create `CreateManagerForm.tsx`
3. ✅ Create `UpdateManagerForm.tsx`
4. ✅ Create `ManagersPage.tsx`
5. ✅ Add navigation links
6. ✅ Test CRUD operations

### Phase 2: User Absence (Priority 2)

1. ✅ Create `user-absence-store.ts`
2. ✅ Create `UserSelector.tsx` component
3. ✅ Create `CreateAbsenceForm.tsx`
4. ✅ Create `UpdateAbsenceForm.tsx`
5. ✅ Create `UserAbsencesPage.tsx`
6. ✅ Add navigation links
7. ✅ Implement filters
8. ✅ Test CRUD operations
9. ✅ Test approval workflow

### Phase 3: Enhancements (Priority 3)

1. ⬜ Add absence calendar view (optional)
2. ⬜ Add dashboard widgets
3. ⬜ Add "View Absences" to salesman/manager pages
4. ⬜ Add bulk absence operations
5. ⬜ Add export functionality

---

## 11. Testing Checklist

### Manager Management

- [ ] ADMIN can create managers
- [ ] ADMIN can update managers
- [ ] Cannot create duplicate usernames
- [ ] Password is required on create
- [ ] Password is optional on update
- [ ] Email validation works
- [ ] Mobile number validation works
- [ ] Enabled/disabled toggle works
- [ ] Non-ADMIN cannot access page

### User Absence Management

- [ ] Can create absence record
- [ ] Cannot create duplicate absence for same user/date
- [ ] Date picker works correctly
- [ ] Character limits enforced
- [ ] Can filter by user
- [ ] Can filter by date range
- [ ] Can filter by approval status
- [ ] ADMIN can approve absences
- [ ] Approver name is recorded
- [ ] Can delete absence records
- [ ] Access control works (ADMIN/MANAGER/SALESMAN)

### General

- [ ] Loading states display correctly
- [ ] Error messages display correctly
- [ ] Success toasts show
- [ ] Forms validate on submit
- [ ] Forms validate on blur (optional)
- [ ] Responsive on mobile
- [ ] Navigation links work
- [ ] Protected routes enforce roles

---

## 12. Error Handling

### Common Errors to Handle

```typescript
// Duplicate username
"Manager with username 'john' already exists";

// Duplicate absence
"Absence record already exists for this user on 2025-11-03";

// Access denied
"You don't have permission to perform this action";

// Not found
"Manager with ID '...' not found";

// Validation errors
"Username must be between 3 and 50 characters";
"Mobile number should be valid";
```

### Error Display Strategy

- Form field errors: Below the field (red text)
- API errors: Toast notification
- Access denied: Full-page message
- Network errors: Retry button + toast

---

## 13. Accessibility (a11y)

- [ ] All forms have proper labels
- [ ] All interactive elements are keyboard accessible
- [ ] Proper ARIA labels for icons/buttons
- [ ] Error messages announced by screen readers
- [ ] Focus management in dialogs
- [ ] Color contrast meets WCAG AA
- [ ] Tables have proper headers

---

## 14. Performance Optimizations

- Use React.memo for list items
- Debounce search/filter inputs
- Paginate large lists (50+ items)
- Lazy load calendar view
- Cache user list for selector
- Optimistic UI updates where appropriate

---

## 15. File Structure Summary

```
frontend/src/
├── pages/
│   ├── managers/
│   │   ├── ManagersPage.tsx
│   │   ├── CreateManagerForm.tsx
│   │   └── UpdateManagerForm.tsx
│   └── user-absences/
│       ├── UserAbsencesPage.tsx
│       ├── CreateAbsenceForm.tsx
│       ├── UpdateAbsenceForm.tsx
│       └── UserAbsenceCalendar.tsx (optional)
├── components/
│   └── shared/
│       ├── UserSelector.tsx
│       └── ApprovalBadge.tsx
├── store/
│   ├── manager-store.ts
│   └── user-absence-store.ts
├── services/
│   ├── manager-service.ts ✓
│   └── user-absence-service.ts ✓
└── types/
    ├── manager.ts ✓
    ├── user-absence.ts ✓
    └── user.ts (new)
```

---

## 16. API Endpoint Reference

### Manager Endpoints

```
GET    /api/v1/managers           - Get all managers
GET    /api/v1/managers/{id}      - Get manager by ID
POST   /api/v1/managers           - Create manager
PUT    /api/v1/managers/{id}      - Update manager
```

### User Absence Endpoints

```
GET    /api/v1/user-absences                  - Get all absences
GET    /api/v1/user-absences/{id}             - Get absence by ID
GET    /api/v1/user-absences/user/{userId}    - Get by user
GET    /api/v1/user-absences/date-range       - Get by date range
GET    /api/v1/user-absences/approval-status  - Get by approval
POST   /api/v1/user-absences                  - Create absence
PUT    /api/v1/user-absences/{id}             - Update absence
DELETE /api/v1/user-absences/{id}             - Delete absence
```

---

## Next Steps

1. Start with **Phase 1** (Manager Management UI)
2. Use existing `SalesmenPage.tsx` as template
3. Follow the component structure outlined above
4. Test thoroughly before moving to Phase 2
5. Deploy incrementally (manager management first, then absences)

---

## Notes

- All timestamps from API are in IST (already converted)
- Use existing UI component library (shadcn/ui)
- Follow existing patterns from SalesmenPage
- Maintain consistency with existing color scheme
- All forms should have loading states
- All lists should have empty states
- Consider adding keyboard shortcuts for power users
