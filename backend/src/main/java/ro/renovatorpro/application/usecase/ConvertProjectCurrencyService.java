package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.ConvertProjectCurrencyUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.application.port.out.ProjectRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ImplausibleExchangeRateException;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Offer;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.user.ProjectRole;
import ro.renovatorpro.domain.service.CurrencyConverter;

import java.math.BigDecimal;
import java.util.List;

/**
 * Convertește, într-o singură tranzacție, TOATE sumele unui proiect în moneda țintă (Problema 1 din audit).
 * Regula de conversie e delegată la {@link CurrencyConverter} (pură, testată izolat); aici doar orchestrăm
 * citirea, aplicarea pe fiecare entitate și persistarea. Conversia în aceeași monedă e no-op efectiv
 * (factor identitate), dar tot re-scrie moneda proiectului — inofensiv. Modifică proiectul → doar OWNER
 * (blueprint §5: „doar OWNER modifică proiectul"), la fel ca UpdateProjectUseCase.
 */
@Service
@RequiredArgsConstructor
public class ConvertProjectCurrencyService implements ConvertProjectCurrencyUseCase {

    private final ProjectRepository projectRepository;
    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;
    private final ComparisonGroupRepository comparisonGroupRepository;
    private final OfferRepository offerRepository;
    private final MembershipGuard membershipGuard;

    /**
     * Interval plauzibil pt. cursul RON/EUR de azi (BIZ-1) — configurabil dacă valuta reală se depărtează
     * mult. Inițializate inline (nu doar în {@code @Value}) ca testele unitare care construiesc acest
     * serviciu direct (fără context Spring, ex. {@code UseCasesTest}) să nu rămână cu 0.0/0.0 — Spring
     * suprascrie valoarea după construcție dacă proprietatea există, altfel rămâne default-ul de aici.
     */
    @Value("${app.currency.exchange-rate.min:3.0}")
    private double minPlausibleRate = 3.0;

    @Value("${app.currency.exchange-rate.max:8.0}")
    private double maxPlausibleRate = 8.0;

    @Override
    @Transactional
    public Project execute(String currentUserId, String projectId, Command command) {
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.OWNER)) {
            throw new ProjectNotFoundException(projectId);
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        Currency from = project.currency();
        Currency to = command.targetCurrency();
        BigDecimal rate = command.exchangeRate();

        // BIZ-1: conversia e destructivă și persistată — o typo (0.497 în loc de 4.97) ar distruge
        // ireversibil toate sumele proiectului. Doar când monedele chiar diferă (altfel rate e no-op).
        if (from != to && (rate.doubleValue() < minPlausibleRate || rate.doubleValue() > maxPlausibleRate)) {
            throw new ImplausibleExchangeRateException(minPlausibleRate, maxPlausibleRate);
        }

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
        List<String> roomIds = rooms.stream().map(Room::id).toList();
        List<Item> items = itemRepository.findByRoomIds(roomIds);
        for (Item item : items) {
            Money convertedPrice = CurrencyConverter.convert(item.unitPrice(), from, to, rate);
            itemRepository.save(withUnitPrice(item, convertedPrice));
        }

        // 4. Prețul unitar al fiecărei oferte din Comparatorul de Oferte — altfel ofertele rămân în
        // moneda veche și comparația cu bugetul (deja convertit) minte. Ofertele fără preț se sar.
        List<String> groupIds = comparisonGroupRepository.findByRoomIds(roomIds).stream()
                .map(ComparisonGroup::id).toList();
        if (!groupIds.isEmpty()) {
            for (Offer offer : offerRepository.findByGroupIds(groupIds)) {
                if (offer.unitPrice() == null) continue;
                Money convertedPrice = CurrencyConverter.convert(offer.unitPrice(), from, to, rate);
                offerRepository.save(withUnitPrice(offer, convertedPrice));
            }
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
                item.status(), item.quantity(), unitPrice, item.productUrl(), item.imageUrl(), item.origin(),
                item.createdAt(), item.purchasedAt());
    }

    /** Reconstruiește o ofertă doar cu prețul unitar schimbat — restul câmpurilor se păstrează. */
    private static Offer withUnitPrice(Offer offer, Money unitPrice) {
        return new Offer(offer.id(), offer.groupId(), offer.name(), offer.store(), unitPrice,
                offer.quantity(), offer.productUrl(), offer.images(), offer.notes(), offer.createdAt());
    }
}
