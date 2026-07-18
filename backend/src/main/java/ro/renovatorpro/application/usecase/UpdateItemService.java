package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.UpdateItemUseCase;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ItemNotFoundException;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class UpdateItemService implements UpdateItemUseCase {

    private final ItemRepository itemRepository;
    private final RoomRepository roomRepository;
    private final TimeProvider timeProvider;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public Item execute(String currentUserId, String itemId, Command command) {
        Item existing = itemRepository.findById(itemId).orElseThrow(() -> new ItemNotFoundException(itemId));
        String projectId = roomRepository.findProjectIdById(existing.roomId())
                .orElseThrow(() -> new ItemNotFoundException(itemId));
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new ItemNotFoundException(itemId);
        }
        ItemStatus newStatus = command.status() != null ? command.status() : existing.status();
        // purchasedAt se actualizează DOAR la tranziția SPRE Cumpărat (era altceva, devine Cumpărat) —
        // rămâne neschimbat dacă statusul e deja Cumpărat (nu se „reîmprospătează" la fiecare editare)
        // sau dacă statusul se schimbă spre altceva (păstrăm ultimul moment de cumpărare, e istoric).
        boolean tranzitieSpreCumparat = newStatus == ItemStatus.CUMPARAT && existing.status() != ItemStatus.CUMPARAT;
        Instant purchasedAt = tranzitieSpreCumparat ? timeProvider.now() : existing.purchasedAt();
        Item patched = new Item(
                existing.id(),
                existing.roomId(),
                command.name() != null ? command.name() : existing.name(),
                command.materialType() != null ? command.materialType() : existing.materialType(),
                command.source() != null ? command.source() : existing.source(),
                newStatus,
                command.quantity() != null ? command.quantity() : existing.quantity(),
                command.unitPrice() != null ? command.unitPrice() : existing.unitPrice(),
                command.productUrl() != null ? command.productUrl() : existing.productUrl(),
                command.imageUrl() != null ? command.imageUrl() : existing.imageUrl(),
                existing.origin(),
                existing.createdAt(),
                purchasedAt
        );
        return itemRepository.save(patched);
    }
}
