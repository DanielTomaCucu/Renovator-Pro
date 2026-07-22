package ro.renovatorpro.adapter.in.web.dto;

/** O intrare din selectorul de proiecte (`GET /api/auth/me/projects`) — proiectele unui user + rolul lui pe fiecare. */
public record MyProjectResponse(ProjectResponse project, String role) {
}
