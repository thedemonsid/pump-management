package com.reallink.pump.controllers;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.reallink.pump.config.JwtUtil;
import com.reallink.pump.dto.request.CreateUserRequest;
import com.reallink.pump.dto.request.LoginRequest;
import com.reallink.pump.dto.request.RefreshTokenRequest;
import com.reallink.pump.dto.request.UpdateUserRequest;
import com.reallink.pump.dto.response.LoginResponse;
import com.reallink.pump.dto.response.TokenUserInfoResponse;
import com.reallink.pump.dto.response.UserResponse;
import com.reallink.pump.services.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing user information")
public class UserController {

    private final UserService service;
    private final JwtUtil jwtUtil;

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve all users (no pagination)")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/pump/{pumpMasterId}")
    @Operation(summary = "Get users by pump master ID")
    public ResponseEntity<List<UserResponse>> getUsersByPumpMasterId(@PathVariable UUID pumpMasterId) {
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users")
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String mobileNumber,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) UUID pumpMasterId) {
        List<UserResponse> list = service.searchUsers(username, mobileNumber, role, enabled, pumpMasterId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @Operation(summary = "Create user")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user")
    public ResponseEntity<UserResponse> updateUser(@PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token with user information")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(service.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Generate new access token and refresh token using a valid refresh token")
    public ResponseEntity<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(service.refreshToken(request.getRefreshToken()));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password for authenticated ADMIN user only")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {

        // Extract token from Authorization header (Bearer <token>)
        String token = authorizationHeader.replace("Bearer ", "");

        // Extract userId from token (this is the authenticated user)
        UUID userId = jwtUtil.extractUserId(token);

        // This will verify the user is ADMIN, verify old password, and change their password
        service.changePasswordAdminOnly(userId, oldPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully. Please login again with your new password."));
    }

    @PostMapping("/register/super/{secretKey}")
    @Operation(summary = "Create Super Admin")
    public ResponseEntity<UserResponse> createSuperAdmin(@PathVariable String secretKey,
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createSuperAdmin(request, secretKey));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user info from JWT token", description = "Extract and return user information from the JWT token")
    public ResponseEntity<TokenUserInfoResponse> getCurrentUserInfo(
            @RequestHeader("Authorization") String authorizationHeader) {

        // Extract token from Authorization header (Bearer <token>)
        String token = authorizationHeader.replace("Bearer ", "");

        // Extract user information from token
        TokenUserInfoResponse userInfo = TokenUserInfoResponse.builder()
                .userId(jwtUtil.extractUserId(token))
                .username(jwtUtil.extractUsername(token))
                .pumpMasterId(jwtUtil.extractPumpMasterId(token))
                .role(jwtUtil.extractRole(token))
                .mobileNumber(jwtUtil.extractMobileNumber(token))
                .pumpName(jwtUtil.extractPumpName(token))
                .pumpId(jwtUtil.extractPumpId(token))
                .pumpCode(jwtUtil.extractPumpCode(token))
                .build();

        return ResponseEntity.ok(userInfo);
    }
}
