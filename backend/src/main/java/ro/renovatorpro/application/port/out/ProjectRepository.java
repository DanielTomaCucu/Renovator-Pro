package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.Project;

import java.util.Optional;

public interface ProjectRepository {

    Optional<Project> findById(String id);

    /** Actualizează un proiect EXISTENT (păstrează owner-ul curent) — nu creează proiecte noi (Faza 3 e single-project, seed via migrare). */
    Project update(Project project);

    /** Creează un proiect NOU (Faza 5: register fără cod de invitație — vezi RegisterUserService). */
    Project insert(Project project, String ownerId);

    Optional<String> findOwnerId(String projectId);

    /** Transferul de ownership la adopția proiectului seed de către primul cont real (D3). */
    void changeOwner(String projectId, String newOwnerId);

    Optional<String> findInviteCode(String projectId);

    /** {@code true} dacă scrierea a reușit — poate eșua pe coliziunea (improbabilă) de unicitate, apelantul reîncearcă. */
    boolean trySetInviteCode(String projectId, String inviteCode);

    Optional<String> findProjectIdByInviteCode(String inviteCode);
}
