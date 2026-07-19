package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetComparisonGroupsUseCase;
import ro.renovatorpro.application.port.in.UpdateComparisonGroupUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ComparisonGroupAlreadyDecidedException;
import ro.renovatorpro.domain.exception.ComparisonGroupNotFoundException;
import ro.renovatorpro.domain.exception.RoomNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.ComparisonGroupStatus;
import ro.renovatorpro.domain.model.user.ProjectRole;

@Service
@RequiredArgsConstructor
public class UpdateComparisonGroupService implements UpdateComparisonGroupUseCase {

    private final ComparisonGroupRepository comparisonGroupRepository;
    private final OfferRepository offerRepository;
    private final RoomRepository roomRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public GetComparisonGroupsUseCase.GroupWithOffers execute(String currentUserId, String groupId, Command command) {
        ComparisonGroup existing = comparisonGroupRepository.findById(groupId)
                .orElseThrow(() -> new ComparisonGroupNotFoundException(groupId));
        String projectId = roomRepository.findProjectIdById(existing.roomId())
                .orElseThrow(() -> new ComparisonGroupNotFoundException(groupId));
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new ComparisonGroupNotFoundException(groupId);
        }

        String newRoomId = existing.roomId();
        if (command.roomId() != null && !command.roomId().equals(existing.roomId())) {
            if (existing.status() != ComparisonGroupStatus.IN_ANALIZA) {
                throw new ComparisonGroupAlreadyDecidedException(groupId);
            }
            String targetProjectId = roomRepository.findProjectIdById(command.roomId())
                    .orElseThrow(() -> new RoomNotFoundException(command.roomId()));
            // Mutarea rămâne în ACELAȘI proiect — o cameră dintr-un alt proiect e tratată ca inexistentă (IDOR).
            if (!targetProjectId.equals(projectId)) {
                throw new RoomNotFoundException(command.roomId());
            }
            newRoomId = command.roomId();
        }

        ComparisonGroup patched = new ComparisonGroup(
                existing.id(),
                newRoomId,
                command.name() != null ? command.name() : existing.name(),
                command.materialType() != null ? command.materialType() : existing.materialType(),
                existing.status(),
                existing.chosenOfferId(),
                existing.createdItemId(),
                existing.createdAt()
        );
        ComparisonGroup saved = comparisonGroupRepository.save(patched);
        return new GetComparisonGroupsUseCase.GroupWithOffers(saved, offerRepository.findByGroupId(saved.id()));
    }
}
