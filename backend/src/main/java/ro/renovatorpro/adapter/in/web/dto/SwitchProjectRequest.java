package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record SwitchProjectRequest(
        @NotBlank(message = "projectId este obligatoriu") String projectId
) {
}
