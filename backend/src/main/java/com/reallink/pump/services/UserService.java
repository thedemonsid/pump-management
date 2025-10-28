package com.reallink.pump.services;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.reallink.pump.config.JwtUtil;
import com.reallink.pump.dto.request.CreateUserRequest;
import com.reallink.pump.dto.request.LoginRequest;
import com.reallink.pump.dto.request.UpdateUserRequest;
import com.reallink.pump.dto.response.LoginResponse;
import com.reallink.pump.dto.response.UserResponse;
import com.reallink.pump.entities.PumpInfoMaster;
import com.reallink.pump.entities.Role;
import com.reallink.pump.entities.User;
import com.reallink.pump.exception.PumpBusinessException;
import com.reallink.pump.mapper.UserMapper;
import com.reallink.pump.repositories.PumpInfoMasterRepository;
import com.reallink.pump.repositories.RoleRepository;
import com.reallink.pump.repositories.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository repository;
    private final PumpInfoMasterRepository pumpInfoMasterRepository;
    private final RoleRepository roleRepository;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public List<UserResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    public UserResponse getById(@NotNull UUID id) {
        User user = repository.findById(id).orElse(null);
        if (user == null) {
            throw new PumpBusinessException("USER_NOT_FOUND", "User with ID " + id + " not found");
        }
        return mapper.toResponse(user);
    }

    public List<UserResponse> getByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.findByPumpMaster_Id(pumpMasterId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public UserResponse getByUsernameAndPumpMasterId(@NotNull String username, @NotNull UUID pumpMasterId) {
        User user = repository.findByUsernameAndPumpMaster_Id(username, pumpMasterId).orElse(null);
        if (user == null) {
            throw new PumpBusinessException("USER_NOT_FOUND",
                    "User with username '" + username + "' and pump master ID " + pumpMasterId + " not found");
        }
        return mapper.toResponse(user);
    }

    public List<UserResponse> searchUsers(String username, String mobileNumber, String role,
            Boolean enabled, UUID pumpMasterId) {
        return repository
                .findBySearchCriteria(username, mobileNumber, role, enabled, pumpMasterId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<UserResponse> getByUsernameContaining(@NotNull String username) {
        return repository.findByUsernameContainingIgnoreCase(username).stream()
                .map(mapper::toResponse)
                .toList();
    }
//! Roles Validation to be added 

    @Transactional
    public UserResponse create(@Valid CreateUserRequest request) {
        // Check for duplicate username
        if (repository.existsByUsernameAndPumpMaster_Id(request.getUsername(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_USER",
                    "User with username '" + request.getUsername() + "' already exists for this pump master");
        }
        // Fetch the PumpInfoMaster entity using pumpMasterId from the request
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }
        User user = mapper.toEntity(request);
        user.setPumpMaster(pumpMaster);

        // Fetch role by name
        Role role = roleRepository.findByRoleName(request.getRole()).orElse(null);
        if (role == null) {
            throw new PumpBusinessException("INVALID_ROLE", "Role '" + request.getRole() + "' does not exist");
        }
        user.setRole(role);

        // Encode the password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        User savedUser = repository.save(user);
        return mapper.toResponse(savedUser);
    }

    @Transactional
    public UserResponse update(@NotNull UUID id, @Valid UpdateUserRequest request) {
        User existingUser = repository.findById(id).orElse(null);
        if (existingUser == null) {
            throw new PumpBusinessException("USER_NOT_FOUND", "User with ID " + id + " not found");
        }

        // Check for duplicate username if username is being updated
        if (request.getUsername() != null
                && !request.getUsername().equals(existingUser.getUsername())
                && repository.existsByUsernameAndPumpMaster_IdAndIdNot(request.getUsername(),
                        existingUser.getPumpMaster().getId(), id)) {
            throw new PumpBusinessException("DUPLICATE_USER",
                    "User with username '" + request.getUsername() + "' already exists for this pump master");
        }

        mapper.updateEntityFromRequest(request, existingUser);

        // Update role if provided
        if (request.getRole() != null) {
            Role role = roleRepository.findByRoleName(request.getRole()).orElse(null);
            if (role == null) {
                throw new PumpBusinessException("INVALID_ROLE", "Role '" + request.getRole() + "' does not exist");
            }
            existingUser.setRole(role);
        }

        // Encode password if it's being updated
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updatedUser = repository.save(existingUser);
        return mapper.toResponse(updatedUser);
    }

    @Transactional
    public void delete(@NotNull UUID id) {
        if (!repository.existsById(id)) {
            throw new PumpBusinessException("USER_NOT_FOUND", "User with ID " + id + " not found");
        }
        repository.deleteById(id);
    }

    public boolean existsByUsernameAndPumpMasterId(@NotNull String username, @NotNull UUID pumpMasterId) {
        return repository.existsByUsernameAndPumpMaster_Id(username, pumpMasterId);
    }

    public long getCountByPumpMasterId(@NotNull UUID pumpMasterId) {
        return repository.countByPumpMasterId(pumpMasterId);
    }

    public LoginResponse login(@Valid LoginRequest request) {
        // Find pump by pump code
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findByPumpCode(request.getPumpCode()).orElse(null);
        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_CODE", "Invalid pump code");
        }

        // Find user by username and pump master ID
        User user = repository.findByUsernameAndPumpMaster_Id(request.getUsername(), pumpMaster.getId())
                .orElse(null);

        if (user == null) {
            throw new PumpBusinessException("INVALID_CREDENTIALS", "Invalid username or password");
        }

        // Check if user is enabled
        if (!user.getEnabled()) {
            throw new PumpBusinessException("USER_DISABLED", "User account is disabled");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new PumpBusinessException("INVALID_CREDENTIALS", "Invalid username or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getUsername(),
                user.getPumpMaster().getId(),
                user.getRole().getRoleName(),
                user.getMobileNumber(),
                user.getPumpMaster().getPumpName(),
                user.getPumpMaster().getPumpId(),
                user.getPumpMaster().getPumpCode());

        // Generate refresh token
        String refreshToken = jwtUtil.generateRefreshToken(
                user.getId(),
                user.getUsername(),
                user.getPumpMaster().getId());

        // Create response
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setRefreshToken(refreshToken);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setPumpMasterId(user.getPumpMaster().getId());
        response.setRole(user.getRole().getRoleName());
        response.setMobileNumber(user.getMobileNumber());
        response.setEnabled(user.getEnabled());

        return response;
    }

    @Transactional
    public Boolean changePasswordAdminOnly(@NotNull UUID adminUserId, @NotNull String oldPassword, @NotNull String newPassword) {
        // Verify that the user making the request is an ADMIN
        User adminUser = repository.findById(adminUserId).orElse(null);
        if (adminUser == null) {
            throw new PumpBusinessException("USER_NOT_FOUND", "User with ID " + adminUserId + " not found");
        }
        if (adminUser.getRole() == null || !adminUser.getRole().getRoleName().equals("ADMIN")) {
            throw new PumpBusinessException("UNAUTHORIZED", "Only ADMIN users can change their password");
        }

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, adminUser.getPassword())) {
            throw new PumpBusinessException("INVALID_OLD_PASSWORD", "Current password is incorrect");
        }

        // Update the admin's password
        adminUser.setPassword(passwordEncoder.encode(newPassword));
        repository.save(adminUser);
        return true;
    }

    public UserResponse createSuperAdmin(CreateUserRequest request, String secretKey) {
        // Check for duplicate username
        if (repository.existsByUsernameAndPumpMaster_Id(request.getUsername(), request.getPumpMasterId())) {
            throw new PumpBusinessException("DUPLICATE_USER",
                    "User with username '" + request.getUsername() + "' already exists for this pump master");
        }
        // Fetch the PumpInfoMaster entity using pumpMasterId from the request
        PumpInfoMaster pumpMaster = pumpInfoMasterRepository.findById(request.getPumpMasterId()).orElse(null);

        if (pumpMaster == null) {
            throw new PumpBusinessException("INVALID_PUMP_MASTER",
                    "Pump master with ID " + request.getPumpMasterId() + " does not exist");
        }
        if (secretKey.equals("secret@123")) {

            User user = mapper.toEntity(request);
            user.setPumpMaster(pumpMaster);
            // Encode the password before saving
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            // Set SUPER_ADMIN role
            Role superAdminRole = roleRepository.findByRoleName("SUPER_ADMIN").orElse(null);
            if (superAdminRole == null) {
                throw new PumpBusinessException("ROLE_NOT_FOUND", "SUPER_ADMIN role not found");
            }
            user.setRole(superAdminRole);

            User savedUser = repository.save(user);
            return mapper.toResponse(savedUser);

        } else {
            throw new PumpBusinessException("INVALID_SECRET_KEY",
                    "Secret key is invalid");
        }

    }

    public LoginResponse refreshToken(@NotNull String refreshToken) {
        try {
            // Verify this is a refresh token
            if (!jwtUtil.isRefreshToken(refreshToken)) {
                throw new PumpBusinessException("INVALID_TOKEN", "Token is not a refresh token");
            }

            // Extract user information from refresh token
            String username = jwtUtil.extractUsername(refreshToken);
            UUID userId = jwtUtil.extractUserId(refreshToken);

            // Validate token expiration
            if (jwtUtil.isTokenValid(refreshToken, username)) {
                // Fetch fresh user data from database
                User user = repository.findById(userId).orElse(null);
                if (user == null) {
                    throw new PumpBusinessException("USER_NOT_FOUND", "User not found");
                }

                // Check if user is still enabled
                if (!user.getEnabled()) {
                    throw new PumpBusinessException("USER_DISABLED", "User account is disabled");
                }

                // Generate new access token with fresh data
                String newAccessToken = jwtUtil.generateToken(
                        user.getId(),
                        user.getUsername(),
                        user.getPumpMaster().getId(),
                        user.getRole().getRoleName(),
                        user.getMobileNumber(),
                        user.getPumpMaster().getPumpName(),
                        user.getPumpMaster().getPumpId(),
                        user.getPumpMaster().getPumpCode());

                // Generate new refresh token
                String newRefreshToken = jwtUtil.generateRefreshToken(
                        user.getId(),
                        user.getUsername(),
                        user.getPumpMaster().getId());

                // Create response
                LoginResponse response = new LoginResponse();
                response.setToken(newAccessToken);
                response.setRefreshToken(newRefreshToken);
                response.setUserId(user.getId());
                response.setUsername(user.getUsername());
                response.setPumpMasterId(user.getPumpMaster().getId());
                response.setRole(user.getRole().getRoleName());
                response.setMobileNumber(user.getMobileNumber());
                response.setEnabled(user.getEnabled());

                return response;
            } else {
                throw new PumpBusinessException("EXPIRED_TOKEN", "Refresh token has expired");
            }
        } catch (PumpBusinessException e) {
            throw e;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new PumpBusinessException("EXPIRED_TOKEN", "Refresh token has expired");
        } catch (io.jsonwebtoken.JwtException e) {
            throw new PumpBusinessException("INVALID_TOKEN", "Invalid refresh token");
        } catch (Exception e) {
            throw new PumpBusinessException("INVALID_TOKEN", "Invalid refresh token: " + e.getMessage());
        }
    }
}
