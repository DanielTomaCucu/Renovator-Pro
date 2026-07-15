package ro.renovatorpro.adapter.in.web;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ro.renovatorpro.adapter.in.web.mapper.ProjectDtoMapper;
import ro.renovatorpro.application.port.in.ConvertProjectCurrencyUseCase;
import ro.renovatorpro.application.port.in.GetProjectUseCase;
import ro.renovatorpro.application.port.in.UpdateProjectUseCase;
import ro.renovatorpro.domain.exception.ProjectNotFoundException;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Project;

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
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ProjectDtoMapper mapper = Mappers.getMapper(ProjectDtoMapper.class);
        ProjectController controller = new ProjectController(getProjectUseCase, updateProjectUseCase, convertProjectCurrencyUseCase, mapper);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
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
}
