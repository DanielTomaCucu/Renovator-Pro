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

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * IDOR e riscul #1 (blueprint §5): userul A nu poate accesa resursele userului B — 404, nu 403
 * (decizie D8, docs/cerinte-autentificare.md — nu distingem „nemembru" de „membru fără rol suficient").
 * Acoperă și partajarea prin cod de invitație (AUTH-7): EDITOR poate scrie, dar nu administrează proiectul.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers(disabledWithoutDocker = true)
class IdorAuthorizationIntegrationTest {

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

    private record Session(String username, String userId, String accessToken, String projectId, String refreshCookie) {
    }

    private Session registerWithNewProject() {
        String username = "user-" + UUID.randomUUID().toString().substring(0, 8);
        ResponseEntity<Map> response = restTemplate.postForEntity("/api/auth/register",
                Map.of("username", username, "password", "parola-buna-12345", "projectName", "Proiect " + username),
                Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String accessToken = (String) response.getBody().get("accessToken");
        String projectId = (String) ((Map) response.getBody().get("project")).get("id");
        String userId = (String) ((Map) response.getBody().get("user")).get("id");
        String refreshCookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE).split(";", 2)[0];
        return new Session(username, userId, accessToken, projectId, refreshCookie);
    }

    private Session joinWithInviteCode(String inviteCode) {
        String username = "user-" + UUID.randomUUID().toString().substring(0, 8);
        ResponseEntity<Map> response = restTemplate.postForEntity("/api/auth/register",
                Map.of("username", username, "password", "parola-buna-12345", "inviteCode", inviteCode), Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String accessToken = (String) response.getBody().get("accessToken");
        String projectId = (String) ((Map) response.getBody().get("project")).get("id");
        String userId = (String) ((Map) response.getBody().get("user")).get("id");
        String refreshCookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE).split(";", 2)[0];
        return new Session(username, userId, accessToken, projectId, refreshCookie);
    }

    private <T> ResponseEntity<T> call(HttpMethod method, String path, String accessToken, Object body, Class<T> type) {
        HttpHeaders headers = new HttpHeaders();
        if (accessToken != null) {
            headers.setBearerAuth(accessToken);
        }
        return restTemplate.exchange(path, method, new HttpEntity<>(body, headers), type);
    }

    @Test
    void userulANuAccesseazaResurseleUseruluiB() {
        Session ownerA = registerWithNewProject();
        Session ownerB = registerWithNewProject();

        Map<String, Object> roomPayload = Map.of("type", "Baie", "name", "Baia lui A", "allocatedBudget", 500);
        ResponseEntity<Map> roomResponse = call(HttpMethod.POST, "/api/projects/" + ownerA.projectId() + "/rooms",
                ownerA.accessToken(), roomPayload, Map.class);
        assertThat(roomResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String roomId = (String) roomResponse.getBody().get("id");

        // roomId în body e obligatoriu la nivel de validare DTO, deși controller-ul folosește exclusiv
        // roomId-ul din PATH (vezi ItemController) — orice valoare non-goală trece validarea.
        Map<String, Object> itemPayload = Map.of("roomId", roomId, "name", "Gresie", "materialType", "Gresie",
                "status", "În așteptare", "quantity", 1, "unitPrice", 50, "origin", "Manual");
        ResponseEntity<Map> itemResponse = call(HttpMethod.POST, "/api/rooms/" + roomId + "/items",
                ownerA.accessToken(), itemPayload, Map.class);
        assertThat(itemResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String itemId = (String) itemResponse.getBody().get("id");

        // B, cu propriul token valid, încearcă resursele lui A — 404 peste tot, nu 403/200.
        assertThat(call(HttpMethod.GET, "/api/projects/" + ownerA.projectId(), ownerB.accessToken(), null, Map.class)
                .getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.GET, "/api/projects/" + ownerA.projectId() + "/summary", ownerB.accessToken(), null, Map.class)
                .getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.PATCH, "/api/projects/" + ownerA.projectId(), ownerB.accessToken(),
                Map.of("title", "Deturnat"), Map.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.GET, "/api/projects/" + ownerA.projectId() + "/rooms", ownerB.accessToken(), null, Object.class)
                .getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.POST, "/api/projects/" + ownerA.projectId() + "/rooms", ownerB.accessToken(),
                roomPayload, Map.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.PATCH, "/api/rooms/" + roomId, ownerB.accessToken(),
                Map.of("name", "Deturnat"), Map.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.DELETE, "/api/rooms/" + roomId, ownerB.accessToken(), null, Void.class)
                .getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.POST, "/api/rooms/" + roomId + "/items", ownerB.accessToken(),
                itemPayload, Map.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.PATCH, "/api/items/" + itemId, ownerB.accessToken(),
                Map.of("name", "Deturnat"), Map.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.DELETE, "/api/items/" + itemId, ownerB.accessToken(), null, Void.class)
                .getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.GET, "/api/projects/" + ownerA.projectId() + "/invite-code", ownerB.accessToken(), null, Map.class)
                .getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.GET, "/api/projects/" + ownerA.projectId() + "/members", ownerB.accessToken(), null, Object.class)
                .getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        // Sanity: A poate tot ce i s-a refuzat lui B — dovada că 404 e despre autorizare, nu endpoint stricat.
        assertThat(call(HttpMethod.GET, "/api/projects/" + ownerA.projectId(), ownerA.accessToken(), null, Map.class)
                .getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(call(HttpMethod.PATCH, "/api/rooms/" + roomId, ownerA.accessToken(),
                Map.of("name", "Baie Redenumită"), Map.class).getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void editorInvitatPoateScrieDarNuAdministreazaProiectul() {
        Session owner = registerWithNewProject();

        ResponseEntity<Map> inviteResponse = call(HttpMethod.GET, "/api/projects/" + owner.projectId() + "/invite-code",
                owner.accessToken(), null, Map.class);
        assertThat(inviteResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        String inviteCode = (String) inviteResponse.getBody().get("inviteCode");

        Session editor = joinWithInviteCode(inviteCode);
        assertThat(editor.projectId()).isEqualTo(owner.projectId());

        // EDITOR: CRUD camere/elemente — permis.
        ResponseEntity<Map> roomResponse = call(HttpMethod.POST, "/api/projects/" + owner.projectId() + "/rooms",
                editor.accessToken(), Map.of("type", "Living", "name", "Living Comun", "allocatedBudget", 700), Map.class);
        assertThat(roomResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String roomId = (String) roomResponse.getBody().get("id");

        // EDITOR: administrare proiect/cod/membri — interzis (404, mascat ca „nu ai acces").
        assertThat(call(HttpMethod.GET, "/api/projects/" + owner.projectId() + "/invite-code", editor.accessToken(), null, Map.class)
                .getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.POST, "/api/projects/" + owner.projectId() + "/invite-code/regenerate", editor.accessToken(), null, Map.class)
                .getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.DELETE, "/api/projects/" + owner.projectId() + "/members/" + owner.userId(),
                editor.accessToken(), null, Void.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(call(HttpMethod.PATCH, "/api/projects/" + owner.projectId(), editor.accessToken(),
                Map.of("title", "Deturnat"), Map.class).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        // Lista de membri e vizibilă oricărui membru, inclusiv EDITOR.
        ResponseEntity<List> membersAsEditor = call(HttpMethod.GET, "/api/projects/" + owner.projectId() + "/members",
                editor.accessToken(), null, List.class);
        assertThat(membersAsEditor.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(membersAsEditor.getBody()).hasSize(2);

        // OWNER regenerează codul — cel vechi devine invalid pentru înregistrări noi.
        ResponseEntity<Map> regenerated = call(HttpMethod.POST, "/api/projects/" + owner.projectId() + "/invite-code/regenerate",
                owner.accessToken(), null, Map.class);
        assertThat(regenerated.getStatusCode()).isEqualTo(HttpStatus.OK);
        String newCode = (String) regenerated.getBody().get("inviteCode");
        assertThat(newCode).isNotEqualTo(inviteCode);

        ResponseEntity<Map> registerWithOldCode = restTemplate.postForEntity("/api/auth/register",
                Map.of("username", "late-" + UUID.randomUUID().toString().substring(0, 8),
                        "password", "parola-buna-12345", "inviteCode", inviteCode), Map.class);
        assertThat(registerWithOldCode.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

        // OWNER șterge membrul EDITOR — accesul lui e tăiat (refresh-ul revocat eșuează).
        ResponseEntity<Void> removeResponse = call(HttpMethod.DELETE,
                "/api/projects/" + owner.projectId() + "/members/" + editor.userId(), owner.accessToken(), null, Void.class);
        assertThat(removeResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        HttpHeaders editorRefreshHeaders = new HttpHeaders();
        editorRefreshHeaders.add(HttpHeaders.COOKIE, editor.refreshCookie());
        ResponseEntity<Map> editorRefreshAfterRemoval = restTemplate.exchange(
                "/api/auth/refresh", HttpMethod.POST, new HttpEntity<>(editorRefreshHeaders), Map.class);
        assertThat(editorRefreshAfterRemoval.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        // OWNER nu se poate șterge pe sine.
        ResponseEntity<Map> selfRemoval = call(HttpMethod.DELETE,
                "/api/projects/" + owner.projectId() + "/members/" + owner.userId(), owner.accessToken(), null, Map.class);
        assertThat(selfRemoval.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
