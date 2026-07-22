package ro.renovatorpro.domain.model.user;

import java.time.Instant;
import java.util.Objects;

/**
 * Apartenența unui utilizator la un proiect, cu rolul asociat (autorizare „pe drepturi", Faza 5). Un user
 * poate avea MAI MULTE apartenențe (multi-proiect, V11) — {@code joinedAt} le ordonează determinist
 * (cea mai veche = proiectul „de-acasă", ales implicit la login).
 */
public record ProjectMember(String projectId, String userId, ProjectRole role, Instant joinedAt) {

    public ProjectMember {
        Objects.requireNonNull(projectId, "projectId");
        Objects.requireNonNull(userId, "userId");
        Objects.requireNonNull(role, "role");
        Objects.requireNonNull(joinedAt, "joinedAt");
    }
}
