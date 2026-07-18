package ro.renovatorpro.application.port.out;

/** BCrypt (strength ≥ 12) — implementarea concretă trăiește în adapter/out/security, application nu știe ce algoritm e. */
public interface PasswordHasher {

    String hash(String rawPassword);

    boolean matches(String rawPassword, String hash);
}
