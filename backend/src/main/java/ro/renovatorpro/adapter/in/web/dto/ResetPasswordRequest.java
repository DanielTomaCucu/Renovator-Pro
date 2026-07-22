package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Tokenul este obligatoriu") String token,

        @NotBlank(message = "Parola este obligatorie")
        @Size(min = 8, max = 72, message = "Parola trebuie să aibă între 8 și 72 de caractere")
        String newPassword
) {
}
