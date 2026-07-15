package ro.renovatorpro.domain.model.user;

import java.time.Instant;
import java.util.Objects;

/** Utilizatorul aplicației. `passwordHash` e mereu hash BCrypt — niciodată parola în clar (Faza 5). */
public record User(String id, String email, String passwordHash, String displayName, Instant createdAt) {

    public User {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(email, "email");
        if (email.isBlank()) {
            throw new IllegalArgumentException("Email-ul nu poate fi gol");
        }
    }
}
