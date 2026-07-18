package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Numele de utilizator este obligatoriu") String username,
        // SEC-4 (docs/tickete-audit-calcule-securitate.md): BCrypt.matches() poate arunca excepție pt.
        // parole peste 72 de caractere (limita internă a algoritmului) — validăm aici ca să răspundem
        // cu 400 controlat, nu cu un 500 brut din encoder.
        @NotBlank(message = "Parola este obligatorie")
        @Size(max = 72, message = "Parola trebuie să aibă cel mult 72 de caractere")
        String password
) {
}
