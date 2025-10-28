package com.reallink.pump.config;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final JwtConfig jwtConfig;

    public JwtUtil(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtConfig.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UUID userId, String username, UUID pumpMasterId, String role, String mobileNumber,
            String pumpName, Integer pumpId, String pumpCode) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId.toString());
        claims.put("username", username);
        claims.put("pumpMasterId", pumpMasterId.toString());
        claims.put("role", role);
        claims.put("mobileNumber", mobileNumber);
        claims.put("pumpName", pumpName);
        claims.put("pumpId", pumpId);
        claims.put("pumpCode", pumpCode);
        claims.put("tokenType", "access");

        return createToken(claims, username + "@" + pumpMasterId.toString(), jwtConfig.getExpiration());
    }

    public String generateRefreshToken(UUID userId, String username, UUID pumpMasterId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId.toString());
        claims.put("username", username);
        claims.put("pumpMasterId", pumpMasterId.toString());
        claims.put("tokenType", "refresh");

        return createToken(claims, username + "@" + pumpMasterId.toString(), jwtConfig.getRefreshExpiration());
    }

    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isRefreshToken(String token) {
        String tokenType = extractClaim(token, claims -> claims.get("tokenType", String.class));
        return "refresh".equals(tokenType);
    }

    public boolean isTokenValid(String token, String username) {
        final String tokenUsername = extractUsername(token);
        return (username.equals(tokenUsername) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject).split("@")[0];
    }

    public UUID extractPumpMasterIdFromSubject(String token) {
        String subject = extractClaim(token, Claims::getSubject);
        String[] parts = subject.split("@");
        if (parts.length == 2) {
            return UUID.fromString(parts[1]);
        }
        return null;
    }

    public UUID extractUserId(String token) {
        String userIdStr = extractClaim(token, claims -> claims.get("userId", String.class));
        return UUID.fromString(userIdStr);
    }

    public UUID extractPumpMasterId(String token) {
        String pumpMasterIdStr = extractClaim(token, claims -> claims.get("pumpMasterId", String.class));
        return UUID.fromString(pumpMasterIdStr);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public String extractMobileNumber(String token) {
        return extractClaim(token, claims -> claims.get("mobileNumber", String.class));
    }

    public String extractPumpName(String token) {
        return extractClaim(token, claims -> claims.get("pumpName", String.class));
    }

    public Integer extractPumpId(String token) {
        return extractClaim(token, claims -> claims.get("pumpId", Integer.class));
    }

    public String extractPumpCode(String token) {
        return extractClaim(token, claims -> claims.get("pumpCode", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
