package ro.renovatorpro.application.port.in;

public interface RequestPasswordResetUseCase {

    /**
     * Răspunde mereu în același fel (fără să confirme dacă emailul există în sistem) — dacă un cont e
     * găsit, tokenul de resetare pleacă pe email; altfel nu se întâmplă nimic vizibil pentru apelant.
     */
    void execute(String email);
}
