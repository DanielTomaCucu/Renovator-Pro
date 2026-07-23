package ro.renovatorpro.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * O poză din Galeria de Inspirație a proiectului (CLAUDE.md backlog #4): poză proprie, randare, sau
 * inspirație preluată online, opțional legată de o cameră. {@code image} — URL http(s) sau
 * {@code data:image/...;base64,...} (aceeași convenție ca {@link Item#imageUrl()}/{@link Offer#images()}).
 *
 * <p>{@code roomId} rămâne {@code null} după ștergerea camerei ei (vezi V9 — {@code ON DELETE SET NULL}) —
 * pozele sunt conținut al userului, nu se pierd odată cu reconfigurarea apartamentului.
 */
public record InspirationImage(
        String id,
        String projectId,
        String roomId,
        InspirationType type,
        String image,
        String caption,
        String sourceUrl,
        Instant createdAt
) {

    public InspirationImage {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(projectId, "projectId");
        Objects.requireNonNull(type, "type");
        Objects.requireNonNull(image, "image");
        Objects.requireNonNull(createdAt, "createdAt");
    }
}
