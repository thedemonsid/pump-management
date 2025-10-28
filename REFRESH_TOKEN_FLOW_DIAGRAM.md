# JWT Refresh Token Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                                       │
└─────────────────────────────────────────────────────────────────────────┘

  User                Frontend              Backend               LocalStorage
   │                     │                     │                       │
   │  Enter Credentials  │                     │                       │
   ├────────────────────>│                     │                       │
   │                     │  POST /login        │                       │
   │                     ├────────────────────>│                       │
   │                     │                     │                       │
   │                     │  Access Token (20m) │                       │
   │                     │  Refresh Token (7d) │                       │
   │                     │<────────────────────┤                       │
   │                     │                     │                       │
   │                     │  Store Tokens       │                       │
   │                     ├─────────────────────────────────────────────>│
   │  Redirect Dashboard │                     │                       │
   │<────────────────────┤                     │                       │
   │                     │                     │                       │


┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTOMATIC TOKEN REFRESH FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

  User                Frontend              Backend               LocalStorage
   │                     │                     │                       │
   │  Browse Reports     │                     │                       │
   ├────────────────────>│                     │                       │
   │                     │  GET /reports       │                       │
   │                     │  (expired token)    │                       │
   │                     ├────────────────────>│                       │
   │                     │                     │                       │
   │                     │  401 Unauthorized   │                       │
   │                     │<────────────────────┤                       │
   │                     │                     │                       │
   │                     │ [Interceptor Triggered]                     │
   │                     │                     │                       │
   │                     │  Get Refresh Token  │                       │
   │                     │<─────────────────────────────────────────────┤
   │                     │                     │                       │
   │                     │ POST /refresh       │                       │
   │                     │ { refreshToken }    │                       │
   │                     ├────────────────────>│                       │
   │                     │                     │                       │
   │                     │  New Access Token   │                       │
   │                     │  New Refresh Token  │                       │
   │                     │<────────────────────┤                       │
   │                     │                     │                       │
   │                     │  Update Tokens      │                       │
   │                     ├─────────────────────────────────────────────>│
   │                     │                     │                       │
   │                     │ Retry GET /reports  │                       │
   │                     │ (new token)         │                       │
   │                     ├────────────────────>│                       │
   │                     │                     │                       │
   │                     │  200 OK + Data      │                       │
   │                     │<────────────────────┤                       │
   │  Show Reports ✓     │                     │                       │
   │<────────────────────┤                     │                       │
   │                     │                     │                       │
   │ (User sees NO interruption!)              │                       │
   │                     │                     │                       │


┌─────────────────────────────────────────────────────────────────────────┐
│                   REFRESH TOKEN EXPIRED FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

  User                Frontend              Backend               LocalStorage
   │                     │                     │                       │
   │  Browse After 7 Days│                     │                       │
   ├────────────────────>│                     │                       │
   │                     │  GET /reports       │                       │
   │                     │  (expired token)    │                       │
   │                     ├────────────────────>│                       │
   │                     │                     │                       │
   │                     │  401 Unauthorized   │                       │
   │                     │<────────────────────┤                       │
   │                     │                     │                       │
   │                     │ POST /refresh       │                       │
   │                     │ (expired refresh)   │                       │
   │                     ├────────────────────>│                       │
   │                     │                     │                       │
   │                     │ 401 Token Expired   │                       │
   │                     │<────────────────────┤                       │
   │                     │                     │                       │
   │                     │  Clear All Tokens   │                       │
   │                     ├─────────────────────────────────────────────>│
   │                     │                     │                       │
   │  Redirect to Login  │                     │                       │
   │<────────────────────┤                     │                       │
   │                     │                     │                       │
   │  "Session Expired"  │                     │                       │
   │  message shown      │                     │                       │
   │                     │                     │                       │


┌─────────────────────────────────────────────────────────────────────────┐
│                   REQUEST QUEUING (Multiple Requests)                    │
└─────────────────────────────────────────────────────────────────────────┘

  When multiple API calls happen simultaneously with expired token:

  Request 1 (GET /reports)     ─┐
  Request 2 (GET /products)     ├─> All get 401
  Request 3 (GET /tanks)        ─┘
                                 │
                                 ▼
                        First request triggers
                        refresh token flow
                                 │
                                 ▼
                     Other requests QUEUED
                     (waiting for new token)
                                 │
                                 ▼
                        Refresh successful
                        New token obtained
                                 │
                                 ▼
                    All queued requests REPLAYED
                    with new access token
                                 │
                                 ▼
                        All succeed ✓


┌─────────────────────────────────────────────────────────────────────────┐
│                         TOKEN TIMELINE                                   │
└─────────────────────────────────────────────────────────────────────────┘

Login
  │
  ├─── Access Token (20 min) ───┐
  │                              │ Auto-refresh
  │                              ▼
  │    [New Access Token (20 min)]
  │                              │ Auto-refresh
  │                              ▼
  │    [New Access Token (20 min)]
  │
  └─── Refresh Token (7 days) ──┐
                                 │ After 7 days
                                 ▼
                            Must Login Again


┌─────────────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                                     │
└─────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  Access Token (20 minutes)                                    ║
║  • Used for API authentication                                ║
║  • Contains full user data                                    ║
║  • Cannot be used if refresh token type                       ║
║  • Automatically refreshed on expiration                      ║
╚═══════════════════════════════════════════════════════════════╝
                              ▲
                              │ Refreshed by
                              │
╔═══════════════════════════════════════════════════════════════╗
║  Refresh Token (7 days)                                       ║
║  • Used ONLY for /refresh endpoint                            ║
║  • Contains minimal data (userId, username, pumpMasterId)     ║
║  • Cannot be used for regular API calls (blocked by filter)   ║
║  • Rotated on each refresh (new refresh token issued)         ║
╚═══════════════════════════════════════════════════════════════╝
```

## Key Benefits

✅ **User Experience**: No interruptions during work day
✅ **Security**: Short-lived access tokens limit attack window
✅ **Performance**: Queuing prevents duplicate refresh calls
✅ **Reliability**: Automatic retry of failed requests
✅ **Transparency**: All token management is invisible to user
