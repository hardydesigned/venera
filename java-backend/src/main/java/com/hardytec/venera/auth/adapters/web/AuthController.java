package com.hardytec.venera.auth.adapters.web;

import com.hardytec.venera.auth.adapters.web.dto.*;
import com.hardytec.venera.auth.configuration.AuthCookieService;
import com.hardytec.venera.auth.application.JwtService;
import com.hardytec.venera.auth.application.UserService;
import com.hardytec.venera.auth.application.RefreshTokenService;
import com.hardytec.venera.auth.adapters.persistence.RefreshTokenRepository;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import jakarta.validation.Valid;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.hardytec.venera.auth.domain.UserPrincipal;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"${hardytec.cors.allowed-origins}"})
public class AuthController {

    private final JwtService jwtService;
    private final UserService userService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final AuthCookieService authCookieService;

    public AuthController(
            JwtService jwtService,
            UserService userService,
            RefreshTokenRepository refreshTokenRepository,
            RefreshTokenService refreshTokenService,
            AuthCookieService authCookieService
    ) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenService = refreshTokenService;
        this.authCookieService = authCookieService;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return ResponseEntity.ok(userService.getById(principal.getUser().getId().toString()));
    }

    @PostMapping("/login")
    @RateLimiter(name = "authRateLimit")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "Password login disabled. Use Google OAuth2.");
    }

    @PostMapping("/ott/request")
    @RateLimiter(name = "authRateLimit")
    public ResponseEntity<Void> requestOttToken(@Valid @RequestBody OttRequest request) {
        throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "OTT login disabled. Use Google OAuth2.");
    }

    @PostMapping("/login/ott")
    @RateLimiter(name = "authRateLimit")
    public ResponseEntity<LoginResponse> loginWithOtt(@Valid @RequestBody OttLoginRequest request) {
        throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "OTT login disabled. Use Google OAuth2.");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request, HttpServletResponse response) {
        String requestToken = authCookieService.readCookie(request, AuthCookieService.REFRESH_TOKEN_COOKIE).orElse(null);
        if (requestToken != null) {
            refreshTokenRepository.findByToken(requestToken).ifPresent(refreshTokenRepository::delete);
        }
        authCookieService.clearAuthCookies(request, response);
        return ResponseEntity.ok("Logged out successfully.");
    }

    @PostMapping("/signup")
    @RateLimiter(name = "authRateLimit")
    public ResponseEntity<Void> signUp(@Valid @RequestBody SignUpRequest request) {
        throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "Signup disabled. Use Google OAuth2.");
    }

    @PostMapping("/refresh")
    @RateLimiter(name = "authRateLimit")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String requestToken = authCookieService.readCookie(request, AuthCookieService.REFRESH_TOKEN_COOKIE).orElse(null);
        if (requestToken == null || requestToken.isBlank()) {
            return ResponseEntity.badRequest().body("Refresh token is required.");
        }
        return refreshTokenRepository.findByToken(requestToken)
                .map(token -> {
                    if (refreshTokenService.isTokenExpired(token)) {
                        refreshTokenRepository.delete(token);
                        authCookieService.clearAuthCookies(request, response);
                        return ResponseEntity.badRequest().body("Refresh token expired. Please login again.");
                    }
                    String newJwt = jwtService.generateToken(token.getUser().getEmail());
                    authCookieService.addAccessTokenCookie(request, response, newJwt);
                    return ResponseEntity.ok(Map.of("ok", true));
                })
                .orElse(ResponseEntity.badRequest().body("Invalid refresh token."));
    }


    @PostMapping("/forgot-password")
    @RateLimiter(name = "authRateLimit")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "Password reset disabled. Use Google OAuth2.");
    }

    @PostMapping("/reset-password")
    @RateLimiter(name = "authRateLimit")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "Password reset disabled. Use Google OAuth2.");
    }

    public ResponseEntity<String> rateLimitingFallback(int id, RequestNotPermitted ex) {

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Retry-After", "60s"); // retry after one second

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .headers(responseHeaders) // send retry header
                .body("Too Many Requests - Retry After 1 Minute");
    }
}
