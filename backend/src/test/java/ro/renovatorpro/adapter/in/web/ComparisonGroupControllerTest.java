package ro.renovatorpro.adapter.in.web;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ro.renovatorpro.adapter.in.web.mapper.ComparisonGroupDtoMapper;
import ro.renovatorpro.adapter.in.web.mapper.ItemDtoMapper;
import ro.renovatorpro.application.port.in.AddComparisonGroupUseCase;
import ro.renovatorpro.application.port.in.ChooseOfferUseCase;
import ro.renovatorpro.application.port.in.DeleteComparisonGroupUseCase;
import ro.renovatorpro.application.port.in.GetComparisonGroupsUseCase;
import ro.renovatorpro.application.port.in.UpdateComparisonGroupUseCase;
import ro.renovatorpro.domain.exception.ComparisonGroupNotFoundException;
import ro.renovatorpro.domain.model.ComparisonGroup;
import ro.renovatorpro.domain.model.ComparisonGroupStatus;
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
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ComparisonGroupControllerTest {

    private final GetComparisonGroupsUseCase getComparisonGroupsUseCase = mock(GetComparisonGroupsUseCase.class);
    private final AddComparisonGroupUseCase addComparisonGroupUseCase = mock(AddComparisonGroupUseCase.class);
    private final UpdateComparisonGroupUseCase updateComparisonGroupUseCase = mock(UpdateComparisonGroupUseCase.class);
    private final DeleteComparisonGroupUseCase deleteComparisonGroupUseCase = mock(DeleteComparisonGroupUseCase.class);
    private final ChooseOfferUseCase chooseOfferUseCase = mock(ChooseOfferUseCase.class);
    private MockMvc mockMvc;

    private static ComparisonGroup group(String id, ComparisonGroupStatus status) {
        return new ComparisonGroup(id, "r1", "Gresie baie", MaterialType.GRESIE, status, null, null, Instant.now());
    }

    private static Item item(String id) {
        return new Item(id, "r1", "Gresie Tivoli", MaterialType.GRESIE, "Dedeman", ItemStatus.IN_ASTEPTARE,
                BigDecimal.ONE, Money.of(45), null, null, ItemOrigin.COMPARATOR, Instant.now(), null);
    }

    @BeforeEach
    void setUp() {
        ComparisonGroupDtoMapper mapper = Mappers.getMapper(ComparisonGroupDtoMapper.class);
        ItemDtoMapper itemMapper = Mappers.getMapper(ItemDtoMapper.class);
        ComparisonGroupController controller = new ComparisonGroupController(
                getComparisonGroupsUseCase, addComparisonGroupUseCase, updateComparisonGroupUseCase,
                deleteComparisonGroupUseCase, chooseOfferUseCase, mapper, itemMapper);
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
    void listIntoarceGrupurileCuStatusCaLabelCuDiacritice() throws Exception {
        when(getComparisonGroupsUseCase.execute(anyString(), eq("p1")))
                .thenReturn(List.of(new GetComparisonGroupsUseCase.GroupWithOffers(group("g1", ComparisonGroupStatus.IN_ANALIZA), List.of())));

        mockMvc.perform(get("/api/projects/p1/comparison-groups"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("În analiză"))
                .andExpect(jsonPath("$[0].materialType").value("Gresie"))
                .andExpect(jsonPath("$[0].offers").isArray());
    }

    @Test
    void createValideazaNumeGolCu400() throws Exception {
        mockMvc.perform(post("/api/rooms/r1/comparison-groups")
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\":\"\",\"materialType\":\"Gresie\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReturneaza201CuOfferteGoale() throws Exception {
        when(addComparisonGroupUseCase.execute(anyString(), eq("r1"), any()))
                .thenReturn(group("g1", ComparisonGroupStatus.IN_ANALIZA));

        mockMvc.perform(post("/api/rooms/r1/comparison-groups")
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Gresie baie\",\"materialType\":\"Gresie\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.offers").isEmpty());
    }

    @Test
    void updateIntoarce404CandGrupulNuExista() throws Exception {
        when(updateComparisonGroupUseCase.execute(anyString(), eq("missing"), any()))
                .thenThrow(new ComparisonGroupNotFoundException("missing"));

        mockMvc.perform(patch("/api/comparison-groups/missing")
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\":\"Altceva\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReturneaza204() throws Exception {
        mockMvc.perform(delete("/api/comparison-groups/g1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void chooseCreeazaItemSiIntoarceGrupulDecis() throws Exception {
        when(chooseOfferUseCase.execute(anyString(), eq("g1"), any()))
                .thenReturn(new ChooseOfferUseCase.Result(group("g1", ComparisonGroupStatus.DECIS), List.of(), item("i1")));

        mockMvc.perform(post("/api/comparison-groups/g1/choose")
                        .contentType(APPLICATION_JSON)
                        .content("{\"offerId\":\"o1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.group.status").value("Decis"))
                .andExpect(jsonPath("$.item.origin").value("Din Comparator"));
    }
}
