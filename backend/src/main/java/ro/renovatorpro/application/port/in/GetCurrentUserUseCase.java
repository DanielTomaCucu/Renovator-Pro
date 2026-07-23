package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.model.user.User;

public interface GetCurrentUserUseCase {

    /**
     * {@code rawRefreshToken} (din cookie-ul curent, poate fi {@code null}) rezolvă proiectul ACTIV al
     * sesiunii (V11, multi-proiect) — fără el (edge case, nu fluxul normal), cade pe cel mai vechi proiect
     * al userului.
     */
    Result execute(String currentUserId, String rawRefreshToken);

    record Result(User user, Project project, ProjectRole role) {
    }
}
