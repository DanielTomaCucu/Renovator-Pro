package ro.renovatorpro.adapter.in.web.dto;

/** Refresh token-ul NU apare aici — pleacă exclusiv ca cookie httpOnly (setat de AuthController). */
public record AuthResponse(String accessToken, UserResponse user, ProjectResponse project, String role) {
}
