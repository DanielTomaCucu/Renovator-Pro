package ro.renovatorpro.adapter.out.security;

import org.springframework.stereotype.Component;
import ro.renovatorpro.application.port.out.InviteCodeGenerator;

import java.security.SecureRandom;

/**
 * 10 caractere dintr-un alfabet de 32 de simboluri fără caractere ambigue (fără 0/O, 1/I/L) — ≈50 biți
 * de entropie, ușor de citit/dictat cu voce tare unui coleg (D6, docs/cerinte-autentificare.md).
 */
@Component
public class SecureRandomInviteCodeGenerator implements InviteCodeGenerator {

    private static final String ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int LENGTH = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public String generate() {
        StringBuilder code = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            code.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return code.toString();
    }
}
