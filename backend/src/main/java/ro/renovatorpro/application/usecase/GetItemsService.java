package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetItemsUseCase;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetItemsService implements GetItemsUseCase {

    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional(readOnly = true)
    public List<Item> execute(String currentUserId, String projectId) {
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.VIEWER)) {
            throw new ProjectNotFoundException(projectId);
        }
        List<String> roomIds = roomRepository.findByProjectId(projectId).stream().map(Room::id).toList();
        return roomIds.isEmpty() ? List.of() : itemRepository.findByRoomIds(roomIds);
    }
}
