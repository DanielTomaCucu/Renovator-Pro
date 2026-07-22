package ro.renovatorpro.application.port.in;

public interface RequestPasswordResetUseCase {

    /**
     * @return tokenul BRUT de resetare (mod dev — expus direct API-ului, nu trimis prin email; vezi
     * {@code PasswordResetAccountNotFoundException} pt. de ce nu ascundem existența contului aici).
     */
    String execute(String email);
}
