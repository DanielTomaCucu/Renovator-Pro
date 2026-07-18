package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Oglindă a `Omit<Item, "id">`.
 *
 * <p><b>SEC-2 (docs/tickete-audit-calcule-securitate.md):</b> vezi {@link ItemUrlValidation}.
 */
public record ItemCreateRequest(
        @NotBlank(message = "roomId este obligatoriu") String roomId,
        @NotBlank(message = "Numele elementului este obligatoriu") String name,
        @NotBlank(message = "Tipul de material este obligatoriu") String materialType,
        String source,
        @NotBlank(message = "Statusul este obligatoriu") String status,
        @NotNull @DecimalMin(value = "0", message = "Cantitatea nu poate fi negativă") BigDecimal quantity,
        @NotNull @DecimalMin(value = "0.00", message = "Prețul unitar nu poate fi negativ") BigDecimal unitPrice,
        @Size(max = 2000, message = "Link-ul produsului e prea lung")
        @Pattern(regexp = ItemUrlValidation.PRODUCT_URL_PATTERN, message = "Link-ul produsului trebuie să înceapă cu http:// sau https://")
        String productUrl,
        @Size(max = ItemUrlValidation.MAX_IMAGE_URL_LENGTH, message = "Imaginea e prea mare")
        @Pattern(regexp = ItemUrlValidation.IMAGE_URL_PATTERN, message = "Imaginea trebuie să fie un link http(s) sau o poză validă")
        String imageUrl,
        @NotBlank(message = "Proveniența este obligatorie") String origin
) {
}
