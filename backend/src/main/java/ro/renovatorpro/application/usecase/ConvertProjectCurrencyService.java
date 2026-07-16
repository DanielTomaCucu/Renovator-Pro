package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.ConvertProjectCurrencyUseCase;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.service.CurrencyConverter;

import java.math.BigDecimal;
import java.util.List;

/**
 * Convertește, într-o singură tranzacție, TOATE sumele unui proiect în moneda țintă (Problema 1 din audit).
 * Regula de conversie e delegată la {@link CurrencyConverter} (pură, testată izolat); aici doar orchestrăm
 * citirea, aplicarea pe fiecare entitate și persistarea. Conversia în aceeași monedă e no-op efectiv
 * (factor identitate), dar tot re-scrie moneda proiectului — inofensiv.
 */
@Service
@RequiredArgsConstructor
public class ConvertProjectCurrencyService implements ConvertProjectCurrencyUseCase {

    private final ProjectRepository projectRepository;
    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;

    @Override
    @Transactional
    public Project execute(String currentUserId, String projectId, Command command) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        Currency from = project.currency();
        Currency to = command.targetCurrency();
        BigDecimal rate = command.exchangeRate();

        // 1. Bugetul total al proiectului + moneda țintă.
        Money convertedBudget = CurrencyConverter.convert(project.totalBudget(), from, to, rate);
        Project converted = new Project(project.id(), project.title(), convertedBudget, to, project.totalArea());
        Project saved = projectRepository.update(converted);

        // 2. Bugetul alocat al fiecărei camere (câmpurile tehnice rămân neatinse).
        List<Room> rooms = roomRepository.findByProjectId(projectId);
        for (Room room : rooms) {
            Money convertedAllocated = CurrencyConverter.convert(room.allocatedBudget(), from, to, rate);
            roomRepository.update(withAllocatedBudget(room, convertedAllocated));
        }

        // 3. Prețul unitar al fiecărui element din proiect.
        List<Item> items = itemRepository.findByRoomIds(rooms.stream().map(Room::id).toList());
        for (Item item : items) {
            Money convertedPrice = CurrencyConverter.convert(item.unitPrice(), from, to, rate);
            itemRepository.save(withUnitPrice(item, convertedPrice));
        }

        return saved;
    }

    /** Reconstruiește o cameră doar cu bugetul alocat schimbat — toate câmpurile tehnice se păstrează. */
    private static Room withAllocatedBudget(Room room, Money allocatedBudget) {
        return Room.builder(room.id(), room.type(), room.name(), allocatedBudget)
                .floorMaterial(room.floorMaterial())
                .floorArea(room.floorArea())
                .perimeter(room.perimeter())
                .tileSize(room.tileSize())
                .installationType(room.installationType())
                .doors(room.doors())
                .baseboardHeight(room.baseboardHeight())
                .wallShape(room.wallShape())
                .wallTiling(room.wallTiling())
                .wallFinish(room.wallFinish())
                .windows(room.windows())
                .build();
    }

    /** Reconstruiește un element doar cu prețul unitar schimbat — restul câmpurilor se păstrează. */
    private static Item withUnitPrice(Item item, Money unitPrice) {
        return new Item(item.id(), item.roomId(), item.name(), item.materialType(), item.source(),
                item.status(), item.quantity(), unitPrice, item.productUrl(), item.imageUrl(), item.origin());
    }
}
