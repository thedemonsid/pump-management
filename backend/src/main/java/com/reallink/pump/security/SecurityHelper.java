package com.reallink.pump.security;

import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.reallink.pump.config.PumpSecurityContextHolder;
import com.reallink.pump.entities.User;
import com.reallink.pump.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Security utility for checking user permissions and access control. Implements
 * role-based security where: - ADMIN: Can access all data - MANAGER: Can access
 * all shifts and salesmen data - SALESMAN: Can only access their own shift data
 */
@Component
@RequiredArgsConstructor
public class SecurityHelper {

    private final UserRepository userRepository;

    /**
     * Get the currently authenticated user.
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("No authenticated user found");
        }

        String username = authentication.getName();
        UUID pumpMasterId = getCurrentPumpMasterId();
        return userRepository.findByUsernameAndPumpMaster_Id(username, pumpMasterId)
                .orElseThrow(() -> new AccessDeniedException("User not found: " + username));
    }

    /**
     * Get the current user's ID.
     */
    public UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Get the current pump master ID from security context.
     */
    public UUID getCurrentPumpMasterId() {
        UUID pumpMasterId = PumpSecurityContextHolder.getPumpMasterId();
        if (pumpMasterId == null) {
            throw new IllegalStateException("Pump master ID not found in security context");
        }
        return pumpMasterId;
    }

    /**
     * Check if current user is ADMIN.
     */
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Check if current user is MANAGER.
     */
    public boolean isManager() {
        return hasRole("MANAGER");
    }

    /**
     * Check if current user is ADMIN or MANAGER.
     */
    public boolean isAdminOrManager() {
        return isAdmin() || isManager();
    }

    /**
     * Check if current user is SALESMAN.
     */
    public boolean isSalesman() {
        return hasRole("SALESMAN");
    }

    /**
     * Check if current user has a specific role.
     */
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role));
    }

    /**
     * Check if current user can access data for a specific salesman. - ADMIN
     * and MANAGER can access any salesman's data - SALESMAN can only access
     * their own data
     */
    public boolean canAccessSalesmanData(UUID salesmanId) {
        if (isAdmin() || isManager()) {
            return true;
        }

        if (isSalesman()) {
            return getCurrentUserId().equals(salesmanId);
        }

        return false;
    }

    /**
     * Verify that current user can access data for a specific salesman. Throws
     * AccessDeniedException if not allowed.
     */
    public void verifyAccessToSalesmanData(UUID salesmanId) {
        if (!canAccessSalesmanData(salesmanId)) {
            throw new AccessDeniedException("You do not have permission to access this salesman's data");
        }
    }

    /**
     * Check if current user can modify shift data. - ADMIN: Can modify any
     * shift - MANAGER: Can modify any shift - SALESMAN: Can only modify their
     * own open shifts
     */
    public boolean canModifyShift(UUID salesmanId, boolean isShiftOpen) {
        if (isAdmin() || isManager()) {
            return true;
        }

        if (isSalesman() && isShiftOpen) {
            return getCurrentUserId().equals(salesmanId);
        }

        return false;
    }

    /**
     * Verify that current user can modify a shift.
     */
    public void verifyCanModifyShift(UUID salesmanId, boolean isShiftOpen) {
        if (!canModifyShift(salesmanId, isShiftOpen)) {
            throw new AccessDeniedException("You do not have permission to modify this shift");
        }
    }

    /**
     * Get authenticated username.
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "system";
    }
}
