package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.AddItemUseCase;
import ro.renovatorpro.application.port.out.IdGenerator;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.domain.model.Item;

@Service
@RequiredArgsConstructor
public class AddItemService implements AddItemUseCase {

    private final ItemRepository itemRepository;
    private final IdGenerator idGenerator;

    @Override
    @Transactional
    public Item execute(String currentUserId, Command command) {
        // source e non-opțional în frontend (Item.source: string) — dacă un client API omite câmpul,
        // normalizăm la "" aici, nu lăsăm null să ajungă la INSERT (coloana e NOT NULL).
        String source = command.source() != null ? command.source() : "";
        Item item = new Item(
                idGenerator.newId(), command.roomId(), command.name(), command.materialType(),
                source, command.status(), command.quantity(), command.unitPrice(),
                command.productUrl(), command.imageUrl(), command.origin()
        );
        return itemRepository.save(item);
    }
}
