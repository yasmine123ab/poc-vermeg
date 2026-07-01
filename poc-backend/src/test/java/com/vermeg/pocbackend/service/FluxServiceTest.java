package com.vermeg.pocbackend.service;

import com.vermeg.pocbackend.dto.request.ConnectorConfigDTO;
import com.vermeg.pocbackend.dto.request.FluxRequestDTO;
import com.vermeg.pocbackend.dto.response.FluxResponseDTO;
import com.vermeg.pocbackend.exception.ResourceNotFoundException;
import com.vermeg.pocbackend.exception.ValidationException;
import com.vermeg.pocbackend.model.ConnectorConfig;
import com.vermeg.pocbackend.model.Flux;
import com.vermeg.pocbackend.model.enums.ConnectorType;
import com.vermeg.pocbackend.model.enums.FluxStatus;
import com.vermeg.pocbackend.model.enums.OutputFormat;
import com.vermeg.pocbackend.repository.ConnectorConfigRepository;
import com.vermeg.pocbackend.repository.FluxRepository;
import com.vermeg.pocbackend.repository.TransformRuleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FluxServiceTest {

    @Mock private FluxRepository fluxRepository;
    @Mock private ConnectorConfigRepository connectorConfigRepository;
    @Mock private TransformRuleRepository transformRuleRepository;
    @Mock private FluxMapper fluxMapper;

    @InjectMocks
    private FluxService fluxService;

    private FluxRequestDTO validDto() {
        FluxRequestDTO dto = new FluxRequestDTO();
        dto.setName("test-flux");
        dto.setConnectorType(ConnectorType.DATABASE);
        dto.setOutputFormat(OutputFormat.JSON);
        return dto;
    }

    private Flux fluxWithStatus(FluxStatus status) {
        return Flux.builder()
                .id(1L)
                .name("test-flux")
                .status(status)
                .connectorType(ConnectorType.DATABASE)
                .outputFormat(OutputFormat.JSON)
                .build();
    }

    @Test
    void createFlux_success() {
        FluxRequestDTO dto = validDto();
        Flux entity = fluxWithStatus(FluxStatus.INACTIVE);
        FluxResponseDTO responseDTO = FluxResponseDTO.builder().id(1L).name("test-flux").build();

        when(fluxMapper.toEntity(dto)).thenReturn(entity);
        when(fluxRepository.save(entity)).thenReturn(entity);
        when(fluxMapper.toTransformRules(null, entity)).thenReturn(Collections.emptyList());
        when(fluxMapper.toResponse(entity)).thenReturn(responseDTO);

        FluxResponseDTO result = fluxService.createFlux(dto);

        assertThat(result.getName()).isEqualTo("test-flux");
        verify(fluxRepository).save(entity);
        verify(connectorConfigRepository, never()).save(any());
    }

    @Test
    void createFlux_shouldSaveConnectorConfig() {
        FluxRequestDTO dto = validDto();
        ConnectorConfigDTO configDTO = new ConnectorConfigDTO();
        configDTO.setType(ConnectorType.DATABASE);
        dto.setConnectorConfig(configDTO);

        Flux entity = fluxWithStatus(FluxStatus.INACTIVE);
        ConnectorConfig connectorConfig = ConnectorConfig.builder().type(ConnectorType.DATABASE).build();
        FluxResponseDTO responseDTO = FluxResponseDTO.builder().id(1L).name("test-flux").build();

        when(fluxMapper.toEntity(dto)).thenReturn(entity);
        when(fluxRepository.save(entity)).thenReturn(entity);
        when(fluxMapper.toConnectorConfig(any(ConnectorConfigDTO.class), any(Flux.class))).thenReturn(connectorConfig);
        when(fluxMapper.toTransformRules(null, entity)).thenReturn(Collections.emptyList());
        when(fluxMapper.toResponse(entity)).thenReturn(responseDTO);

        fluxService.createFlux(dto);

        verify(connectorConfigRepository).save(connectorConfig);
    }

    @Test
    void getFluxById_notFound_throwsResourceNotFoundException() {
        when(fluxRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fluxService.getFluxById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getFluxById_success() {
        Flux flux = fluxWithStatus(FluxStatus.ACTIVE);
        FluxResponseDTO dto = FluxResponseDTO.builder().id(1L).name("test-flux").build();
        when(fluxRepository.findById(1L)).thenReturn(Optional.of(flux));
        when(fluxMapper.toResponse(flux)).thenReturn(dto);

        FluxResponseDTO result = fluxService.getFluxById(1L);

        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void deleteFlux_shouldThrow_whenRunning() {
        Flux flux = fluxWithStatus(FluxStatus.RUNNING);
        when(fluxRepository.findById(1L)).thenReturn(Optional.of(flux));

        assertThatThrownBy(() -> fluxService.deleteFlux(1L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("RUNNING");

        verify(fluxRepository, never()).delete(any(Flux.class));
    }

    @Test
    void deleteFlux_success() {
        Flux flux = fluxWithStatus(FluxStatus.INACTIVE);
        when(fluxRepository.findById(1L)).thenReturn(Optional.of(flux));
        when(connectorConfigRepository.findByFluxId(1L)).thenReturn(Optional.empty());
        when(transformRuleRepository.findByFluxIdOrderByOrderIndex(1L)).thenReturn(Collections.emptyList());

        fluxService.deleteFlux(1L);

        verify(fluxRepository).delete(flux);
    }

    @Test
    void activateFlux_changesStatusToActive() {
        Flux flux = fluxWithStatus(FluxStatus.INACTIVE);
        FluxResponseDTO dto = FluxResponseDTO.builder().id(1L).status(FluxStatus.ACTIVE).build();

        when(fluxRepository.findById(1L)).thenReturn(Optional.of(flux));
        when(fluxRepository.save(any(Flux.class))).thenReturn(flux);
        when(fluxMapper.toResponse(any(Flux.class))).thenReturn(dto);

        FluxResponseDTO result = fluxService.activateFlux(1L);

        assertThat(result.getStatus()).isEqualTo(FluxStatus.ACTIVE);
        verify(fluxRepository).save(any(Flux.class));
    }

    @Test
    void deactivateFlux_shouldThrow_whenRunning() {
        Flux flux = fluxWithStatus(FluxStatus.RUNNING);
        when(fluxRepository.findById(1L)).thenReturn(Optional.of(flux));

        assertThatThrownBy(() -> fluxService.deactivateFlux(1L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("RUNNING");
    }
}
