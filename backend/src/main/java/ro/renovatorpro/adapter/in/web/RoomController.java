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
import ro.renovatorpro.adapter.in.web.dto.RoomCreateRequest;
import ro.renovatorpro.adapter.in.web.dto.RoomResponse;
import ro.renovatorpro.adapter.in.web.dto.RoomUpdateRequest;
import ro.renovatorpro.adapter.in.web.mapper.RoomDtoMapper;
import ro.renovatorpro.application.port.in.AddRoomUseCase;
import ro.renovatorpro.application.port.in.DeleteRoomUseCase;
import ro.renovatorpro.application.port.in.GetRoomsUseCase;
import ro.renovatorpro.application.port.in.UpdateRoomUseCase;
import ro.renovatorpro.domain.model.Room;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RoomController {

    private final GetRoomsUseCase getRoomsUseCase;
    private final AddRoomUseCase addRoomUseCase;
    private final UpdateRoomUseCase updateRoomUseCase;
    private final DeleteRoomUseCase deleteRoomUseCase;
    private final RoomDtoMapper mapper;

    @GetMapping("/api/projects/{projectId}/rooms")
    public List<RoomResponse> list(@PathVariable String projectId) {
        return getRoomsUseCase.execute(CurrentUser.id(), projectId).stream()
                .map(room -> mapper.toResponse(room, projectId))
                .toList();
    }

    @PostMapping("/api/projects/{projectId}/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse create(@PathVariable String projectId, @Valid @RequestBody RoomCreateRequest request) {
        AddRoomUseCase.Command command = mapper.toAddCommand(request);
        Room room = addRoomUseCase.execute(CurrentUser.id(), projectId, command);
        return mapper.toResponse(room, projectId);
    }

    @PatchMapping("/api/rooms/{id}")
    public RoomResponse update(@PathVariable String id, @RequestBody RoomUpdateRequest request) {
        UpdateRoomUseCase.Command command = mapper.toUpdateCommand(request);
        UpdateRoomUseCase.Result result = updateRoomUseCase.execute(CurrentUser.id(), id, command);
        return mapper.toResponse(result.room(), result.projectId());
    }

    @DeleteMapping("/api/rooms/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        deleteRoomUseCase.execute(CurrentUser.id(), id);
    }
}
