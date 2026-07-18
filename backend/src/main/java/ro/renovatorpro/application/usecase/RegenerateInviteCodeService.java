package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.RegenerateInviteCodeUseCase;
import ro.renovatorpro.application.port.out.InviteCodeGenerator;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class RegenerateInviteCodeService implements RegenerateInviteCodeUseCase {

    private static final int MAX_GENERATION_ATTEMPTS = 5;

    private final ProjectRepository projectRepository;
    private final MembershipGuard membershipGuard;
    private final InviteCodeGenerator inviteCodeGenerator;

    @Override
    @Transactional
    public String execute(String currentUserId, String projectId) {
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.OWNER)) {
            throw new ProjectNotFoundException(projectId);
        }
        for (int attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
            String candidate = inviteCodeGenerator.generate();
            if (projectRepository.trySetInviteCode(projectId, candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Nu s-a putut genera un cod de invitație unic după " + MAX_GENERATION_ATTEMPTS + " încercări");
    }
}
