package com.vermeg.pocbackend.controller;

import com.vermeg.pocbackend.model.Flux;
import com.vermeg.pocbackend.model.enums.ConnectorType;
import com.vermeg.pocbackend.model.enums.FluxStatus;
import com.vermeg.pocbackend.model.enums.OutputFormat;
import com.vermeg.pocbackend.repository.FluxRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
class FluxControllerIntegrationTest {

    @Autowired private WebApplicationContext context;
    @Autowired private FluxRepository fluxRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    private Flux savedFlux(String name) {
        return fluxRepository.save(Flux.builder()
                .name(name)
                .status(FluxStatus.INACTIVE)
                .connectorType(ConnectorType.DATABASE)
                .outputFormat(OutputFormat.JSON)
                .build());
    }

    @Test
    void createFlux_returns201_withValidPayload() throws Exception {
        mockMvc.perform(post("/api/flux")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name":"it-flux-create","connectorType":"DATABASE","outputFormat":"JSON"}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("it-flux-create"))
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }

    @Test
    void createFlux_returns400_whenNameBlank() throws Exception {
        mockMvc.perform(post("/api/flux")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name":"","connectorType":"DATABASE","outputFormat":"JSON"}
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createFlux_returns400_whenConnectorTypeNull() throws Exception {
        mockMvc.perform(post("/api/flux")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name":"it-flux-no-type","outputFormat":"JSON"}
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getFluxById_returns200_whenExists() throws Exception {
        Flux flux = savedFlux("it-flux-get");

        mockMvc.perform(get("/api/flux/" + flux.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(flux.getId()))
                .andExpect(jsonPath("$.name").value("it-flux-get"));
    }

    @Test
    void getFluxById_returns404_whenNotFound() throws Exception {
        mockMvc.perform(get("/api/flux/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllFlux_returns200_withPagedResponse() throws Exception {
        savedFlux("it-flux-page-a");
        savedFlux("it-flux-page-b");
        savedFlux("it-flux-page-c");

        mockMvc.perform(get("/api/flux"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    @Test
    void activateFlux_returns200_withActiveStatus() throws Exception {
        Flux flux = savedFlux("it-flux-activate");

        mockMvc.perform(post("/api/flux/" + flux.getId() + "/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void deleteFlux_returns204_whenExists() throws Exception {
        Flux flux = savedFlux("it-flux-delete");

        mockMvc.perform(delete("/api/flux/" + flux.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteFlux_returns404_whenNotFound() throws Exception {
        mockMvc.perform(delete("/api/flux/999999"))
                .andExpect(status().isNotFound());
    }
}
