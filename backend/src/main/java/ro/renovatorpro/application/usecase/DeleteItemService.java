package ro.renovatorpro.application.usecase;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.DeleteItemUseCase;
import ro.renovatorpro.application.port.out.ItemRepository;

@Service
public class DeleteItemService implements DeleteItemUseCase {

    private final ItemRepository itemRepository;

    public DeleteItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    @Transactional
    public void execute(String currentUserId, String itemId) {
        itemRepository.deleteById(itemId);
    }
}
