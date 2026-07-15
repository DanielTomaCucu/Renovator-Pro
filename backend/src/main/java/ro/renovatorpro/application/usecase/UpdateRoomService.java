package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.UpdateRoomUseCase;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.domain.exception.RoomNotFoundException;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.service.AutoItemReconciler;

import java.util.List;

/** Vezi {@link UpdateRoomUseCase}: dacă patch-ul atinge orice câmp tehnic, reconciliază elementele „Din Configurare" ale camerei. */
@Service
@RequiredArgsConstructor
public class UpdateRoomService implements UpdateRoomUseCase {

    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;
    private final IdGenerator idGenerator;

    @Override
    @Transactional
    public Room execute(String currentUserId, String roomId, Command command) {
        Room existing = roomRepository.findById(roomId).orElseThrow(() -> new RoomNotFoundException(roomId));
        Room patched = new Room(
                existing.id(),
                command.type() != null ? command.type() : existing.type(),
                command.name() != null ? command.name() : existing.name(),
                command.allocatedBudget() != null ? command.allocatedBudget() : existing.allocatedBudget(),
                command.floorMaterial() != null ? command.floorMaterial() : existing.floorMaterial(),
                command.floorArea() != null ? command.floorArea() : existing.floorArea(),
                command.perimeter() != null ? command.perimeter() : existing.perimeter(),
                command.tileSize() != null ? command.tileSize() : existing.tileSize(),
                command.installationType() != null ? command.installationType() : existing.installationType(),
                command.doors() != null ? command.doors() : existing.doors(),
                command.baseboardHeight() != null ? command.baseboardHeight() : existing.baseboardHeight(),
                command.wallShape() != null ? command.wallShape() : existing.wallShape(),
                command.wallTiling() != null ? command.wallTiling() : existing.wallTiling(),
                command.wallFinish() != null ? command.wallFinish() : existing.wallFinish(),
                command.windows() != null ? command.windows() : existing.windows()
        );

        Room saved = roomRepository.update(patched);

        if (command.touchesTechnicalFields()) {
            List<Item> roomItems = itemRepository.findByRoomId(roomId);
            List<Item> reconciled = AutoItemReconciler.reconcile(roomItems, saved, idGenerator::newId);
            for (Item item : reconciled) {
                itemRepository.save(item);
            }
            // Elementele care au dispărut din reconciliere (măsurătoare ștearsă) trebuie șterse explicit —
            // reconcile() întoarce lista finală, nu un diff; orice id vechi absent din rezultat e orfan.
            List<String> reconciledIds = reconciled.stream().map(Item::id).toList();
            for (Item old : roomItems) {
                if (!reconciledIds.contains(old.id())) {
                    itemRepository.deleteById(old.id());
                }
            }
        }

        return saved;
    }
}
