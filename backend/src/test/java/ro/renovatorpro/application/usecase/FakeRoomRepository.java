package ro.renovatorpro.application.usecase;

import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.domain.exception.RoomNotFoundException;
import ro.renovatorpro.domain.model.Room;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

class FakeRoomRepository implements RoomRepository {

    private final Map<String, Room> store = new HashMap<>();
    private final Map<String, String> projectIdByRoomId = new HashMap<>();

    @Override
    public Optional<Room> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public Optional<String> findProjectIdById(String id) {
        return Optional.ofNullable(projectIdByRoomId.get(id));
    }

    @Override
    public List<Room> findByProjectId(String projectId) {
        return store.values().stream().filter(r -> projectId.equals(projectIdByRoomId.get(r.id()))).toList();
    }

    @Override
    public Room insert(Room room, String projectId) {
        store.put(room.id(), room);
        projectIdByRoomId.put(room.id(), projectId);
        return room;
    }

    @Override
    public Room update(Room room) {
        if (!store.containsKey(room.id())) {
            throw new RoomNotFoundException(room.id());
        }
        store.put(room.id(), room);
        return room;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
        projectIdByRoomId.remove(id);
    }
}
