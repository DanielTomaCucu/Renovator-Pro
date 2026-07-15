package ro.renovatorpro.application.port.out;

import ro.renovatorpro.domain.model.Item;

import java.util.List;
import java.util.Optional;

public interface ItemRepository {

    Optional<Item> findById(String id);

    List<Item> findByRoomId(String roomId);

    List<Item> findByRoomIds(List<String> roomIds);

    Item save(Item item);

    void deleteById(String id);

    /** Cascade explicit la ștergerea unei camere — regulă de business, nu doar constrângere de schemă (vezi Task 3.2). */
    void deleteByRoomId(String roomId);
}
