package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.UpdateRoomUseCase;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
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
    private final TimeProvider timeProvider;

    @Override
    @Transactional
    public Result execute(String currentUserId, String roomId, Command command) {
        Room existing = roomRepository.findById(roomId).orElseThrow(() -> new RoomNotFoundException(roomId));
        String projectId = roomRepository.findProjectIdById(roomId).orElseThrow(() -> new RoomNotFoundException(roomId));
        Room patched = new Room(
                existing.id(),
                command.type() != null ? command.type() : existing.type(),
                command.name() != null ? command.name() : existing.name(),
                command.allocatedBudget() != null ? command.allocatedBudget() : existing.allocatedBudget(),
                command.floorMaterial().resolve(existing.floorMaterial()),
                command.floorArea().resolve(existing.floorArea()),
                command.perimeter().resolve(existing.perimeter()),
                command.tileSize().resolve(existing.tileSize()),
                command.installationType().resolve(existing.installationType()),
                command.doors().resolve(existing.doors()),
                command.baseboardHeight().resolve(existing.baseboardHeight()),
                command.wallShape().resolve(existing.wallShape()),
                command.wallTiling().resolve(existing.wallTiling()),
                command.wallFinish().resolve(existing.wallFinish()),
                command.windows().resolve(existing.windows())
        );

        Room saved = roomRepository.update(patched);

        if (command.touchesTechnicalFields()) {
            List<Item> roomItems = itemRepository.findByRoomId(roomId);
            List<Item> reconciled = AutoItemReconciler.reconcile(roomItems, saved, idGenerator::newId, timeProvider.now());
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

        return new Result(saved, projectId);
    }
}
