package ro.renovatorpro.adapter.in.web;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ro.renovatorpro.adapter.in.web.mapper.ProjectDtoMapper;
import ro.renovatorpro.adapter.in.web.mapper.ProjectSummaryDtoMapper;
import ro.renovatorpro.adapter.in.web.mapper.SpendingTimelineDtoMapper;
import ro.renovatorpro.application.port.in.ConvertProjectCurrencyUseCase;
import ro.renovatorpro.application.port.in.GetProjectSummaryUseCase;
import ro.renovatorpro.application.port.in.GetProjectUseCase;
import ro.renovatorpro.application.port.in.GetSpendingTimelineUseCase;
import ro.renovatorpro.application.port.in.UpdateProjectUseCase;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.service.BudgetCalculator;
import ro.renovatorpro.domain.service.RoomDimensionsCalculator;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** DoD Task 4.1: happy path + validare + 404, JSON cu enum-uri diacritice. */
class ProjectControllerTest {

    private final GetProjectUseCase getProjectUseCase = mock(GetProjectUseCase.class);
    private final UpdateProjectUseCase updateProjectUseCase = mock(UpdateProjectUseCase.class);
    private final ConvertProjectCurrencyUseCase convertProjectCurrencyUseCase = mock(ConvertProjectCurrencyUseCase.class);
    private final GetProjectSummaryUseCase getProjectSummaryUseCase = mock(GetProjectSummaryUseCase.class);
    private final GetSpendingTimelineUseCase getSpendingTimelineUseCase = mock(GetSpendingTimelineUseCase.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ProjectDtoMapper mapper = Mappers.getMapper(ProjectDtoMapper.class);
        ProjectSummaryDtoMapper summaryMapper = new ProjectSummaryDtoMapper();
        SpendingTimelineDtoMapper spendingTimelineMapper = new SpendingTimelineDtoMapper();
        ProjectController controller = new ProjectController(
                getProjectUseCase, updateProjectUseCase, convertProjectCurrencyUseCase,
                getProjectSummaryUseCase, getSpendingTimelineUseCase, mapper, summaryMapper, spendingTimelineMapper);
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
    void getIntoarceProiectulCuMonedaCaLabelCuDiacritice() throws Exception {
        when(getProjectUseCase.execute(anyString(), any()))
                .thenReturn(new Project("p1", "Renovare Apartament", Money.of(1000), Currency.RON, 65.0));

        mockMvc.perform(get("/api/projects/p1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("p1"))
                .andExpect(jsonPath("$.title").value("Renovare Apartament"))
                .andExpect(jsonPath("$.currency").value("RON"))
                .andExpect(jsonPath("$.totalBudget").value(1000.00));
    }

    @Test
    void getIntoarce404CandProiectulNuExista() throws Exception {
        when(getProjectUseCase.execute(anyString(), any())).thenThrow(new ProjectNotFoundException("missing"));

        mockMvc.perform(get("/api/projects/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void updateRefuzaBugetNegativCu400() throws Exception {
        mockMvc.perform(patch("/api/projects/p1")
                        .contentType(APPLICATION_JSON)
                        .content("{\"totalBudget\": -5}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updatePatcheazaCuSuccesSiIntoarceProiectulActualizat() throws Exception {
        when(updateProjectUseCase.execute(anyString(), any(), any()))
                .thenReturn(new Project("p1", "Titlu Nou", Money.of(2000), Currency.EUR, null));

        mockMvc.perform(patch("/api/projects/p1")
                        .contentType(APPLICATION_JSON)
                        .content("{\"title\": \"Titlu Nou\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Titlu Nou"));
    }

    @Test
    void convertCurrencyIntoarceProiectulInMonedaTinta() throws Exception {
        when(convertProjectCurrencyUseCase.execute(anyString(), anyString(), any()))
                .thenReturn(new Project("p1", "Renovare", Money.of(4970), Currency.RON, null));

        mockMvc.perform(post("/api/projects/p1/currency")
                        .contentType(APPLICATION_JSON)
                        .content("{\"targetCurrency\": \"RON\", \"exchangeRate\": 4.97}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currency").value("RON"))
                .andExpect(jsonPath("$.totalBudget").value(4970.00));
    }

    @Test
    void convertCurrencyRefuzaCursNepozitivCu400() throws Exception {
        mockMvc.perform(post("/api/projects/p1/currency")
                        .contentType(APPLICATION_JSON)
                        .content("{\"targetCurrency\": \"RON\", \"exchangeRate\": 0}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void convertCurrencyRefuzaCursLipsaCu400() throws Exception {
        mockMvc.perform(post("/api/projects/p1/currency")
                        .contentType(APPLICATION_JSON)
                        .content("{\"targetCurrency\": \"RON\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void summaryIntoarceAgregarileCuEnumLabelDiacritice() throws Exception {
        when(getProjectSummaryUseCase.execute(anyString(), anyString())).thenReturn(
                new GetProjectSummaryUseCase.ProjectSummary(
                        Money.of(500), Money.of(200), new java.math.BigDecimal("800.00"), 50, 1L,
                        List.of(new BudgetCalculator.RoomCost("Baie", Money.of(500))),
                        Map.of(MaterialType.FAIANTA, new BudgetCalculator.CategoryCost(Money.of(500), Money.of(200))),
                        new RoomDimensionsCalculator.ProjectTechnicalSummary(12.5, 0.5)));

        mockMvc.perform(get("/api/projects/p1/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEstimated").value(500.00))
                .andExpect(jsonPath("$.totalSpent").value(200.00))
                .andExpect(jsonPath("$.budgetRemaining").value(800.00))
                .andExpect(jsonPath("$.purchaseProgress").value(50))
                .andExpect(jsonPath("$.boughtCount").value(1))
                .andExpect(jsonPath("$.costPerRoom[0].name").value("Baie"))
                .andExpect(jsonPath("$.costPerCategory[0].materialType").value("Faianță"))
                .andExpect(jsonPath("$.technical.totalFloorArea").value(12.5))
                .andExpect(jsonPath("$.technical.configuredRoomsRatio").value(0.5));
    }

    @Test
    void spendingTimelineIntoarceSeriaCumulativaFormatataYyyyMm() throws Exception {
        when(getSpendingTimelineUseCase.execute(anyString(), anyString())).thenReturn(List.of(
                new GetSpendingTimelineUseCase.TimelinePoint(YearMonth.of(2026, 1), Money.of(100)),
                new GetSpendingTimelineUseCase.TimelinePoint(YearMonth.of(2026, 2), Money.of(400))));

        mockMvc.perform(get("/api/projects/p1/spending-timeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].month").value("2026-01"))
                .andExpect(jsonPath("$[0].cumulativeSpent").value(100.00))
                .andExpect(jsonPath("$[1].month").value("2026-02"))
                .andExpect(jsonPath("$[1].cumulativeSpent").value(400.00));
    }

    @Test
    void spendingTimelineIntoarceListaGoalaCandNimicNuECumparat() throws Exception {
        when(getSpendingTimelineUseCase.execute(anyString(), anyString())).thenReturn(List.of());

        mockMvc.perform(get("/api/projects/p1/spending-timeline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}
