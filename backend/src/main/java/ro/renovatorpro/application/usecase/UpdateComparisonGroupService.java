package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetComparisonGroupsUseCase;
import ro.renovatorpro.application.port.in.UpdateComparisonGroupUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ComparisonGroupAlreadyDecidedException;
import ro.renovatorpro.domain.exception.ComparisonGroupNotFoundException;
import ro.renovatorpro.domain.exception.RoomNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.ComparisonGroupStatus;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.service.AutoItemReconciler;

@Service
@RequiredArgsConstructor
public class UpdateComparisonGroupService implements UpdateComparisonGroupUseCase {

    private final ComparisonGroupRepository comparisonGroupRepository;
    private final OfferRepository offerRepository;
    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;
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
        MaterialType newMaterialType = command.materialType() != null ? command.materialType() : existing.materialType();

        // Re-rezolvă linkedItemId doar dacă s-a schimbat efectiv cameră SAU material (evită re-rezolvare
        // inutilă la un PATCH care schimbă doar numele) — cu excepția unei valori explicite din request.
        String linkedItemId = existing.linkedItemId();
        boolean targetChanged = !newRoomId.equals(existing.roomId()) || newMaterialType != existing.materialType();
        if (command.linkedItemId() != null) {
            linkedItemId = validateExplicitLinkedItem(newRoomId, newMaterialType, command.linkedItemId());
        } else if (targetChanged) {
            Item resolved = AutoItemReconciler.resolveLinkedItem(itemRepository.findByRoomId(newRoomId), newRoomId, newMaterialType);
            linkedItemId = resolved != null ? resolved.id() : null;
        }

        ComparisonGroup patched = new ComparisonGroup(
                existing.id(),
                newRoomId,
                command.name() != null ? command.name() : existing.name(),
                newMaterialType,
                existing.status(),
                existing.chosenOfferId(),
                existing.createdItemId(),
                linkedItemId,
                existing.createdAt()
        );
        ComparisonGroup saved = comparisonGroupRepository.save(patched);
        return new GetComparisonGroupsUseCase.GroupWithOffers(saved, offerRepository.findByGroupId(saved.id()));
    }

    private String validateExplicitLinkedItem(String roomId, MaterialType materialType, String explicitItemId) {
        boolean valid = itemRepository.findByRoomId(roomId).stream()
                .anyMatch(i -> i.id().equals(explicitItemId) && i.materialType() == materialType && i.origin() == ItemOrigin.CONFIGURARE);
        if (!valid) {
            throw new IllegalArgumentException("linkedItemId " + explicitItemId + " nu este un element valid Din Configurare pentru această cameră/material");
        }
        return explicitItemId;
    }
}
