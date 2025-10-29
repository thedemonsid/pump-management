# Authentication Error Handling Fix

## Problem Statement

The application had issues where authorization errors (403 Forbidden) weren't properly handled, causing:

1. Backend returning 500 errors instead of 403 for `AuthorizationDeniedException`
2. Frontend not logging out users when authentication/authorization errors occurred
3. Inconsistent error handling between 401 (Unauthorized) and 403 (Forbidden) responses

### Original Error

```
org.springframework.security.authorization.AuthorizationDeniedException: Access Denied
```

This was being caught by the generic exception handler and returned as a 500 error.

## Solutions Implemented

### 1. Backend Fix: GlobalExceptionHandler.java

Added specific handlers for authorization exceptions to return proper HTTP status codes:

```java
@ExceptionHandler(AuthorizationDeniedException.class)
public ResponseEntity<ErrorResponse> handleAuthorizationDeniedException(
    AuthorizationDeniedException ex, HttpServletRequest request) {
    log.warn("Authorization denied: {} - URI: {}", ex.getMessage(), request.getRequestURI());

    ErrorResponse error = new ErrorResponse(
        HttpStatus.FORBIDDEN.value(),
        "ACCESS_DENIED",
        "You do not have permission to access this resource",
        request.getRequestURI()
    );

    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
}

@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<ErrorResponse> handleAccessDeniedException(
    AccessDeniedException ex, HttpServletRequest request) {
    // Similar implementation for Spring Security's AccessDeniedException
}
```

**Benefits:**

- Returns proper 403 status code instead of 500
- Provides consistent error responses
- Improves client-side error handling
- Better logging for debugging

### 2. Frontend Fix: api.ts Interceptor

Enhanced the Axios response interceptor to handle 403 errors properly:

```typescript
// Handle 403 Forbidden - authorization/permission errors
if (status === 403) {
  console.error("Access denied - insufficient permissions or invalid token");

  const errorCode = data?.errorCode;
  if (errorCode === "ACCESS_DENIED" && !originalRequest._retry) {
    // Try to refresh token - might be expired/invalid
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken && !isRefreshing) {
      // Attempt token refresh...
    } else {
      // No refresh possible, logout
      handleTokenExpiration();
      return Promise.reject(new Error("Access denied. Please log in again."));
    }
  }

  // If genuine permission error, just reject
  throw new Error(`403: ${message}`);
}
```

**Benefits:**

- Handles both 401 and 403 errors consistently
- Attempts token refresh for authorization errors that might be due to expired tokens
- Forces logout when token refresh is not possible
- Distinguishes between expired tokens and genuine permission issues

### 3. Error Flow

#### Before Fix:

1. User makes request with expired/invalid token
2. Backend throws `AuthorizationDeniedException`
3. Generic handler catches it → returns 500 error
4. Frontend sees 500 error → doesn't trigger logout
5. User remains "logged in" but can't access resources

#### After Fix:

1. User makes request with expired/invalid token
2. Backend throws `AuthorizationDeniedException`
3. Specific handler catches it → returns 403 error with `ACCESS_DENIED` code
4. Frontend intercepts 403 error
5. Attempts token refresh if refresh token available
6. If refresh fails or unavailable → triggers logout
7. User is redirected to login page

## HTTP Status Codes Used

- **401 Unauthorized**: Authentication required (missing or invalid credentials)

  - Triggers token refresh attempt
  - Falls back to logout if refresh fails

- **403 Forbidden**: Authenticated but insufficient permissions

  - Checks if due to expired token (attempts refresh)
  - If genuine permission issue, shows error message
  - Falls back to logout if token-related

- **500 Internal Server Error**: Only for genuine server errors
  - No longer used for authorization failures

## Testing Recommendations

1. **Test expired access token with valid refresh token:**

   - Should automatically refresh and retry request
   - User should not be logged out

2. **Test expired access and refresh tokens:**

   - Should immediately log out user
   - Redirect to login page

3. **Test genuine permission errors:**

   - Should show "Access denied" message
   - Should NOT log out user (they're authenticated, just not authorized)

4. **Test network errors:**
   - Should show appropriate error message
   - Should not trigger unnecessary logouts

## Files Modified

1. **Backend:**

   - `/backend/src/main/java/com/reallink/pump/exception/GlobalExceptionHandler.java`
     - Added imports for authorization exceptions
     - Added `handleAuthorizationDeniedException` method
     - Added `handleAccessDeniedException` method

2. **Frontend:**
   - `/frontend/src/services/api.ts`
     - Enhanced response interceptor with 403 handling
     - Added token refresh logic for authorization errors
     - Improved logout triggering on authentication failures

## Additional Improvements

- Better error logging on both frontend and backend
- Consistent error messages for users
- Proper distinction between authentication and authorization failures
- Prevents unnecessary logouts for permission-based errors
- Maintains user session when possible through token refresh
