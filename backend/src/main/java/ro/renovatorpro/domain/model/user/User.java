package ro.renovatorpro.domain.model.user;

import java.time.Instant;
import java.util.Objects;

/**
 * Utilizatorul aplicației. `passwordHash` e mereu hash BCrypt — niciodată parola în clar (Faza 5).
 * Login-ul se face pe {@code username} (decizie D1, docs/cerinte-autentificare.md) — {@code email}
 * rămâne în schemă dar e opțional și neutilizat de fluxul curent.
 */
public record User(String id, String username, String email, String passwordHash, String displayName, Instant createdAt) {

    public User {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(username, "username");
        Objects.requireNonNull(passwordHash, "passwordHash");
        if (username.isBlank()) {
            throw new IllegalArgumentException("Numele de utilizator nu poate fi gol");
        }
    }
}
