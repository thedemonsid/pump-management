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

        // Create response
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setPumpMasterId(user.getPumpMaster().getId());
        response.setRole(user.getRole().getRoleName());
        response.setMobileNumber(user.getMobileNumber());
        response.setEnabled(user.getEnabled());

        return response;
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
}
