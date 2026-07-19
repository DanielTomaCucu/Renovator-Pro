package ro.renovatorpro.application.usecase;

import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.domain.model.ComparisonGroup;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

class FakeComparisonGroupRepository implements ComparisonGroupRepository {

    private final Map<String, ComparisonGroup> store = new HashMap<>();

    @Override
    public Optional<ComparisonGroup> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<ComparisonGroup> findByRoomId(String roomId) {
        return store.values().stream().filter(g -> g.roomId().equals(roomId)).toList();
    }

    @Override
    public List<ComparisonGroup> findByRoomIds(List<String> roomIds) {
        return store.values().stream().filter(g -> roomIds.contains(g.roomId())).toList();
    }

    @Override
    public ComparisonGroup save(ComparisonGroup group) {
        store.put(group.id(), group);
        return group;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }

    @Override
    public void deleteByRoomId(String roomId) {
        store.values().removeIf(g -> g.roomId().equals(roomId));
    }
}
