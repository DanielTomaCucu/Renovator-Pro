package ro.renovatorpro.adapter.in.web;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ro.renovatorpro.adapter.in.web.mapper.RoomDtoMapper;
import ro.renovatorpro.application.port.in.AddRoomUseCase;
import ro.renovatorpro.application.port.in.DeleteRoomUseCase;
import ro.renovatorpro.application.port.in.GetRoomsUseCase;
import ro.renovatorpro.application.port.in.UpdateRoomUseCase;
import ro.renovatorpro.domain.exception.RoomNotFoundException;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomType;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** DoD Task 4.1: happy path + validare + 404, JSON cu enum-uri diacritice (ex. „Bucătărie"). */
class RoomControllerTest {

    private final GetRoomsUseCase getRoomsUseCase = mock(GetRoomsUseCase.class);
    private final AddRoomUseCase addRoomUseCase = mock(AddRoomUseCase.class);
    private final UpdateRoomUseCase updateRoomUseCase = mock(UpdateRoomUseCase.class);
    private final DeleteRoomUseCase deleteRoomUseCase = mock(DeleteRoomUseCase.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        RoomDtoMapper mapper = Mappers.getMapper(RoomDtoMapper.class);
        RoomController controller = new RoomController(getRoomsUseCase, addRoomUseCase, updateRoomUseCase, deleteRoomUseCase, mapper);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void listIntoarceCamereleCuTipulCaLabelCuDiacritice() throws Exception {
        Room room = Room.builder("r1", RoomType.BUCATARIE, "Bucătărie", Money.of(3000)).build();
        when(getRoomsUseCase.execute(anyString(), eq("p1"))).thenReturn(List.of(room));

        mockMvc.perform(get("/api/projects/p1/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("r1"))
                .andExpect(jsonPath("$[0].type").value("Bucătărie"))
                .andExpect(jsonPath("$[0].projectId").value("p1"));
    }

    @Test
    void createValideazaNumeleGolCu400() throws Exception {
        mockMvc.perform(post("/api/projects/p1/rooms")
                        .contentType(APPLICATION_JSON)
                        .content("{\"type\": \"Baie\", \"name\": \"\", \"allocatedBudget\": 500}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReturneaza201SiCameraCreata() throws Exception {
        Room created = Room.builder("r2", RoomType.BAIE, "Baie Principală", Money.of(1200)).build();
        when(addRoomUseCase.execute(anyString(), eq("p1"), any())).thenReturn(created);

        mockMvc.perform(post("/api/projects/p1/rooms")
                        .contentType(APPLICATION_JSON)
                        .content("{\"type\": \"Baie\", \"name\": \"Baie Principală\", \"allocatedBudget\": 1200}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("r2"))
                .andExpect(jsonPath("$.type").value("Baie"));
    }

    @Test
    void updateIntoarce404CandCameraNuExista() throws Exception {
        when(updateRoomUseCase.execute(anyString(), eq("missing"), any())).thenThrow(new RoomNotFoundException("missing"));

        mockMvc.perform(patch("/api/rooms/missing")
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\": \"Nume Nou\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateReturneazaCameraActualizataCuProjectId() throws Exception {
        Room updated = Room.builder("r1", RoomType.BAIE, "Nume Nou", Money.of(1200)).build();
        when(updateRoomUseCase.execute(anyString(), eq("r1"), any()))
                .thenReturn(new UpdateRoomUseCase.Result(updated, "p1"));

        mockMvc.perform(patch("/api/rooms/r1")
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\": \"Nume Nou\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nume Nou"))
                .andExpect(jsonPath("$.projectId").value("p1"));
    }

    @Test
    void deleteReturneaza204() throws Exception {
        mockMvc.perform(delete("/api/rooms/r1"))
                .andExpect(status().isNoContent());
    }
}
