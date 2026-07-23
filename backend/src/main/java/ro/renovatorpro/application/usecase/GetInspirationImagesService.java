package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetInspirationImagesUseCase;
import ro.renovatorpro.application.port.out.InspirationImageRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.InspirationImage;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetInspirationImagesService implements GetInspirationImagesUseCase {

    private final InspirationImageRepository inspirationImageRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional(readOnly = true)
    public List<InspirationImage> execute(String currentUserId, String projectId) {
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.VIEWER)) {
            throw new ProjectNotFoundException(projectId);
        }
        return inspirationImageRepository.findByProjectId(projectId);
    }
}
