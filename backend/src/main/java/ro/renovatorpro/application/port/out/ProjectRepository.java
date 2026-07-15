package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.Project;

import java.util.Optional;

public interface ProjectRepository {

    Optional<Project> findById(String id);

    /** Actualizează un proiect EXISTENT (păstrează owner-ul curent) — nu creează proiecte noi (Faza 3 e single-project, seed via migrare). */
    Project update(Project project);
}
