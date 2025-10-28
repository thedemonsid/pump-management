# JWT Refresh Token Implementation

## Overview

This document describes the JWT refresh token implementation for the Pump Management System.

## Features

- **Access Token**: Short-lived token (20 minutes) for API authentication
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens
- **Automatic Token Rotation**: New refresh token issued with each refresh request
- **Security**: Refresh tokens cannot be used for regular API authentication

## Configuration

### Application Properties

```properties
# JWT Configuration
jwt.secret=UGlzc2luZyBpcyBub3QgdGhlIHNvbHV0aW9uIHRvIHNlY3VyaXR5IHByb2JsZW1z
jwt.expiration=1200000          # 20 minutes for access token
jwt.refreshExpiration=604800000  # 7 days for refresh token
```

## API Endpoints

### 1. Login

**Endpoint**: `POST /api/v1/users/login`

**Request Body**:

```json
{
  "username": "admin",
  "password": "password123",
  "pumpCode": "PUMP001"
}
```

**Response**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "username": "admin",
  "pumpMasterId": "123e4567-e89b-12d3-a456-426614174000",
  "role": "ADMIN",
  "mobileNumber": "+919876543210",
  "enabled": true
}
```

### 2. Refresh Token

**Endpoint**: `POST /api/v1/users/refresh`

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: Same as login response with new access token and refresh token

**Error Responses**:

- `INVALID_TOKEN`: Token is malformed or not a refresh token
- `EXPIRED_TOKEN`: Refresh token has expired
- `USER_NOT_FOUND`: User associated with token not found
- `USER_DISABLED`: User account has been disabled

## Token Structure

### Access Token Claims

```json
{
  "userId": "uuid",
  "username": "string",
  "pumpMasterId": "uuid",
  "role": "string",
  "mobileNumber": "string",
  "pumpName": "string",
  "pumpId": "number",
  "pumpCode": "string",
  "tokenType": "access",
  "sub": "username@pumpMasterId",
  "iat": "timestamp",
  "exp": "timestamp"
}
```

### Refresh Token Claims (Minimal)

```json
{
  "userId": "uuid",
  "username": "string",
  "pumpMasterId": "uuid",
  "tokenType": "refresh",
  "sub": "username@pumpMasterId",
  "iat": "timestamp",
  "exp": "timestamp"
}
```

## Security Features

### 1. Token Type Validation

- Access tokens have `tokenType: "access"`
- Refresh tokens have `tokenType: "refresh"`
- Refresh tokens are rejected in `JwtAuthenticationFilter`

### 2. Token Rotation

- Each refresh request generates both a new access token AND a new refresh token
- Old refresh tokens become invalid after use (implement token blacklist if needed)

### 3. User Validation

- User existence is verified on each refresh
- User enabled status is checked
- Fresh user data is fetched from database

### 4. Endpoint Security

- Refresh endpoint is publicly accessible (no authentication required)
- All other endpoints require valid access token

## Frontend Integration Example

```javascript
// Store tokens after login
const loginResponse = await fetch("/api/v1/users/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password, pumpCode }),
});

const { token, refreshToken } = await loginResponse.json();
localStorage.setItem("accessToken", token);
localStorage.setItem("refreshToken", refreshToken);

// API call with automatic token refresh
async function apiCall(url, options = {}) {
  let token = localStorage.getItem("accessToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // If token expired, refresh and retry
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    const refreshResponse = await fetch("/api/v1/users/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshResponse.ok) {
      const { token: newToken, refreshToken: newRefreshToken } =
        await refreshResponse.json();
      localStorage.setItem("accessToken", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Retry original request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } else {
      // Refresh token expired, redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  }

  return response;
}
```

## Best Practices

### 1. Token Storage

- **Frontend**: Store access token in memory or sessionStorage
- **Frontend**: Store refresh token in httpOnly cookie (more secure) or localStorage
- **Never**: Store tokens in regular cookies without httpOnly flag

### 2. Token Expiration

- Access token: 15-30 minutes (currently 20 minutes)
- Refresh token: 7-30 days (currently 7 days)
- Adjust based on security requirements

### 3. Token Revocation (Future Enhancement)

Consider implementing:

- Token blacklist in Redis
- User session tracking
- Logout endpoint to invalidate tokens
- Admin endpoint to revoke user tokens

### 4. Security Enhancements

- [ ] Implement token blacklist for revoked tokens
- [ ] Add device fingerprinting
- [ ] Implement refresh token rotation with grace period
- [ ] Add rate limiting on refresh endpoint
- [ ] Log refresh token usage for audit

## Migration Guide

### For Existing Clients

1. Update login response handling to store both tokens
2. Implement token refresh logic before access token expires
3. Handle refresh token expiration (redirect to login)

### Database Changes

No database changes required - tokens are stateless JWT

## Testing

### Test Scenarios

1. ✅ Login returns both access and refresh tokens
2. ✅ Access token works for authenticated endpoints
3. ✅ Refresh token cannot be used for regular API calls
4. ✅ Refresh endpoint returns new tokens
5. ✅ Expired refresh token returns error
6. ✅ Invalid refresh token returns error
7. ✅ Disabled user cannot refresh token
8. ✅ Deleted user cannot refresh token

### Manual Testing

```bash
# Login
curl -X POST http://localhost:9090/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123",
    "pumpCode": "PUMP001"
  }'

# Refresh Token
curl -X POST http://localhost:9090/api/v1/users/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'

# Try using refresh token for API call (should fail)
curl -X GET http://localhost:9090/api/v1/users/me \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN_HERE"
```

## Files Modified

1. `JwtConfig.java` - Added refresh token expiration configuration
2. `JwtUtil.java` - Added refresh token generation and validation
3. `LoginResponse.java` - Added refreshToken field
4. `UserService.java` - Added refreshToken() method
5. `UserController.java` - Added /refresh endpoint
6. `RefreshTokenRequest.java` - New DTO for refresh requests
7. `SecurityConfig.java` - Allowed public access to /refresh endpoint
8. `JwtAuthenticationFilter.java` - Reject refresh tokens for authentication
9. `application.properties` - Added jwt.refreshExpiration property

## Support

For issues or questions, contact the development team.
