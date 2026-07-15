package ro.renovatorpro.application.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.UpdateItemUseCase;
import ro.renovatorpro.application.port.out.ItemRepository;
import ro.renovatorpro.domain.exception.ItemNotFoundException;
import ro.renovatorpro.domain.model.Item;

@Service
public class UpdateItemService implements UpdateItemUseCase {

    private final ItemRepository itemRepository;

    public UpdateItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    @Transactional
    public Item execute(String currentUserId, String itemId, Command command) {
        Item existing = itemRepository.findById(itemId).orElseThrow(() -> new ItemNotFoundException(itemId));
        Item patched = new Item(
                existing.id(),
                existing.roomId(),
                command.name() != null ? command.name() : existing.name(),
                command.materialType() != null ? command.materialType() : existing.materialType(),
                command.source() != null ? command.source() : existing.source(),
                command.status() != null ? command.status() : existing.status(),
                command.quantity() != null ? command.quantity() : existing.quantity(),
                command.unitPrice() != null ? command.unitPrice() : existing.unitPrice(),
                command.productUrl() != null ? command.productUrl() : existing.productUrl(),
                command.imageUrl() != null ? command.imageUrl() : existing.imageUrl(),
                existing.origin()
        );
        return itemRepository.save(patched);
    }
}
