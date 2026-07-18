package ro.renovatorpro.adapter.in.web.dto;

public record CurrentUserResponse(UserResponse user, ProjectResponse project, String role) {
}
