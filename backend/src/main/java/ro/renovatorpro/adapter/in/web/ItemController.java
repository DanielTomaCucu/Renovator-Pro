package ro.renovatorpro.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import ro.renovatorpro.adapter.in.web.dto.ItemCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.ItemResponse;
import ro.renovatorpro.adapter.in.web.dto.ItemUpdateRequest;
import ro.renovatorpro.adapter.in.web.mapper.ItemDtoMapper;
import ro.renovatorpro.application.port.in.AddItemUseCase;
import ro.renovatorpro.application.port.in.DeleteItemUseCase;
import ro.renovatorpro.application.port.in.GetItemsUseCase;
import ro.renovatorpro.application.port.in.UpdateItemUseCase;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ItemController {

    private final GetItemsUseCase getItemsUseCase;
    private final AddItemUseCase addItemUseCase;
    private final UpdateItemUseCase updateItemUseCase;
    private final DeleteItemUseCase deleteItemUseCase;
    private final ItemDtoMapper mapper;

    @GetMapping("/api/projects/{projectId}/items")
    public List<ItemResponse> list(@PathVariable String projectId) {
        return getItemsUseCase.execute(WebConstants.STUB_USER_ID, projectId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @PostMapping("/api/rooms/{roomId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse create(@PathVariable String roomId, @Valid @RequestBody ItemCreateRequest request) {
        // roomId din PATH e sursa de adevăr, nu cel din body (chiar dacă DTO-ul îl are, per contract
        // Omit<Item,"id"> — un roomId divergent în body nu trebuie să poată redirecționa elementul).
        AddItemUseCase.Command fromBody = mapper.toAddCommand(request);
        AddItemUseCase.Command command = new AddItemUseCase.Command(
                roomId, fromBody.name(), fromBody.materialType(), fromBody.source(), fromBody.status(),
                fromBody.quantity(), fromBody.unitPrice(), fromBody.productUrl(), fromBody.imageUrl(), fromBody.origin()
        );
        return mapper.toResponse(addItemUseCase.execute(WebConstants.STUB_USER_ID, command));
    }

    @PatchMapping("/api/items/{id}")
    public ItemResponse update(@PathVariable String id, @RequestBody ItemUpdateRequest request) {
        UpdateItemUseCase.Command command = mapper.toUpdateCommand(request);
        return mapper.toResponse(updateItemUseCase.execute(WebConstants.STUB_USER_ID, id, command));
    }

    @DeleteMapping("/api/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        deleteItemUseCase.execute(WebConstants.STUB_USER_ID, id);
    }
}
