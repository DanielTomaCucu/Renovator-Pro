package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.model.user.User;

/** Rezultatul comun al oricărei operații care (re)stabilește o sesiune — register/login/refresh. */
public record AuthResult(User user, Project project, ProjectRole role, String accessToken, String refreshToken) {
}
