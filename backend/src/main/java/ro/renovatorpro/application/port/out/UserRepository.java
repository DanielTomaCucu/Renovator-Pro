package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.user.User;

import java.util.Optional;

public interface UserRepository {

    Optional<User> findById(String id);

    /** Comparație case-insensitive (username-urile se normalizează la lowercase la scriere). */
    Optional<User> findByUsername(String username);

    /** Emailul se normalizează la lowercase la scriere (ca username-ul) — comparația e deci case-sensitive pe valoarea deja normalizată. */
    Optional<User> findByEmail(String email);

    User insert(User user);

    /** Resetare parolă (V10): singurul câmp mutabil al userului. */
    void updatePasswordHash(String userId, String newPasswordHash);
}
