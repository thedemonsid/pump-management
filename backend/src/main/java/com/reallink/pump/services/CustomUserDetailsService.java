package com.reallink.pump.services;

import java.util.Collections;
import java.util.UUID;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.reallink.pump.config.PumpSecurityContextHolder;
import com.reallink.pump.entities.User;
import com.reallink.pump.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UUID pumpMasterId = PumpSecurityContextHolder.getPumpMasterId();
        if (pumpMasterId == null) {
            throw new UsernameNotFoundException("Pump master ID not found in context");
        }

        User user = userRepository.findByUsernameAndPumpMaster_Id(username, pumpMasterId).orElse(null);

        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username + " and pump master ID: " + pumpMasterId);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleName())))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.getEnabled())
                .build();
    }

    public UserDetails loadUserByUsernameAndPumpMasterId(String username, UUID pumpMasterId) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameAndPumpMaster_Id(username, pumpMasterId).orElse(null);

        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username + " and pump master ID: " + pumpMasterId);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleName())))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.getEnabled())
                .build();
    }
}
