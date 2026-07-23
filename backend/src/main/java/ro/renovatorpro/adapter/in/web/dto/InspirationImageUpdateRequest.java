package ro.renovatorpro.adapter.in.web.dto;

import org.openapitools.jackson.nullable.JsonNullable;

/**
 * Oglindă a {@code Partial<InspirationImage>}, semantica „absent vs. null explicit" (ca la
 * {@code OfferUpdateRequest}). {@code roomId}: {@code of(null)} = mută poza la „General".
 */
public record InspirationImageUpdateRequest(
        JsonNullable<String> roomId,
        JsonNullable<String> type,
        JsonNullable<String> image,
        JsonNullable<String> caption,
        JsonNullable<String> sourceUrl
) {
}
