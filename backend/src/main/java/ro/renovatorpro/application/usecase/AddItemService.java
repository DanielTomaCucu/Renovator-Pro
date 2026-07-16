package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AddItemUseCase;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.application.port.out.TimeProvider;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemStatus;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AddItemService implements AddItemUseCase {

    private final ItemRepository itemRepository;
    private final IdGenerator idGenerator;
    private final TimeProvider timeProvider;

    @Override
    @Transactional
    public Item execute(String currentUserId, Command command) {
        // source e non-opțional în frontend (Item.source: string) — dacă un client API omite câmpul,
        // normalizăm la "" aici, nu lăsăm null să ajungă la INSERT (coloana e NOT NULL).
        String source = command.source() != null ? command.source() : "";
        Instant now = timeProvider.now();
        // Element creat direct cu status Cumpărat (rar, dar posibil) — considerăm momentul creării și
        // momentul cumpărării identice, ca să nu rămână niciodată un element Cumpărat cu purchasedAt null.
        Instant purchasedAt = command.status() == ItemStatus.CUMPARAT ? now : null;
        Item item = new Item(
                idGenerator.newId(), command.roomId(), command.name(), command.materialType(),
                source, command.status(), command.quantity(), command.unitPrice(),
                command.productUrl(), command.imageUrl(), command.origin(), now, purchasedAt
        );
        return itemRepository.save(item);
    }
}
