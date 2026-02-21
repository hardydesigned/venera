package com.hardytec.venera.auth.configuration;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieService {

    public static final String ACCESS_TOKEN_COOKIE = "VENERA_ACCESS_TOKEN";
    public static final String REFRESH_TOKEN_COOKIE = "VENERA_REFRESH_TOKEN";

    private static final int ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
    private static final int REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

    public void addAccessTokenCookie(HttpServletRequest request, HttpServletResponse response, String token) {
        response.addCookie(buildCookie(request, ACCESS_TOKEN_COOKIE, token, ACCESS_TOKEN_MAX_AGE_SECONDS));
    }

    public void addRefreshTokenCookie(HttpServletRequest request, HttpServletResponse response, String token) {
        response.addCookie(buildCookie(request, REFRESH_TOKEN_COOKIE, token, REFRESH_TOKEN_MAX_AGE_SECONDS));
    }

    public void clearAuthCookies(HttpServletRequest request, HttpServletResponse response) {
        response.addCookie(buildCookie(request, ACCESS_TOKEN_COOKIE, "", 0));
        response.addCookie(buildCookie(request, REFRESH_TOKEN_COOKIE, "", 0));
    }

    public Optional<String> readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private Cookie buildCookie(HttpServletRequest request, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(isSecureRequest(request));
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        String host = request.getServerName();
        boolean isLocalHost = "localhost".equalsIgnoreCase(host)
                || "127.0.0.1".equals(host)
                || "::1".equals(host);
        return request.isSecure() && !isLocalHost;
    }
}
