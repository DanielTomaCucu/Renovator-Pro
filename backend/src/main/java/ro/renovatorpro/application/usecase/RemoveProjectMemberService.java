package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.RemoveProjectMemberUseCase;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.application.port.out.RefreshTokenRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.user.ProjectRole;

/** Ștergerea unui membru îi revocă și toate refresh token-urile — accesul se taie la expirarea access token-ului (≤15 min). */
@Service
@RequiredArgsConstructor
public class RemoveProjectMemberService implements RemoveProjectMemberUseCase {

    private final ProjectMemberRepository projectMemberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public void execute(String currentUserId, String projectId, String targetUserId) {
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.OWNER)) {
            throw new ProjectNotFoundException(projectId);
        }
        if (currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("OWNER-ul nu se poate șterge pe sine din proiect");
        }
        projectMemberRepository.deleteMember(projectId, targetUserId);
        refreshTokenRepository.revokeAllForUser(targetUserId);
    }
}
