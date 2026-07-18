package ro.renovatorpro.adapter.in.web;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ro.renovatorpro.adapter.in.web.mapper.ItemDtoMapper;
import ro.renovatorpro.application.port.in.AddItemUseCase;
import ro.renovatorpro.application.port.in.DeleteItemUseCase;
import ro.renovatorpro.application.port.in.GetItemsUseCase;
import ro.renovatorpro.application.port.in.UpdateItemUseCase;
import ro.renovatorpro.domain.exception.ItemNotFoundException;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** DoD Task 4.1: happy path + validare + 404, JSON cu status ca label cu diacritice ("Cumpărat"). */
class ItemControllerTest {

    private final GetItemsUseCase getItemsUseCase = mock(GetItemsUseCase.class);
    private final AddItemUseCase addItemUseCase = mock(AddItemUseCase.class);
    private final UpdateItemUseCase updateItemUseCase = mock(UpdateItemUseCase.class);
    private final DeleteItemUseCase deleteItemUseCase = mock(DeleteItemUseCase.class);
    private MockMvc mockMvc;

    private static Item item(String id) {
        return new Item(id, "r1", "Gresie", MaterialType.GRESIE, "Dedeman", ItemStatus.CUMPARAT,
                BigDecimal.TEN, Money.of(45), null, null, ItemOrigin.MANUAL, Instant.now(), Instant.now());
    }

    @BeforeEach
    void setUp() {
        ItemDtoMapper mapper = Mappers.getMapper(ItemDtoMapper.class);
        ItemController controller = new ItemController(getItemsUseCase, addItemUseCase, updateItemUseCase, deleteItemUseCase, mapper);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("test-user", null, List.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listIntoarceElementeleCuStatusCaLabelCuDiacritice() throws Exception {
        when(getItemsUseCase.execute(anyString(), eq("p1"))).thenReturn(List.of(item("i1")));

        mockMvc.perform(get("/api/projects/p1/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("Cumpărat"))
                .andExpect(jsonPath("$[0].materialType").value("Gresie"))
                .andExpect(jsonPath("$[0].createdAt").exists())
                .andExpect(jsonPath("$[0].purchasedAt").exists());
    }

    @Test
    void createValideazaCantitateaNegativaCu400() throws Exception {
        mockMvc.perform(post("/api/rooms/r1/items")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"roomId":"r1","name":"Gresie","materialType":"Gresie","status":"Planificat",
                                 "quantity":-1,"unitPrice":10,"origin":"Manual"}"""))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createIgnoraRoomIdDinBodySiFoloseastePath() throws Exception {
        when(addItemUseCase.execute(anyString(), any())).thenReturn(item("i2"));

        mockMvc.perform(post("/api/rooms/r1/items")
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {"roomId":"alt-room","name":"Gresie","materialType":"Gresie","status":"Planificat",
                                 "quantity":10,"unitPrice":45,"origin":"Manual"}"""))
                .andExpect(status().isCreated());

        var captor = org.mockito.ArgumentCaptor.forClass(AddItemUseCase.Command.class);
        verify(addItemUseCase).execute(anyString(), captor.capture());
        org.assertj.core.api.Assertions.assertThat(captor.getValue().roomId()).isEqualTo("r1");
    }

    @Test
    void updateIntoarce404CandElementulNuExista() throws Exception {
        when(updateItemUseCase.execute(anyString(), eq("missing"), any())).thenThrow(new ItemNotFoundException("missing"));

        mockMvc.perform(patch("/api/items/missing")
                        .contentType(APPLICATION_JSON)
                        .content("{\"status\": \"Cumpărat\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReturneaza204() throws Exception {
        mockMvc.perform(delete("/api/items/i1"))
                .andExpect(status().isNoContent());
    }
}
