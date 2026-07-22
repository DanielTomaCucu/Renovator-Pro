package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.DeleteInspirationImageUseCase;
import ro.renovatorpro.application.port.out.InspirationImageRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.InspirationImageNotFoundException;
import ro.renovatorpro.domain.model.InspirationImage;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class DeleteInspirationImageService implements DeleteInspirationImageUseCase {

    private final InspirationImageRepository inspirationImageRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public void execute(String currentUserId, String id) {
        InspirationImage existing = inspirationImageRepository.findById(id)
                .orElseThrow(() -> new InspirationImageNotFoundException(id));
        if (!membershipGuard.hasRole(currentUserId, existing.projectId(), ProjectRole.EDITOR)) {
            throw new InspirationImageNotFoundException(id);
        }
        inspirationImageRepository.deleteById(id);
    }
}
