package ro.renovatorpro.application.port.in;

import ro.renovatorpro.domain.model.user.ProjectRole;

import java.util.List;

public interface ListProjectMembersUseCase {

    /** Vizibil oricărui membru (nu doar OWNER) — cu cine împarți proiectul nu e secret. */
    List<MemberView> execute(String currentUserId, String projectId);

    record MemberView(String userId, String username, ProjectRole role) {
    }
}
