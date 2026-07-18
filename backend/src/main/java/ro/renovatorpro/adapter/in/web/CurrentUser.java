package ro.renovatorpro.adapter.in.web;

import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Userul autentificat curent (Faza 5) — succesorul lui {@code WebConstants.STUB_USER_ID}, șters odată
 * ce autorizarea reală există. {@code JwtAuthenticationFilter} pune userId-ul ca principal name în
 * {@code SecurityContext}; toate controllerele îl citesc de aici, niciodată dintr-un ID fix.
 */
final class CurrentUser {

    private CurrentUser() {
    }

    static String id() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
