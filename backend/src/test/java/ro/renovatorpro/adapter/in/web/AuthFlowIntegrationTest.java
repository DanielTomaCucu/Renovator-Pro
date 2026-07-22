package ro.renovatorpro.adapter.in.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Fluxul complet de autentificare (AUTH-3, DoD blueprint Task 5.1) pe stack-ul REAL: Spring Security +
 * JWT + Postgres (Testcontainers). {@code disabledWithoutDocker = true} — dezactivat automat fără Docker.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers(disabledWithoutDocker = true)
class AuthFlowIntegrationTest {

    @Container
    @SuppressWarnings("resource")
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    private static String uniqueUsername() {
        return "user-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private static String uniqueEmail() {
        return "user-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
    }

    @Test
    void fluxComplet_registerLoginAccesRefreshLogoutRefreshEsueaza() {
        String username = uniqueUsername();
        Map<String, String> registerBody = Map.of(
                "username", username, "email", uniqueEmail(), "password", "parola-buna-12345", "projectName", "Proiectul lui " + username);

        ResponseEntity<Map> registerResponse = restTemplate.postForEntity("/api/auth/register", registerBody, Map.class);
        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String accessToken = (String) registerResponse.getBody().get("accessToken");
        assertThat(accessToken).isNotBlank();
        assertThat(registerResponse.getBody().toString()).doesNotContain("parola-buna-12345");
        String rawSetCookie = registerResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertThat(rawSetCookie).contains("HttpOnly").contains("Secure");
        String refreshCookie = extractCookie(registerResponse);

        // Acces cu access token pe un endpoint autentificat.
        ResponseEntity<Map> meResponse = restTemplate.exchange(
                "/api/auth/me", HttpMethod.GET, new HttpEntity<>(bearerHeaders(accessToken)), Map.class);
        assertThat(meResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(((Map) meResponse.getBody().get("user")).get("username")).isEqualTo(username);

        // Login separat cu aceleași credențiale.
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity("/api/auth/login",
                Map.of("username", username, "password", "parola-buna-12345"), Map.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Refresh rotește tokenul — cookie-ul vechi (din register) devine invalid.
        HttpHeaders refreshHeaders = new HttpHeaders();
        refreshHeaders.add(HttpHeaders.COOKIE, refreshCookie);
        refreshHeaders.add("X-Requested-With", "XMLHttpRequest"); // SEC-6
        ResponseEntity<Map> refreshResponse = restTemplate.exchange(
                "/api/auth/refresh", HttpMethod.POST, new HttpEntity<>(refreshHeaders), Map.class);
        assertThat(refreshResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        String newAccessToken = (String) refreshResponse.getBody().get("accessToken");
        assertThat(newAccessToken).isNotBlank();
        String rotatedRefreshCookie = extractCookie(refreshResponse);

        // Cookie-ul vechi, deja rotit, nu mai funcționează (single-use).
        ResponseEntity<Map> reuseOldCookie = restTemplate.exchange(
                "/api/auth/refresh", HttpMethod.POST, new HttpEntity<>(refreshHeaders), Map.class);
        assertThat(reuseOldCookie.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        // Logout revocă și cookie-ul rotit.
        HttpHeaders logoutHeaders = new HttpHeaders();
        logoutHeaders.add(HttpHeaders.COOKIE, rotatedRefreshCookie);
        logoutHeaders.add("X-Requested-With", "XMLHttpRequest"); // SEC-6
        ResponseEntity<Void> logoutResponse = restTemplate.exchange(
                "/api/auth/logout", HttpMethod.POST, new HttpEntity<>(logoutHeaders), Void.class);
        assertThat(logoutResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<Map> refreshAfterLogout = restTemplate.exchange(
                "/api/auth/refresh", HttpMethod.POST, new HttpEntity<>(logoutHeaders), Map.class);
        assertThat(refreshAfterLogout.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void accesFaraTokenPrimeste401() {
        ResponseEntity<Map> response = restTemplate.getForEntity("/api/auth/me", Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void accesCuTokenInvalidPrimeste401() {
        ResponseEntity<Map> response = restTemplate.exchange(
                "/api/auth/me", HttpMethod.GET, new HttpEntity<>(bearerHeaders("token-invalid-si-inventat")), Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void registerCuUsernameDejaFolositPrimeste409() {
        String username = uniqueUsername();
        Map<String, String> body = Map.of("username", username, "email", uniqueEmail(), "password", "parola-buna-12345", "projectName", "P1");
        assertThat(restTemplate.postForEntity("/api/auth/register", body, Map.class).getStatusCode()).isEqualTo(HttpStatus.CREATED);
        // Al doilea register cu ACELAȘI username dar alt email — tot 409 (username-ul e cel duplicat aici).
        Map<String, String> sameUsernameOtherEmail = Map.of("username", username, "email", uniqueEmail(), "password", "parola-buna-12345", "projectName", "P1");
        assertThat(restTemplate.postForEntity("/api/auth/register", sameUsernameOtherEmail, Map.class).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void registerCuEmailDejaFolositPrimeste409() {
        String email = uniqueEmail();
        Map<String, String> body = Map.of("username", uniqueUsername(), "email", email, "password", "parola-buna-12345", "projectName", "P1");
        assertThat(restTemplate.postForEntity("/api/auth/register", body, Map.class).getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Map<String, String> sameEmailOtherUsername = Map.of("username", uniqueUsername(), "email", email, "password", "parola-buna-12345", "projectName", "P1");
        assertThat(restTemplate.postForEntity("/api/auth/register", sameEmailOtherUsername, Map.class).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void registerFaraEmailPrimeste400() {
        Map<String, String> body = Map.of("username", uniqueUsername(), "password", "parola-buna-12345", "projectName", "P1");
        assertThat(restTemplate.postForEntity("/api/auth/register", body, Map.class).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void registerFaraProjectNameSiFaraInviteCodePrimeste400() {
        Map<String, String> body = Map.of("username", uniqueUsername(), "email", uniqueEmail(), "password", "parola-buna-12345");
        assertThat(restTemplate.postForEntity("/api/auth/register", body, Map.class).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void registerCuProjectNameSiInviteCodeAmbelePrimeste400() {
        Map<String, String> body = Map.of("username", uniqueUsername(), "email", uniqueEmail(), "password", "parola-buna-12345",
                "projectName", "P1", "inviteCode", "ABCDEFGHIJ");
        assertThat(restTemplate.postForEntity("/api/auth/register", body, Map.class).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void loginCuParolaGresitaPrimeste401() {
        String username = uniqueUsername();
        restTemplate.postForEntity("/api/auth/register",
                Map.of("username", username, "email", uniqueEmail(), "password", "parola-buna-12345", "projectName", "P1"), Map.class);

        ResponseEntity<Map> response = restTemplate.postForEntity("/api/auth/login",
                Map.of("username", username, "password", "parola-gresita"), Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void registerCuCodDeInvitatieInexistentPrimeste404() {
        Map<String, String> body = Map.of("username", uniqueUsername(), "email", uniqueEmail(), "password", "parola-buna-12345",
                "inviteCode", "COD-INEXISTENT");
        assertThat(restTemplate.postForEntity("/api/auth/register", body, Map.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void fluxResetareParola_forgotPasswordApoiResetPasswordApoiLoginCuParolaNoua() {
        String username = uniqueUsername();
        String email = uniqueEmail();
        restTemplate.postForEntity("/api/auth/register",
                Map.of("username", username, "email", email, "password", "parola-veche-12345", "projectName", "P1"), Map.class);

        ResponseEntity<Map> forgotResponse = restTemplate.postForEntity("/api/auth/forgot-password",
                Map.of("email", email), Map.class);
        assertThat(forgotResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        String resetToken = (String) forgotResponse.getBody().get("resetToken");
        assertThat(resetToken).isNotBlank();

        ResponseEntity<Void> resetResponse = restTemplate.postForEntity("/api/auth/reset-password",
                Map.of("token", resetToken, "newPassword", "parola-noua-67890"), Void.class);
        assertThat(resetResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // Parola veche nu mai funcționează.
        ResponseEntity<Map> loginVechi = restTemplate.postForEntity("/api/auth/login",
                Map.of("username", username, "password", "parola-veche-12345"), Map.class);
        assertThat(loginVechi.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        // Parola nouă funcționează.
        ResponseEntity<Map> loginNou = restTemplate.postForEntity("/api/auth/login",
                Map.of("username", username, "password", "parola-noua-67890"), Map.class);
        assertThat(loginNou.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Tokenul de reset e single-use — a doua folosire eșuează.
        ResponseEntity<Void> reuseToken = restTemplate.postForEntity("/api/auth/reset-password",
                Map.of("token", resetToken, "newPassword", "alta-parola-99999"), Void.class);
        assertThat(reuseToken.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void forgotPasswordCuEmailInexistentPrimeste404() {
        ResponseEntity<Map> response = restTemplate.postForEntity("/api/auth/forgot-password",
                Map.of("email", "nu-exista-" + UUID.randomUUID() + "@example.com"), Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void resetPasswordCuTokenInvalidPrimeste400() {
        ResponseEntity<Void> response = restTemplate.postForEntity("/api/auth/reset-password",
                Map.of("token", "token-inventat-si-invalid", "newPassword", "parola-noua-12345"), Void.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    private static HttpHeaders bearerHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        return headers;
    }

    private static String extractCookie(ResponseEntity<?> response) {
        String setCookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertThat(setCookie).isNotNull();
        return setCookie.split(";", 2)[0];
    }
}
