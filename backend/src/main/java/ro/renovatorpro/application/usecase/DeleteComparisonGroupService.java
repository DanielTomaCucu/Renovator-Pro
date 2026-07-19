package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.DeleteComparisonGroupUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ComparisonGroupNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class DeleteComparisonGroupService implements DeleteComparisonGroupUseCase {

    private final ComparisonGroupRepository comparisonGroupRepository;
    private final OfferRepository offerRepository;
    private final RoomRepository roomRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public void execute(String currentUserId, String groupId) {
        ComparisonGroup existing = comparisonGroupRepository.findById(groupId)
                .orElseThrow(() -> new ComparisonGroupNotFoundException(groupId));
        String projectId = roomRepository.findProjectIdById(existing.roomId())
                .orElseThrow(() -> new ComparisonGroupNotFoundException(groupId));
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new ComparisonGroupNotFoundException(groupId);
        }
        // NU atinge existing.createdItemId() — elementul deja creat în /elemente rămâne, doar istoricul
        // grupului de comparație dispare (regulă explicită din cerințe).
        offerRepository.deleteByGroupId(groupId);
        comparisonGroupRepository.deleteById(groupId);
    }
}
