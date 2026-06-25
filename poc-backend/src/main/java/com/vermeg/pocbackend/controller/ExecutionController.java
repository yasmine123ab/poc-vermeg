package com.vermeg.pocbackend.controller;

import com.vermeg.pocbackend.dto.response.ExecutionLogResponseDTO;
import com.vermeg.pocbackend.dto.response.ExecutionResponseDTO;
import com.vermeg.pocbackend.exception.ResourceNotFoundException;
import com.vermeg.pocbackend.model.enums.ExecutionStatus;
import com.vermeg.pocbackend.service.ExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/executions")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService executionService;

    @PostMapping("/flux/{fluxId}")
    public ResponseEntity<ExecutionResponseDTO> trigger(@PathVariable Long fluxId) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(executionService.triggerExecution(fluxId));
    }

    @GetMapping
    public ResponseEntity<Page<ExecutionResponseDTO>> getExecutions(
            @RequestParam(required = false) Long fluxId,
            @RequestParam(required = false) ExecutionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sort) {
        return ResponseEntity.ok(
                executionService.getExecutions(fluxId, status,
                        PageRequest.of(page, size, Sort.by(sort))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExecutionResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(executionService.getExecutionById(id));
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<ExecutionLogResponseDTO>> getLogs(@PathVariable Long id) {
        return ResponseEntity.ok(executionService.getLogsByExecution(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ExecutionResponseDTO> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(executionService.cancelExecution(id));
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        ExecutionResponseDTO execution = executionService.getExecutionById(id);

        if (execution.getOutputFilePath() == null) {
            throw new ResourceNotFoundException("No output file available for execution " + id);
        }

        File file = new File(execution.getOutputFilePath());
        if (!file.exists()) {
            throw new ResourceNotFoundException("Output file not found on disk for execution " + id);
        }

        Path path = file.toPath();
        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + path.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
