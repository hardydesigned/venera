package com.hardytec.venera.auth.adapters.web;

import com.hardytec.venera.auth.domain.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.UUID;

/**
 * Ermittelt die ID des aktuell eingeloggten Nutzers aus dem Spring-Security-Kontext.
 */
@Component
public class CurrentUserResolver {

    /**
     * Liefert die User-ID des eingeloggten Nutzers.
     * @return User-ID
     * @throws IllegalStateException wenn kein Nutzer authentifiziert ist oder der Principal kein UserPrincipal ist
     */
    public UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return principal.getUser().getId();
    }
}
