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
import ro.renovatorpro.domain.service.AutoItemReconciler;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Alegerea unei oferte fie ACTUALIZEAZĂ elementul „Din Configurare" legat de grup (dacă unul există —
 * docs/cerinte-comparator-config-sync.md, evită dublurile pardoseală/plintă/etc. deja generate de
 * configurator), fie creează un element nou {@code Din Comparator} (fallback — categorii care nu vin
 * niciodată din configurator: Mobilă, Electrocasnice, Sanitare etc., sau configurare inexistentă/ștearsă).
 * Regulile de mapare fallback — vezi docs/cerinte-comparator-oferte.md §„Reguli choose → Item". Toate
 * câmpurile ofertei sunt opționale — fallback-uri explicite pe fiecare, ca {@link Item} (câmpuri
 * obligatorii) să rămână mereu valid.
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

        List<Item> roomItems = itemRepository.findByRoomId(group.roomId());
        Item linkedItem = resolveValidLinkedItem(group, roomItems);

        Item savedItem = linkedItem != null
                ? itemRepository.save(applyOfferToLinkedItem(linkedItem, offer))
                : itemRepository.save(createStandaloneItem(group, offer, command.quantity()));

        // linkedItemId rămâne cel al elementului „Din Configurare" (dacă a existat) — pe ramura fallback
        // NU se rescrie cu id-ul itemului nou creat, ca re-alegerea ulterioară să nu-l trateze greșit ca
        // legătură (are origin Comparator, oricum ar eșua validarea, dar clar mai bun să nu ambiguizăm).
        String linkedItemId = linkedItem != null ? savedItem.id() : group.linkedItemId();
        ComparisonGroup updated = new ComparisonGroup(
                group.id(), group.roomId(), group.name(), group.materialType(),
                ComparisonGroupStatus.DECIS, offer.id(), savedItem.id(), linkedItemId, group.createdAt()
        );
        ComparisonGroup savedGroup = comparisonGroupRepository.save(updated);
        List<Offer> offers = offerRepository.findByGroupId(savedGroup.id());

        return new Result(savedGroup, offers, savedItem);
    }

    /**
     * Re-validează {@code group.linkedItemId()} (poate fi stale — reconcilierea camerei șterge/recreează
     * elementele „Din Configurare"); dacă nu mai e valid, re-rezolvă după roomId+materialType. {@code null}
     * dacă niciun element din configurare nu corespunde — ramura fallback (item nou).
     */
    private Item resolveValidLinkedItem(ComparisonGroup group, List<Item> roomItems) {
        if (group.linkedItemId() != null) {
            Item current = roomItems.stream().filter(i -> i.id().equals(group.linkedItemId())).findFirst().orElse(null);
            if (current != null && current.origin() == ItemOrigin.CONFIGURARE && current.materialType() == group.materialType()) {
                return current;
            }
        }
        return AutoItemReconciler.resolveLinkedItem(roomItems, group.roomId(), group.materialType());
    }

    /**
     * Completează elementul deja generat de configurare cu datele ofertei — DOAR câmpurile de
     * preț/sursă/link/poză. {@code name/quantity/status/origin/createdAt/purchasedAt} rămân neatinse
     * (măsurătoarea și progresul userului nu se pierd la alegerea unei oferte). Oferta poate fi parțială —
     * un câmp absent PĂSTREAZĂ valoarea existentă, nu o golește.
     */
    private static Item applyOfferToLinkedItem(Item existing, Offer offer) {
        return new Item(
                existing.id(),
                existing.roomId(),
                existing.name(),
                existing.materialType(),
                offer.store() != null ? offer.store() : existing.source(),
                existing.status(),
                existing.quantity(),
                offer.unitPrice() != null ? offer.unitPrice() : existing.unitPrice(),
                offer.productUrl() != null ? offer.productUrl() : existing.productUrl(),
                firstUrlImage(offer) != null ? firstUrlImage(offer) : existing.imageUrl(),
                existing.origin(),
                existing.createdAt(),
                existing.purchasedAt()
        );
    }

    private Item createStandaloneItem(ComparisonGroup group, Offer offer, BigDecimal commandQuantity) {
        return new Item(
                idGenerator.newId(),
                group.roomId(),
                offer.name() != null ? offer.name() : group.name(),
                group.materialType(),
                offer.store() != null ? offer.store() : "",
                ItemStatus.IN_ASTEPTARE,
                resolveQuantity(commandQuantity, offer.quantity()),
                offer.unitPrice() != null ? offer.unitPrice() : Money.zero(),
                offer.productUrl(),
                firstUrlImage(offer),
                ItemOrigin.COMPARATOR,
                timeProvider.now(),
                null
        );
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
