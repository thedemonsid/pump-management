package com.reallink.pump.config;

import java.io.IOException;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.reallink.pump.services.CustomUserDetailsService;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        // JWT Token is in the form "Bearer token". Remove Bearer word and get only the Token
        if (StringUtils.hasText(requestTokenHeader) && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                // Check if this is a refresh token - refresh tokens should not be used for authentication
                if (jwtUtil.isRefreshToken(jwtToken)) {
                    request.setAttribute("authError", "REFRESH_TOKEN_NOT_ALLOWED");
                    logger.error("Refresh token cannot be used for authentication");
                } else {
                    username = jwtUtil.extractUsername(jwtToken);
                    UUID pumpMasterId = jwtUtil.extractPumpMasterIdFromSubject(jwtToken);
                    request.setAttribute("pumpMasterId", pumpMasterId);
                    PumpSecurityContextHolder.setPumpMasterId(pumpMasterId);
                }
            } catch (ExpiredJwtException e) {
                request.setAttribute("authError", "EXPIRED_TOKEN");
                logger.error("JWT Token has expired");
            } catch (Exception e) {
                request.setAttribute("authError", "INVALID_TOKEN");
                logger.error("Unable to get JWT Token");
            }
        } else {
            request.setAttribute("authError", "MISSING_TOKEN");
        }

        // Once we get the token validate it.
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // if token is valid configure Spring Security to manually set authentication
            if (jwtUtil.isTokenValid(jwtToken, userDetails.getUsername())) {

                // Extract pumpMasterId and store in request attribute to avoid re-parsing in controllers
                UUID pumpMasterId = jwtUtil.extractPumpMasterId(jwtToken);
                request.setAttribute("pumpMasterId", pumpMasterId);

                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken
                        = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // After setting the Authentication in the context, we specify
                // that the current user is authenticated. So it passes the Spring Security Configurations successfully.
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            } else {
                request.setAttribute("authError", "INVALID_TOKEN");
            }
        }
        filterChain.doFilter(request, response);
    }
}
