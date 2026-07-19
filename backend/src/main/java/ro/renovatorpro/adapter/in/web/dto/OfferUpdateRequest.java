package ro.renovatorpro.adapter.in.web.dto;

import org.openapitools.jackson.nullable.JsonNullable;

import java.math.BigDecimal;
import java.util.List;

/**
 * Oglindă a {@code Partial<Offer>}, cu semantica „absent vs. null explicit" (ca la {@code RoomUpdateRequest})
 * pe FIECARE câmp — toate sunt opționale prin design, deci userul trebuie să poată GOLI oricare din ele
 * explicit (ex. șterge prețul introdus greșit), nu doar „nu se modifică".
 */
public record OfferUpdateRequest(
        JsonNullable<String> name,
        JsonNullable<String> store,
        JsonNullable<BigDecimal> unitPrice,
        JsonNullable<BigDecimal> quantity,
        JsonNullable<String> productUrl,
        JsonNullable<List<String>> images,
        JsonNullable<String> notes
) {
}
