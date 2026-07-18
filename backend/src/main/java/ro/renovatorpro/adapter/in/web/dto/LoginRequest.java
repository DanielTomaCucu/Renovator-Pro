package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Numele de utilizator este obligatoriu") String username,
        @NotBlank(message = "Parola este obligatorie") String password
) {
}
