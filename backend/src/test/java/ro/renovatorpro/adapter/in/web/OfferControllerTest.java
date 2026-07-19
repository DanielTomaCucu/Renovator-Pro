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
import ro.renovatorpro.adapter.in.web.mapper.OfferDtoMapper;
import ro.renovatorpro.application.port.in.AddOfferUseCase;
import ro.renovatorpro.application.port.in.DeleteOfferUseCase;
import ro.renovatorpro.application.port.in.UpdateOfferUseCase;
import ro.renovatorpro.domain.exception.OfferNotFoundException;
import ro.renovatorpro.domain.model.Offer;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** DoD: ofertă complet goală se creează cu succes (niciun câmp obligatoriu — cerințe comparator). */
class OfferControllerTest {

    private final AddOfferUseCase addOfferUseCase = mock(AddOfferUseCase.class);
    private final UpdateOfferUseCase updateOfferUseCase = mock(UpdateOfferUseCase.class);
    private final DeleteOfferUseCase deleteOfferUseCase = mock(DeleteOfferUseCase.class);
    private MockMvc mockMvc;

    private static Offer emptyOffer(String id) {
        return new Offer(id, "g1", null, null, null, null, null, List.of(), null, Instant.now());
    }

    @BeforeEach
    void setUp() {
        OfferDtoMapper mapper = Mappers.getMapper(OfferDtoMapper.class);
        OfferController controller = new OfferController(addOfferUseCase, updateOfferUseCase, deleteOfferUseCase, mapper);
        // standaloneSetup nu pornește contextul Spring complet, deci nu preia bean-ul JsonNullableModule
        // din config/JacksonConfig — înregistrăm manual același modul, altfel JsonNullable din
        // OfferUpdateRequest rămâne null (NPE), nu JsonNullable.undefined() (ca la RoomControllerTest).
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
    void createAccepaBodyComplyetGolCuSucces() throws Exception {
        when(addOfferUseCase.execute(anyString(), eq("g1"), any())).thenReturn(emptyOffer("o1"));

        mockMvc.perform(post("/api/comparison-groups/g1/offers")
                        .contentType(APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").doesNotExist())
                .andExpect(jsonPath("$.images").isArray());
    }

    @Test
    void createValideazaMaxim8Poze() throws Exception {
        String images = "[\"https://a\",\"https://b\",\"https://c\",\"https://d\",\"https://e\",\"https://f\",\"https://g\",\"https://h\",\"https://i\"]";
        mockMvc.perform(post("/api/comparison-groups/g1/offers")
                        .contentType(APPLICATION_JSON)
                        .content("{\"images\":" + images + "}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateIntoarce404CandOfertaNuExista() throws Exception {
        when(updateOfferUseCase.execute(anyString(), eq("missing"), any())).thenThrow(new OfferNotFoundException("missing"));

        mockMvc.perform(patch("/api/offers/missing")
                        .contentType(APPLICATION_JSON)
                        .content("{\"unitPrice\": 50}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updatePoateGoliPretulExplicit() throws Exception {
        when(updateOfferUseCase.execute(anyString(), eq("o1"), any())).thenReturn(emptyOffer("o1"));

        mockMvc.perform(patch("/api/offers/o1")
                        .contentType(APPLICATION_JSON)
                        .content("{\"unitPrice\": null}"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteReturneaza204() throws Exception {
        mockMvc.perform(delete("/api/offers/o1"))
                .andExpect(status().isNoContent());
    }
}
