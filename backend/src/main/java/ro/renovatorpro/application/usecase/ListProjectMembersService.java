package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.ListProjectMembersUseCase;
import ro.renovatorpro.application.port.out.ProjectMemberRepository;
import ro.renovatorpro.application.port.out.UserRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.user.ProjectMember;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.model.user.User;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListProjectMembersService implements ListProjectMembersUseCase {

    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional(readOnly = true)
    public List<MemberView> execute(String currentUserId, String projectId) {
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.VIEWER)) {
            throw new ProjectNotFoundException(projectId);
        }
        List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);
        return members.stream()
                .map(member -> {
                    User user = userRepository.findById(member.userId())
                            .orElseThrow(() -> new IllegalStateException("Membru fără user asociat: " + member.userId()));
                    return new MemberView(user.id(), user.username(), member.role());
                })
                .toList();
    }
}
