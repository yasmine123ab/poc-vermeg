package com.vermeg.pocbackend.service;

import com.vermeg.pocbackend.connector.ConnectorFactory;
import com.vermeg.pocbackend.dto.response.ExecutionLogResponseDTO;
import com.vermeg.pocbackend.dto.response.ExecutionResponseDTO;
import com.vermeg.pocbackend.engine.FileGenerator;
import com.vermeg.pocbackend.engine.TransformEngine;
import com.vermeg.pocbackend.exception.ResourceNotFoundException;
import com.vermeg.pocbackend.exception.ValidationException;
import com.vermeg.pocbackend.model.*;
import com.vermeg.pocbackend.model.enums.ExecutionStatus;
import com.vermeg.pocbackend.model.enums.FluxStatus;
import com.vermeg.pocbackend.model.enums.LogLevel;
import com.vermeg.pocbackend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutionService {

    private final ExecutionRepository executionRepository;
    private final ExecutionLogRepository executionLogRepository;
    private final FluxRepository fluxRepository;
    private final ConnectorFactory connectorFactory;
    private final TransformEngine transformEngine;
    private final FileGenerator fileGenerator;
    private final TransformRuleRepository transformRuleRepository;
    private final ConnectorConfigRepository connectorConfigRepository;

    // Self-reference injected lazily to allow @Async proxy to work on self-calls
    @Autowired
    @Lazy
    private ExecutionService self;

    // -------------------------------------------------------------------------
    // Trigger — synchronous: creates pending execution, fires async pipeline
    // -------------------------------------------------------------------------

    @Transactional
    public ExecutionResponseDTO triggerExecution(Long fluxId) {
        Flux flux = fluxRepository.findById(fluxId)
                .orElseThrow(() -> new ResourceNotFoundException("Flux", fluxId));

        if (!FluxStatus.ACTIVE.equals(flux.getStatus())) {
            throw new ValidationException(
                    "Flux must be ACTIVE to start execution. Current status: " + flux.getStatus());
        }

        Execution execution = executionRepository.save(Execution.builder()
                .flux(flux)
                .status(ExecutionStatus.PENDING)
                .startedAt(LocalDateTime.now())
                .triggeredBy("API")
                .build());

        // Trigger the async pipeline only after this transaction commits —
        // avoids the race where the async thread calls findById before the row is visible.
        final Long executionId = execution.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                self.executeFlux(executionId);
            }
        });

        return toResponseDTO(execution, flux);
    }

    // -------------------------------------------------------------------------
    // Async pipeline execution
    // -------------------------------------------------------------------------

    @Async("executionTaskExecutor")
    public void executeFlux(Long executionId) {
        Execution execution = executionRepository.findById(executionId).orElseThrow();
        Long fluxId = execution.getFlux().getId(); // Safe: Hibernate proxy exposes ID without init
        Flux flux = fluxRepository.findById(fluxId).orElseThrow();

        try {
            // Step d — RUNNING
            execution.setStatus(ExecutionStatus.RUNNING);
            execution = executionRepository.save(execution);
            saveLog(execution, LogLevel.INFO, "START", "Démarrage du pipeline pour le flux : " + flux.getName());

            // Step f — Read
            ConnectorConfig connectorConfig = connectorConfigRepository.findByFluxId(fluxId).orElse(null);
            List<Map<String, Object>> data = connectorFactory
                    .getConnector(flux.getConnectorType())
                    .read(flux.getConfig(), connectorConfig);
            saveLog(execution, LogLevel.INFO, "READ", "Lecture terminée : " + data.size() + " enregistrements lus");

            // Step h — Transform
            List<TransformRule> rules = transformRuleRepository.findByFluxIdOrderByOrderIndex(fluxId);
            data = transformEngine.transform(data, rules);
            saveLog(execution, LogLevel.INFO, "TRANSFORM", "Transformation terminée");

            // Step j — Generate file
            String filePath = fileGenerator.generate(data, flux.getOutputFormat(), execution.getId());
            saveLog(execution, LogLevel.INFO, "GENERATE", "Fichier généré : " + filePath);

            // Step l — SUCCESS
            execution.setStatus(ExecutionStatus.SUCCESS);
            execution.setOutputFilePath(filePath);
            execution.setFinishedAt(LocalDateTime.now());
            executionRepository.save(execution);

        } catch (Exception e) {
            log.error("Pipeline failed for execution {}: {}", executionId, e.getMessage(), e);
            saveLog(execution, LogLevel.ERROR, "ERROR", e.getMessage());
            execution.setStatus(ExecutionStatus.FAILED);
            execution.setErrorMessage(e.getMessage());
            execution.setFinishedAt(LocalDateTime.now());
            executionRepository.save(execution);
        }
    }

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public ExecutionResponseDTO getExecutionById(Long id) {
        Execution execution = executionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution", id));
        return toResponseDTO(execution, execution.getFlux());
    }

    @Transactional(readOnly = true)
    public Page<ExecutionResponseDTO> getExecutions(Long fluxId, ExecutionStatus status, Pageable pageable) {
        Page<Execution> page;
        if (fluxId != null && status != null) {
            page = executionRepository.findByFluxIdAndStatus(fluxId, status, pageable);
        } else if (fluxId != null) {
            page = executionRepository.findByFluxId(fluxId, pageable);
        } else if (status != null) {
            page = executionRepository.findByStatus(status, pageable);
        } else {
            page = executionRepository.findAll(pageable);
        }
        return page.map(e -> toResponseDTO(e, e.getFlux()));
    }

    @Transactional(readOnly = true)
    public List<ExecutionLogResponseDTO> getLogsByExecution(Long executionId) {
        if (!executionRepository.existsById(executionId)) {
            throw new ResourceNotFoundException("Execution", executionId);
        }
        return executionLogRepository.findByExecutionId(executionId).stream()
                .map(this::toLogResponseDTO)
                .toList();
    }

    @Transactional
    public ExecutionResponseDTO cancelExecution(Long executionId) {
        Execution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution", executionId));

        if (!Set.of(ExecutionStatus.RUNNING, ExecutionStatus.PENDING).contains(execution.getStatus())) {
            throw new ValidationException(
                    "Cannot cancel execution with status: " + execution.getStatus());
        }
        execution.setStatus(ExecutionStatus.CANCELLED);
        execution.setFinishedAt(LocalDateTime.now());
        Execution saved = executionRepository.save(execution);
        return toResponseDTO(saved, saved.getFlux());
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private void saveLog(Execution execution, LogLevel level, String step, String message) {
        try {
            executionLogRepository.save(ExecutionLog.builder()
                    .execution(execution)
                    .level(level)
                    .step(step)
                    .message(message)
                    .loggedAt(LocalDateTime.now())
                    .build());
        } catch (Exception e) {
            log.warn("Could not persist log entry [{}] {}: {}", level, step, e.getMessage());
        }
    }

    private ExecutionResponseDTO toResponseDTO(Execution execution, Flux flux) {
        Long durationMs = null;
        if (execution.getStartedAt() != null && execution.getFinishedAt() != null) {
            durationMs = Duration.between(execution.getStartedAt(), execution.getFinishedAt()).toMillis();
        }
        return ExecutionResponseDTO.builder()
                .id(execution.getId())
                .fluxId(flux != null ? flux.getId() : null)
                .fluxName(flux != null ? flux.getName() : null)
                .status(execution.getStatus())
                .startedAt(execution.getStartedAt())
                .finishedAt(execution.getFinishedAt())
                .durationMs(durationMs)
                .outputFilePath(execution.getOutputFilePath())
                .errorMessage(execution.getErrorMessage())
                .build();
    }

    private ExecutionLogResponseDTO toLogResponseDTO(ExecutionLog logEntry) {
        return ExecutionLogResponseDTO.builder()
                .id(logEntry.getId())
                .level(logEntry.getLevel())
                .message(logEntry.getMessage())
                .step(logEntry.getStep())
                .loggedAt(logEntry.getLoggedAt())
                .build();
    }
}
