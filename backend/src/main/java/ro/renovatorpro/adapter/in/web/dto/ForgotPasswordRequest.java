package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email-ul este obligatoriu")
        @Email(message = "Adresa de email nu este validă")
        String email
) {
}
