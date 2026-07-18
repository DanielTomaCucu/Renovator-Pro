package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.model.user.User;

public interface GetCurrentUserUseCase {

    Result execute(String currentUserId);

    record Result(User user, Project project, ProjectRole role) {
    }
}
