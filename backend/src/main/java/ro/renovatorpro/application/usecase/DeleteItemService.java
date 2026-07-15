package ro.renovatorpro.application.usecase;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.renovatorpro.application.port.in.DeleteItemUseCase;
import ro.renovatorpro.application.port.out.ItemRepository;

@Service
@RequiredArgsConstructor
public class DeleteItemService implements DeleteItemUseCase {

    private final ItemRepository itemRepository;

    @Override
    @Transactional
    public void execute(String currentUserId, String itemId) {
        itemRepository.deleteById(itemId);
    }
}
