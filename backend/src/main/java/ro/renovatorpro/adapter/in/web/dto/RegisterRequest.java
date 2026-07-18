package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Exact unul din {@code projectName}/{@code inviteCode} — validat în {@code RegisterUserService}
 * (regulă de business încrucișată, nu de shape, deci nu e adnotare Bean Validation aici).
 */
public record RegisterRequest(
        @NotBlank(message = "Numele de utilizator este obligatoriu")
        @Size(min = 3, max = 40, message = "Numele de utilizator trebuie să aibă între 3 și 40 de caractere")
        @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Numele de utilizator poate conține doar litere, cifre, punct, underscore și cratimă")
        String username,

        // SEC-4 (docs/tickete-audit-calcule-securitate.md): BCrypt procesează doar primii 72 de bytes —
        // peste limită, versiuni noi de Spring Security aruncă excepție (500 derutant), altele trunchiază
        // silențios. Limităm explicit la 72 caractere (ASCII 1:1 cu bytes) ca userul să primească un
        // mesaj clar, nu un comportament ambiguu.
        @NotBlank(message = "Parola este obligatorie")
        @Size(min = 8, max = 72, message = "Parola trebuie să aibă între 8 și 72 de caractere")
        String password,

        @Size(max = 200, message = "Numele proiectului e prea lung")
        String projectName,

        @Size(max = 20, message = "Cod de invitație invalid")
        String inviteCode
) {
}
