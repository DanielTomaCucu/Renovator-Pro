package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.user.User;

import java.util.Optional;

public interface UserRepository {

    Optional<User> findById(String id);

    /** Comparație case-insensitive (username-urile se normalizează la lowercase la scriere). */
    Optional<User> findByUsername(String username);

    User insert(User user);
}
