package ro.renovatorpro.domain.model.user;

import java.util.Objects;

/** Apartenența unui utilizator la un proiect, cu rolul asociat (autorizare „pe drepturi", Faza 5). */
public record ProjectMember(String projectId, String userId, ProjectRole role) {

    public ProjectMember {
        Objects.requireNonNull(projectId, "projectId");
        Objects.requireNonNull(userId, "userId");
        Objects.requireNonNull(role, "role");
    }
}
