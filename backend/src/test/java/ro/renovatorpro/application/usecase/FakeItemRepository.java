package ro.renovatorpro.application.usecase;

import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.domain.model.Item;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

class FakeItemRepository implements ItemRepository {

    private final Map<String, Item> store = new HashMap<>();

    @Override
    public Optional<Item> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Item> findByRoomId(String roomId) {
        return store.values().stream().filter(i -> i.roomId().equals(roomId)).toList();
    }

    @Override
    public List<Item> findByRoomIds(List<String> roomIds) {
        return store.values().stream().filter(i -> roomIds.contains(i.roomId())).toList();
    }

    @Override
    public Item save(Item item) {
        store.put(item.id(), item);
        return item;
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }

    @Override
    public void deleteByRoomId(String roomId) {
        store.values().removeIf(i -> i.roomId().equals(roomId));
    }
}
