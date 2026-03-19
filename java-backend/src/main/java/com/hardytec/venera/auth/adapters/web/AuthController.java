package com.hardytec.venera.auth.adapters.web;

import com.hardytec.venera.auth.adapters.web.dto.*;
import com.hardytec.venera.auth.configuration.AuthCookieService;
import com.hardytec.venera.auth.application.JwtService;
import com.hardytec.venera.auth.application.UserService;
import com.hardytec.venera.auth.application.RefreshTokenService;
import com.hardytec.venera.auth.application.ForgotPasswordService;
import com.hardytec.venera.auth.adapters.persistence.RefreshTokenRepository;
import com.hardytec.venera.auth.adapters.persistence.ForgotPasswordRepository;
import com.hardytec.venera.auth.domain.RefreshToken;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import jakarta.validation.Valid;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
    private final AuthenticationManager authenticationManager;
    private final ForgotPasswordService forgotPasswordService;
    private final ForgotPasswordRepository forgotPasswordRepository;

    public AuthController(
            JwtService jwtService,
            UserService userService,
            RefreshTokenRepository refreshTokenRepository,
            RefreshTokenService refreshTokenService,
            AuthCookieService authCookieService,
            AuthenticationManager authenticationManager,
            ForgotPasswordService forgotPasswordService,
            ForgotPasswordRepository forgotPasswordRepository
    ) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenService = refreshTokenService;
        this.authCookieService = authCookieService;
        this.authenticationManager = authenticationManager;
        this.forgotPasswordService = forgotPasswordService;
        this.forgotPasswordRepository = forgotPasswordRepository;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(HttpServletRequest request, CsrfToken csrfToken) {
        String token = csrfToken.getToken();
        return Map.of("token", token);
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
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest,
                                               HttpServletResponse httpResponse) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String jwt = jwtService.generateToken(principal.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(principal.getUser().getId());
        authCookieService.addAccessTokenCookie(httpRequest, httpResponse, jwt);
        authCookieService.addRefreshTokenCookie(httpRequest, httpResponse, refreshToken.getToken());
        UserDto userDto = userService.getById(principal.getUser().getId().toString());
        return ResponseEntity.ok(new LoginResponse(jwt, refreshToken.getToken(), userDto));
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
    public ResponseEntity<LoginResponse> signUp(@Valid @RequestBody SignUpRequest request,
                                                HttpServletRequest httpRequest,
                                                HttpServletResponse httpResponse) {
        UserDto userDto = userService.signUp(request);
        var userAccount = userService.getEntityByEmail(request.email());
        String jwt = jwtService.generateToken(userAccount.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userAccount.getId());
        authCookieService.addAccessTokenCookie(httpRequest, httpResponse, jwt);
        authCookieService.addRefreshTokenCookie(httpRequest, httpResponse, refreshToken.getToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(new LoginResponse(jwt, refreshToken.getToken(), userDto));
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
        try {
            forgotPasswordService.sendToken(request.email());
        } catch (ResponseStatusException e) {
            // Swallow NOT_FOUND to avoid leaking whether an email exists
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @RateLimiter(name = "authRateLimit")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        var user = forgotPasswordService.validateToken(request.resetPasswordToken());
        userService.changePassword(user, request.newPassword());
        forgotPasswordRepository.findByToken(request.resetPasswordToken())
                .ifPresent(forgotPasswordRepository::delete);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<String> rateLimitingFallback(int id, RequestNotPermitted ex) {

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Retry-After", "60s"); // retry after one second

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .headers(responseHeaders) // send retry header
                .body("Too Many Requests - Retry After 1 Minute");
    }
}
