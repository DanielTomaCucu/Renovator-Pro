package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.util.List;

public interface ListMyProjectsUseCase {

    /** Sortate după `joinedAt` ascendent (cel mai vechi = „proiectul de-acasă", primul). */
    List<Result> execute(String currentUserId);

    record Result(Project project, ProjectRole role) {
    }
}
