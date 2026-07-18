package ro.renovatorpro.application.security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.domain.model.user.ProjectRole;

/**
 * Verifică userul curent are cel puțin rolul minim pe un proiect (IDOR e riscul #1 — blueprint §5).
 * Decizie D8 (docs/cerinte-autentificare.md): orice refuz — nemembru SAU membru cu rol insuficient —
 * se traduce în 404 la nivel HTTP, niciodată 403. Un 403 ar confirma „exiști, dar nu ai voie", ceea ce
 * tot scurge existența resursei; 404 uniform nu distinge cele două cazuri, mai simplu de aplicat corect
 * peste tot decât să ții minte pe care cale merge 403 și pe care 404. Fiecare apelant aruncă EL excepția
 * de tip „NotFound" potrivită resursei sale (RoomNotFoundException, ItemNotFoundException etc.) — acest
 * guard doar răspunde da/nu, ca să nu leaked mesaje specifice unui alt tip de resursă.
 */
@Component
@RequiredArgsConstructor
public class MembershipGuard {

    private final ProjectMemberRepository projectMemberRepository;

    public boolean hasRole(String userId, String projectId, ProjectRole minimumRole) {
        return projectMemberRepository.findRole(projectId, userId)
                .map(actual -> rank(actual) >= rank(minimumRole))
                .orElse(false);
    }

    private static int rank(ProjectRole role) {
        return switch (role) {
            case VIEWER -> 1;
            case EDITOR -> 2;
            case OWNER -> 3;
        };
    }
}
