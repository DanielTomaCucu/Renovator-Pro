package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.GetRoomsUseCase;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.domain.model.Room;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GetRoomsService implements GetRoomsUseCase {

    private final RoomRepository roomRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Room> execute(String currentUserId, String projectId) {
        return roomRepository.findByProjectId(projectId);
    }
}
