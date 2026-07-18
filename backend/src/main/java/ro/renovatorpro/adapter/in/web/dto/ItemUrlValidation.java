package ro.renovatorpro.adapter.in.web.dto;

/**
 * Constante de validare partajate între {@link ItemCreateRequest} și {@link ItemUpdateRequest} pt.
 * {@code productUrl}/{@code imageUrl} (SEC-2, docs/tickete-audit-calcule-securitate.md).
 *
 * <p>Fără validare, un {@code productUrl} de tip {@code javascript:...} ajungea randat direct în
 * {@code href} pe frontend (stored XSS), iar {@code imageUrl} accepta orice string, inclusiv payload-uri
 * base64 uriașe (bloat DB). Ambele câmpuri sunt opționale — {@code @Pattern} nu se aplică pe {@code null}.
 */
public final class ItemUrlValidation {

    private ItemUrlValidation() {
    }

    /** Doar http(s) — exclude explicit {@code javascript:}, {@code data:text/html} etc. */
    public static final String PRODUCT_URL_PATTERN = "^https?://\\S+$";

    /**
     * http(s) SAU o poză {@code data:image/...;base64,...} — acceptă exact tipurile produse de feature-ul
     * „Fă o poză" din UI (JPEG/PNG/WEBP), nimic altceva encodat ca data URI.
     */
    public static final String IMAGE_URL_PATTERN =
            "^(https?://\\S+|data:image/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/]+=*)$";

    /**
     * ~700.000 caractere base64 ≈ 512 KB binar — plafon generos pt. o poză de telefon comprimată, dar
     * suficient de mic încât un singur element să nu poată umfla nerezonabil rândul din DB.
     */
    public static final int MAX_IMAGE_URL_LENGTH = 700_000;
}
