package ro.renovatorpro.adapter.in.web.dto;

import java.time.Instant;

/** Oglindă a `InspirationImage` din api-contract.md. */
public record InspirationImageResponse(
        String id,
        String projectId,
        String roomId,
        String type,
        String image,
        String caption,
        String sourceUrl,
        Instant createdAt
) {
}
