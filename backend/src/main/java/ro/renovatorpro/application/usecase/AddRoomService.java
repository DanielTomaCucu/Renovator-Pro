package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AddRoomUseCase;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.domain.model.Room;

@Service
@RequiredArgsConstructor
public class AddRoomService implements AddRoomUseCase {

    private final RoomRepository roomRepository;
    private final IdGenerator idGenerator;

    @Override
    @Transactional
    public Room execute(String currentUserId, String projectId, Command command) {
        Room room = Room.builder(idGenerator.newId(), command.type(), command.name(), command.allocatedBudget()).build();
        return roomRepository.insert(room, projectId);
    }
}
