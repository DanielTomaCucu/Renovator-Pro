package ro.renovatorpro.adapter.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ro.renovatorpro.adapter.in.web.mapper.InspirationImageDtoMapper;
import ro.renovatorpro.application.port.in.AddInspirationImageUseCase;
import ro.renovatorpro.application.port.in.DeleteInspirationImageUseCase;
import ro.renovatorpro.application.port.in.GetInspirationImagesUseCase;
import ro.renovatorpro.application.port.in.UpdateInspirationImageUseCase;
import ro.renovatorpro.domain.exception.InspirationImageNotFoundException;
import ro.renovatorpro.domain.model.InspirationImage;
import ro.renovatorpro.domain.model.InspirationType;

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

class InspirationImageControllerTest {

    private final GetInspirationImagesUseCase getInspirationImagesUseCase = mock(GetInspirationImagesUseCase.class);
    private final AddInspirationImageUseCase addInspirationImageUseCase = mock(AddInspirationImageUseCase.class);
    private final UpdateInspirationImageUseCase updateInspirationImageUseCase = mock(UpdateInspirationImageUseCase.class);
    private final DeleteInspirationImageUseCase deleteInspirationImageUseCase = mock(DeleteInspirationImageUseCase.class);
    private MockMvc mockMvc;

    private static InspirationImage image(String id, String roomId) {
        return new InspirationImage(id, "p1", roomId, InspirationType.POZA_PROPRIE,
                "data:image/jpeg;base64,AAAA", null, null, Instant.now());
    }

    @BeforeEach
    void setUp() {
        InspirationImageDtoMapper mapper = Mappers.getMapper(InspirationImageDtoMapper.class);
        InspirationImageController controller = new InspirationImageController(
                getInspirationImagesUseCase, addInspirationImageUseCase, updateInspirationImageUseCase,
                deleteInspirationImageUseCase, mapper);
        ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules().registerModule(new JsonNullableModule());
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("test-user", null, List.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listIntoarcePozeleProiectului() throws Exception {
        when(getInspirationImagesUseCase.execute(anyString(), eq("p1"))).thenReturn(List.of(image("i1", "r1")));

        mockMvc.perform(get("/api/projects/p1/inspiration-images"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("i1"))
                .andExpect(jsonPath("$[0].type").value("Poză Proprie"));
    }

    @Test
    void createAcceptaPozaFaraCameraFaraNotita() throws Exception {
        when(addInspirationImageUseCase.execute(anyString(), eq("p1"), any())).thenReturn(image("i1", null));

        mockMvc.perform(post("/api/projects/p1/inspiration-images")
                        .contentType(APPLICATION_JSON)
                        .content("{\"type\":\"Poză Proprie\",\"image\":\"data:image/jpeg;base64,AAAA\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomId").doesNotExist());
    }

    @Test
    void createRefuzaImaginePrezentaDarInvalida() throws Exception {
        mockMvc.perform(post("/api/projects/p1/inspiration-images")
                        .contentType(APPLICATION_JSON)
                        .content("{\"type\":\"Poză Proprie\",\"image\":\"not-a-valid-image\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createRefuzaImagineLipsa() throws Exception {
        mockMvc.perform(post("/api/projects/p1/inspiration-images")
                        .contentType(APPLICATION_JSON)
                        .content("{\"type\":\"Poză Proprie\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateIntoarce404CandPozaNuExista() throws Exception {
        when(updateInspirationImageUseCase.execute(anyString(), eq("missing"), any()))
                .thenThrow(new InspirationImageNotFoundException("missing"));

        mockMvc.perform(patch("/api/inspiration-images/missing")
                        .contentType(APPLICATION_JSON)
                        .content("{\"caption\": \"text\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updatePoateMutaLaGeneralCuRoomIdNull() throws Exception {
        when(updateInspirationImageUseCase.execute(anyString(), eq("i1"), any())).thenReturn(image("i1", null));

        mockMvc.perform(patch("/api/inspiration-images/i1")
                        .contentType(APPLICATION_JSON)
                        .content("{\"roomId\": null}"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteReturneaza204() throws Exception {
        mockMvc.perform(delete("/api/inspiration-images/i1"))
                .andExpect(status().isNoContent());
    }
}
