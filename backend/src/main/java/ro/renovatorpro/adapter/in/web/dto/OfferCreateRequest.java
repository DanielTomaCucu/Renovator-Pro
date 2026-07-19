package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * Oglindă a {@code Omit<Offer, "id" | "groupId" | "createdAt">}. TOATE câmpurile opționale — o ofertă
 * goală (doar poze, sau complet goală) e un rezultat valid (fluxul „fac poze în magazin, decid acasă").
 *
 * <p>{@code images}: max 8, fiecare URL http(s) SAU poză {@code data:image/...;base64,...} — aceeași
 * convenție/validare ca {@link ItemUrlValidation} pe {@code Item.imageUrl}.
 */
public record OfferCreateRequest(
        @Size(max = 200, message = "Numele e prea lung") String name,
        @Size(max = 120, message = "Magazinul e prea lung") String store,
        @DecimalMin(value = "0.00", message = "Prețul unitar nu poate fi negativ") BigDecimal unitPrice,
        @DecimalMin(value = "0", message = "Cantitatea nu poate fi negativă") BigDecimal quantity,
        @Size(max = 2000, message = "Link-ul produsului e prea lung")
        @Pattern(regexp = ItemUrlValidation.PRODUCT_URL_PATTERN, message = "Link-ul produsului trebuie să înceapă cu http:// sau https://")
        String productUrl,
        @Size(max = 8, message = "Maxim 8 poze per ofertă")
        List<
                @Size(max = ItemUrlValidation.MAX_IMAGE_URL_LENGTH, message = "Imaginea e prea mare")
                @Pattern(regexp = ItemUrlValidation.IMAGE_URL_PATTERN, message = "Fiecare imagine trebuie să fie un link http(s) sau o poză validă")
                String
        > images,
        @Size(max = 2000, message = "Notițele sunt prea lungi") String notes
) {
}
