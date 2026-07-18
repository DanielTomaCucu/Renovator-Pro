package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.DeleteRoomUseCase;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.RoomNotFoundException;
import ro.renovatorpro.domain.model.user.ProjectRole;

/**
 * Ștergerea unei camere elimină ȘI elementele ei — cascade explicit aici, la nivel de business, chiar
 * dacă schema DB are deja {@code ON DELETE CASCADE} (blueprint §Task 3.2: regula trebuie să existe
 * independent de constrângerea de schemă — un backend viitor pe alt store nu ar mai avea cascade gratis).
 */
@Service
@RequiredArgsConstructor
public class DeleteRoomService implements DeleteRoomUseCase {

    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public void execute(String currentUserId, String roomId) {
        String projectId = roomRepository.findProjectIdById(roomId).orElseThrow(() -> new RoomNotFoundException(roomId));
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new RoomNotFoundException(roomId);
        }
        itemRepository.deleteByRoomId(roomId);
        roomRepository.deleteById(roomId);
    }
}
