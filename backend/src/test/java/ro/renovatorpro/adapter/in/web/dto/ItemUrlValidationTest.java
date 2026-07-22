package ro.renovatorpro.adapter.in.web.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * SEC-2 (docs/tickete-audit-calcule-securitate.md): {@code productUrl}/{@code imageUrl} fără validare
 * permiteau stored XSS ({@code javascript:...} randat direct în {@code href}) și bloat DB (base64
 * nelimitat). Testează direct constrângerile Bean Validation de pe {@link ItemCreateRequest} și
 * {@link ItemUpdateRequest} — nu era acoperit încă de niciun test (doar cazul „cantitate negativă" era
 * testat la nivel de controller, vezi ItemControllerTest).
 */
class ItemUrlValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    private static ItemCreateRequest createRequest(String productUrl, String imageUrl) {
        return new ItemCreateRequest("r1", "Gresie", "Gresie", "Dedeman", "Planificat",
                BigDecimal.TEN, BigDecimal.TEN, productUrl, imageUrl, "Manual");
    }

    @Test
    void productUrlCuJavascriptSchemeEsteRespins() {
        Set<ConstraintViolation<ItemCreateRequest>> violations =
                validator.validate(createRequest("javascript:alert(1)", null));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("productUrl"));
    }

    @Test
    void productUrlCuDataSchemeEsteRespins() {
        Set<ConstraintViolation<ItemCreateRequest>> violations =
                validator.validate(createRequest("data:text/html,<script>alert(1)</script>", null));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("productUrl"));
    }

    @Test
    void productUrlHttpSiHttpsSuntAcceptate() {
        assertThat(validator.validate(createRequest("http://dedeman.ro/produs", null))).isEmpty();
        assertThat(validator.validate(createRequest("https://dedeman.ro/produs", null))).isEmpty();
    }

    @Test
    void productUrlNullEsteAcceptatCampOptional() {
        assertThat(validator.validate(createRequest(null, null))).isEmpty();
    }

    @Test
    void productUrlPreaLungEsteRespins() {
        String tooLong = "https://example.com/" + "a".repeat(2000);
        Set<ConstraintViolation<ItemCreateRequest>> violations = validator.validate(createRequest(tooLong, null));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("productUrl"));
    }

    @Test
    void imageUrlCuJavascriptSchemeEsteRespins() {
        Set<ConstraintViolation<ItemCreateRequest>> violations =
                validator.validate(createRequest(null, "javascript:alert(1)"));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("imageUrl"));
    }

    @Test
    void imageUrlHttpEsteAcceptat() {
        assertThat(validator.validate(createRequest(null, "https://example.com/poza.jpg"))).isEmpty();
    }

    @Test
    void imageUrlDataUriJpegEsteAcceptat() {
        String dataUri = "data:image/jpeg;base64,dGVzdA==";
        assertThat(validator.validate(createRequest(null, dataUri))).isEmpty();
    }

    @Test
    void imageUrlDataUriPngSiWebpSuntAcceptate() {
        assertThat(validator.validate(createRequest(null, "data:image/png;base64,dGVzdA=="))).isEmpty();
        assertThat(validator.validate(createRequest(null, "data:image/webp;base64,dGVzdA=="))).isEmpty();
    }

    @Test
    void imageUrlDataUriCuTipNesuportatEsteRespins() {
        // svg poate conține <script> — nu e în lista albă (png/jpeg/jpg/webp)
        Set<ConstraintViolation<ItemCreateRequest>> violations =
                validator.validate(createRequest(null, "data:image/svg+xml;base64,dGVzdA=="));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("imageUrl"));
    }

    @Test
    void imageUrlPreaLungEsteRespins() {
        String tooLong = "data:image/png;base64," + "A".repeat(700_001);
        Set<ConstraintViolation<ItemCreateRequest>> violations = validator.validate(createRequest(null, tooLong));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("imageUrl"));
    }

    @Test
    void imageUrlLaLimitaMaximaEsteAcceptat() {
        // MAX_IMAGE_URL_LENGTH exact — nu trebuie respins la limită
        String prefix = "data:image/png;base64,";
        String value = prefix + "A".repeat(ItemUrlValidation.MAX_IMAGE_URL_LENGTH - prefix.length());
        assertThat(value).hasSize(ItemUrlValidation.MAX_IMAGE_URL_LENGTH);
        assertThat(validator.validate(createRequest(null, value))).isEmpty();
    }

    // --- Aceleași reguli pe ItemUpdateRequest (PATCH) ---

    private static ItemUpdateRequest updateRequest(String productUrl, String imageUrl) {
        return new ItemUpdateRequest(null, null, null, null, null, null, productUrl, imageUrl);
    }

    @Test
    void updateRequestProductUrlCuJavascriptSchemeEsteRespins() {
        Set<ConstraintViolation<ItemUpdateRequest>> violations =
                validator.validate(updateRequest("javascript:alert(1)", null));
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("productUrl"));
    }

    @Test
    void updateRequestCuAmbeleCampuriNuleEsteValid() {
        assertThat(validator.validate(updateRequest(null, null))).isEmpty();
    }

    @Test
    void updateRequestCantitateNegativaEsteRespinsa() {
        ItemUpdateRequest request = new ItemUpdateRequest(null, null, null, null,
                BigDecimal.valueOf(-5), null, null, null);
        Set<ConstraintViolation<ItemUpdateRequest>> violations = validator.validate(request);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("quantity"));
    }

    @Test
    void updateRequestPretUnitarNegativEsteRespins() {
        ItemUpdateRequest request = new ItemUpdateRequest(null, null, null, null,
                null, BigDecimal.valueOf(-1), null, null);
        Set<ConstraintViolation<ItemUpdateRequest>> violations = validator.validate(request);
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("unitPrice"));
    }
}
