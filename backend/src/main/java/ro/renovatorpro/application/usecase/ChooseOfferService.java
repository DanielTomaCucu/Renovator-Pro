package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.ChooseOfferUseCase;
import ro.renovatorpro.application.port.out.ComparisonGroupRepository;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.OfferRepository;
import ro.renovatorpro.application.port.out.RoomRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.application.security.MembershipGuard;
import ro.renovatorpro.domain.exception.ComparisonGroupNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.ComparisonGroupStatus;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Offer;
import ro.renovatorpro.domain.model.user.ProjectRole;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Alegerea unei oferte creează elementul de cumpărat corespunzător (regulile de mapare — vezi
 * docs/cerinte-comparator-oferte.md §„Reguli choose → Item"). Toate câmpurile ofertei sunt opționale —
 * fallback-uri explicite pe fiecare, ca {@link Item} (câmpuri obligatorii) să rămână mereu valid.
 */
@Service
@RequiredArgsConstructor
public class ChooseOfferService implements ChooseOfferUseCase {

    private final ComparisonGroupRepository comparisonGroupRepository;
    private final OfferRepository offerRepository;
    private final RoomRepository roomRepository;
    private final ItemRepository itemRepository;
    private final IdGenerator idGenerator;
    private final TimeProvider timeProvider;
    private final MembershipGuard membershipGuard;

    @Override
    @Transactional
    public Result execute(String currentUserId, String groupId, Command command) {
        ComparisonGroup group = comparisonGroupRepository.findById(groupId)
                .orElseThrow(() -> new ComparisonGroupNotFoundException(groupId));
        String projectId = roomRepository.findProjectIdById(group.roomId())
                .orElseThrow(() -> new ComparisonGroupNotFoundException(groupId));
        if (!membershipGuard.hasRole(currentUserId, projectId, ProjectRole.EDITOR)) {
            throw new ComparisonGroupNotFoundException(groupId);
        }
        Offer offer = offerRepository.findById(command.offerId())
                .orElseThrow(() -> new IllegalArgumentException("Oferta " + command.offerId() + " nu aparține acestui grup de comparație"));
        if (!offer.groupId().equals(groupId)) {
            throw new IllegalArgumentException("Oferta " + command.offerId() + " nu aparține acestui grup de comparație");
        }

        Instant now = timeProvider.now();
        Item item = new Item(
                idGenerator.newId(),
                group.roomId(),
                offer.name() != null ? offer.name() : group.name(),
                group.materialType(),
                offer.store() != null ? offer.store() : "",
                ItemStatus.IN_ASTEPTARE,
                resolveQuantity(command.quantity(), offer.quantity()),
                offer.unitPrice() != null ? offer.unitPrice() : Money.zero(),
                offer.productUrl(),
                firstUrlImage(offer),
                ItemOrigin.COMPARATOR,
                now,
                null
        );
        Item savedItem = itemRepository.save(item);

        ComparisonGroup updated = new ComparisonGroup(
                group.id(), group.roomId(), group.name(), group.materialType(),
                ComparisonGroupStatus.DECIS, offer.id(), savedItem.id(), group.createdAt()
        );
        ComparisonGroup savedGroup = comparisonGroupRepository.save(updated);
        List<Offer> offers = offerRepository.findByGroupId(savedGroup.id());

        return new Result(savedGroup, offers, savedItem);
    }

    private static BigDecimal resolveQuantity(BigDecimal fromCommand, BigDecimal fromOffer) {
        if (fromCommand != null) return fromCommand;
        if (fromOffer != null) return fromOffer;
        return BigDecimal.ONE;
    }

    /** Prima poză de tip URL extern din ofertă — pozele data-URI (upload din telefon) nu se copiază pe item. */
    private static String firstUrlImage(Offer offer) {
        return offer.images().stream()
                .filter(img -> img.startsWith("http://") || img.startsWith("https://"))
                .findFirst()
                .orElse(null);
    }
}
