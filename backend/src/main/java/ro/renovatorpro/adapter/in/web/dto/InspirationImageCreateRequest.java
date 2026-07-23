package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Oglindă a {@code Omit<InspirationImage, "id" | "projectId" | "createdAt">}. {@code roomId} opțional —
 * poză „generală", neasignată unei camere. {@code image}: aceeași validare ca {@code Offer.images}
 * (URL http(s) sau {@code data:image/...;base64,...} comprimată client-side).
 */
public record InspirationImageCreateRequest(
        String roomId,
        @NotBlank(message = "Tipul este obligatoriu") String type,
        @NotBlank(message = "Imaginea este obligatorie")
        @Size(max = ItemUrlValidation.MAX_IMAGE_URL_LENGTH, message = "Imaginea e prea mare")
        @Pattern(regexp = ItemUrlValidation.IMAGE_URL_PATTERN, message = "Imaginea trebuie să fie un link http(s) sau o poză validă")
        String image,
        @Size(max = 300, message = "Notița e prea lungă") String caption,
        @Size(max = 2048, message = "Link-ul sursă e prea lung")
        @Pattern(regexp = ItemUrlValidation.PRODUCT_URL_PATTERN, message = "Link-ul sursă trebuie să înceapă cu http:// sau https://")
        String sourceUrl
) {
}
