package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AddComparisonGroupUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.security.MembershipGuard;
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
public class AddComparisonGroupService implements AddComparisonGroupUseCase {

    private final ComparisonGroupRepository comparisonGroupRepository;
    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;
    private final IdGenerator idGenerator;
    private final TimeProvider timeProvider;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public ComparisonGroup execute(String currentUserId, String roomId, Command command) {
        String projectId = roomRepository.findProjectIdById(roomId).orElseThrow(() -> new RoomNotFoundException(roomId));
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new RoomNotFoundException(roomId);
        }
        String linkedItemId = resolveLinkedItemId(roomId, command.materialType(), command.linkedItemId());
        ComparisonGroup group = new ComparisonGroup(
                idGenerator.newId(), roomId, command.name(), command.materialType(),
                ComparisonGroupStatus.IN_ANALIZA, null, null, linkedItemId, timeProvider.now()
        );
        return comparisonGroupRepository.save(group);
    }

    /**
     * {@code explicitItemId} (ales de user în UI la ambiguitate) are prioritate — validat ca fiind un
     * candidat real, altfel 400. Fără el, rezolvare automată (docs/cerinte-comparator-config-sync.md).
     */
    private String resolveLinkedItemId(String roomId, MaterialType materialType, String explicitItemId) {
        var items = itemRepository.findByRoomId(roomId);
        if (explicitItemId != null) {
            boolean valid = items.stream().anyMatch(i -> i.id().equals(explicitItemId)
                    && i.roomId().equals(roomId) && i.materialType() == materialType && i.origin() == ItemOrigin.CONFIGURARE);
            if (!valid) {
                throw new IllegalArgumentException("linkedItemId " + explicitItemId + " nu este un element valid Din Configurare pentru această cameră/material");
            }
            return explicitItemId;
        }
        Item resolved = AutoItemReconciler.resolveLinkedItem(items, roomId, materialType);
        return resolved != null ? resolved.id() : null;
    }
}
