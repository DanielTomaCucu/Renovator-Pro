package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JoinProjectRequest(
        @NotBlank(message = "Codul de invitație este obligatoriu")
        @Size(max = 20, message = "Cod de invitație invalid")
        String inviteCode
) {
}
