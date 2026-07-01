package com.vermeg.pocbackend.controller;

import com.vermeg.pocbackend.model.Execution;
import com.vermeg.pocbackend.model.ExecutionLog;
import com.vermeg.pocbackend.model.Flux;
import com.vermeg.pocbackend.model.enums.ConnectorType;
import com.vermeg.pocbackend.model.enums.ExecutionStatus;
import com.vermeg.pocbackend.model.enums.FluxStatus;
import com.vermeg.pocbackend.model.enums.LogLevel;
import com.vermeg.pocbackend.model.enums.OutputFormat;
import com.vermeg.pocbackend.repository.ExecutionLogRepository;
import com.vermeg.pocbackend.repository.ExecutionRepository;
import com.vermeg.pocbackend.repository.FluxRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
class ExecutionControllerIntegrationTest {

    @Autowired private WebApplicationContext context;
    @Autowired private FluxRepository fluxRepository;
    @Autowired private ExecutionRepository executionRepository;
    @Autowired private ExecutionLogRepository executionLogRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    private Flux activeFlux(String name) {
        return fluxRepository.save(Flux.builder()
                .name(name)
                .status(FluxStatus.ACTIVE)
                .connectorType(ConnectorType.DATABASE)
                .outputFormat(OutputFormat.JSON)
                .config("{\"query\":\"SELECT 1\"}")
                .build());
    }

    @Test
    void triggerExecution_returns202_whenFluxActive() throws Exception {
        Flux flux = activeFlux("it-exec-flux-active");

        mockMvc.perform(post("/api/executions/flux/" + flux.getId()))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void triggerExecution_returns400_whenFluxInactive() throws Exception {
        Flux flux = fluxRepository.save(Flux.builder()
                .name("it-exec-flux-inactive")
                .status(FluxStatus.INACTIVE)
                .connectorType(ConnectorType.DATABASE)
                .outputFormat(OutputFormat.JSON)
                .build());

        mockMvc.perform(post("/api/executions/flux/" + flux.getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void triggerExecution_returns404_whenFluxNotFound() throws Exception {
        mockMvc.perform(post("/api/executions/flux/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getExecutions_returns200_withPagedContent() throws Exception {
        mockMvc.perform(get("/api/executions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void getExecutionById_returns404_whenNotFound() throws Exception {
        mockMvc.perform(get("/api/executions/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getExecutionLogs_returns200_withLogs() throws Exception {
        Flux flux = activeFlux("it-exec-flux-logs");

        Execution execution = executionRepository.save(Execution.builder()
                .flux(flux)
                .status(ExecutionStatus.SUCCESS)
                .startedAt(LocalDateTime.now())
                .finishedAt(LocalDateTime.now())
                .build());

        executionLogRepository.save(ExecutionLog.builder()
                .execution(execution)
                .level(LogLevel.INFO)
                .step("START")
                .message("Pipeline started successfully")
                .build());

        mockMvc.perform(get("/api/executions/" + execution.getId() + "/logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].level").value("INFO"))
                .andExpect(jsonPath("$[0].step").value("START"));
    }
}
