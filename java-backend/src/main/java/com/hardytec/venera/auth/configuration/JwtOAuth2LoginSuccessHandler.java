package com.hardytec.venera.auth.configuration;

import com.hardytec.venera.auth.domain.UserAccount;
import com.hardytec.venera.auth.adapters.persistence.UserRepository;
import com.hardytec.venera.auth.application.JwtService;
import com.hardytec.venera.auth.application.RefreshTokenService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class JwtOAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String redirectUrl;
    private final AuthCookieService authCookieService;

    public JwtOAuth2LoginSuccessHandler(
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            UserRepository userRepository,
            @Lazy PasswordEncoder passwordEncoder,
            AuthCookieService authCookieService,
            @Value("${hardytec.auth.oauth2.redirect-url}") String redirectUrl) {
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authCookieService = authCookieService;
        this.redirectUrl = redirectUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unsupported authentication type");
            return;
        }

        OAuth2User oauthUser = oauthToken.getPrincipal();
        String email = oauthUser.getAttribute("email");
        if (!StringUtils.hasText(email)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Google account has no email");
            return;
        }

        UserAccount user = ensureUser(email, oauthUser.getAttributes());
        String jwt = jwtService.generateToken(user.getEmail());
        String refreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();
        authCookieService.addAccessTokenCookie(request, response, jwt);
        authCookieService.addRefreshTokenCookie(request, response, refreshToken);

        String target = UriComponentsBuilder.fromUriString(redirectUrl)
                .fragment(buildFragment(buildUserInfoFragment(user)))
                .build(true)
                .toUriString();
        response.sendRedirect(target);
    }

    private UserAccount ensureUser(String email, Map<String, Object> attributes) {
        return userRepository.findByEmail(email)
                .map(existing -> updateExistingUser(existing, attributes))
                .orElseGet(() -> createUser(email, attributes));
    }

    private UserAccount updateExistingUser(UserAccount user, Map<String, Object> attributes) {
        boolean dirty = false;
        if (!user.isActive()) {
            user.setActive(true);
            dirty = true;
        }
        String givenName = attributeAsString(attributes, "given_name");
        if (StringUtils.hasText(givenName) && !givenName.equals(user.getFirstName())) {
            user.setFirstName(givenName);
            dirty = true;
        }
        String familyName = attributeAsString(attributes, "family_name");
        if (StringUtils.hasText(familyName) && !familyName.equals(user.getLastName())) {
            user.setLastName(familyName);
            dirty = true;
        }
        return dirty ? userRepository.save(user) : user;
    }

    private UserAccount createUser(String email, Map<String, Object> attributes) {
        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setFirstName(defaultString(attributeAsString(attributes, "given_name"), "Google"));
        user.setLastName(defaultString(attributeAsString(attributes, "family_name"), "User"));
        user.setActive(true);
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        return userRepository.save(user);
    }

    private String buildFragment(String userInfo) {
        return "user=" + userInfo;
    }

    private String buildUserInfoFragment(UserAccount user) {
        String json = """
                {"id":"%s","email":"%s","firstName":"%s","lastName":"%s","active":%s,"onboardingCompleted":%s}
                """.formatted(
                user.getId(),
                user.getEmail(),
                defaultString(user.getFirstName(), ""),
                defaultString(user.getLastName(), ""),
                user.isActive(),
                user.getOnboardingCompleted()
                );
        return URLEncoder.encode(json, StandardCharsets.UTF_8);
    }

    private String attributeAsString(Map<String, Object> attributes, String key) {
        Object value = attributes.get(key);
        return value != null ? value.toString() : null;
    }

    private String defaultString(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }
}
