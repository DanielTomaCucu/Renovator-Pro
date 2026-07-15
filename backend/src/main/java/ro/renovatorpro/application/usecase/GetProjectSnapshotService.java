package ro.renovatorpro.application.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetProjectSnapshotUseCase;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.Room;

import java.util.List;

@Service
public class GetProjectSnapshotService implements GetProjectSnapshotUseCase {

    private final ProjectRepository projectRepository;
    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;

    public GetProjectSnapshotService(ProjectRepository projectRepository, RoomRepository roomRepository, ItemRepository itemRepository) {
        this.projectRepository = projectRepository;
        this.roomRepository = roomRepository;
        this.itemRepository = itemRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectSnapshot execute(String currentUserId, String projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ProjectNotFoundException(projectId));
        List<Room> rooms = roomRepository.findByProjectId(projectId);
        List<String> roomIds = rooms.stream().map(Room::id).toList();
        List<Item> items = roomIds.isEmpty() ? List.of() : itemRepository.findByRoomIds(roomIds);
        return new ProjectSnapshot(project, rooms, items);
    }
}
