package com.vermeg.pocbackend.controller;

import com.vermeg.pocbackend.dto.request.FluxRequestDTO;
import com.vermeg.pocbackend.dto.response.FluxResponseDTO;
import com.vermeg.pocbackend.service.FluxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flux")
@RequiredArgsConstructor
public class FluxController {

    private final FluxService fluxService;

    @GetMapping
    public ResponseEntity<Page<FluxResponseDTO>> getAllFlux(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sort) {
        return ResponseEntity.ok(fluxService.getAllFlux(PageRequest.of(page, size, Sort.by(sort))));
    }

    @PostMapping
    public ResponseEntity<FluxResponseDTO> createFlux(@Valid @RequestBody FluxRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fluxService.createFlux(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FluxResponseDTO> getFluxById(@PathVariable Long id) {
        return ResponseEntity.ok(fluxService.getFluxById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FluxResponseDTO> updateFlux(
            @PathVariable Long id,
            @Valid @RequestBody FluxRequestDTO dto) {
        return ResponseEntity.ok(fluxService.updateFlux(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlux(@PathVariable Long id) {
        fluxService.deleteFlux(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<FluxResponseDTO> activateFlux(@PathVariable Long id) {
        return ResponseEntity.ok(fluxService.activateFlux(id));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<FluxResponseDTO> deactivateFlux(@PathVariable Long id) {
        return ResponseEntity.ok(fluxService.deactivateFlux(id));
    }
}
