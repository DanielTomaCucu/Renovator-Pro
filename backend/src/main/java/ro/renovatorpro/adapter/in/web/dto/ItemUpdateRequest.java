package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Oglindă a `Partial<Item>` — câmp {@code null} = nu se modifică. {@code origin} lipsește intenționat (vezi UpdateItemUseCase).
 *
 * <p><b>SEC-2 (docs/tickete-audit-calcule-securitate.md):</b> {@code productUrl}/{@code imageUrl} fără
 * validare permiteau URL-uri {@code javascript:} (randate direct în {@code href} pe frontend — stored
 * XSS) și imagini base64 nelimitate (bloat DB). Ambele acceptate doar http(s) sau {@code data:image/...}
 * (imageUrl), cu plafon de lungime.
 */
public record ItemUpdateRequest(
        String name,
        String materialType,
        String source,
        String status,
        @DecimalMin(value = "0", message = "Cantitatea nu poate fi negativă") BigDecimal quantity,
        @DecimalMin(value = "0.00", message = "Prețul unitar nu poate fi negativ") BigDecimal unitPrice,
        @Size(max = 2000, message = "Link-ul produsului e prea lung")
        @Pattern(regexp = ItemUrlValidation.PRODUCT_URL_PATTERN, message = "Link-ul produsului trebuie să înceapă cu http:// sau https://")
        String productUrl,
        @Size(max = ItemUrlValidation.MAX_IMAGE_URL_LENGTH, message = "Imaginea e prea mare")
        @Pattern(regexp = ItemUrlValidation.IMAGE_URL_PATTERN, message = "Imaginea trebuie să fie un link http(s) sau o poză validă")
        String imageUrl
) {
}
