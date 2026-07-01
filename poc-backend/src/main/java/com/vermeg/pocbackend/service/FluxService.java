package com.vermeg.pocbackend.service;

import com.vermeg.pocbackend.dto.request.FluxRequestDTO;
import com.vermeg.pocbackend.dto.response.FluxResponseDTO;
import com.vermeg.pocbackend.exception.ResourceNotFoundException;
import com.vermeg.pocbackend.exception.ValidationException;
import com.vermeg.pocbackend.model.ConnectorConfig;
import com.vermeg.pocbackend.model.Flux;
import com.vermeg.pocbackend.model.TransformRule;
import com.vermeg.pocbackend.model.enums.FluxStatus;
import com.vermeg.pocbackend.repository.ConnectorConfigRepository;
import com.vermeg.pocbackend.repository.FluxRepository;
import com.vermeg.pocbackend.repository.TransformRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FluxService {

    private final FluxRepository fluxRepository;
    private final ConnectorConfigRepository connectorConfigRepository;
    private final TransformRuleRepository transformRuleRepository;
    private final FluxMapper fluxMapper;

    public FluxResponseDTO createFlux(FluxRequestDTO dto) {
        Flux saved = fluxRepository.save(fluxMapper.toEntity(dto));

        if (dto.getConnectorConfig() != null) {
            connectorConfigRepository.save(fluxMapper.toConnectorConfig(dto.getConnectorConfig(), saved));
        }

        List<TransformRule> rules = fluxMapper.toTransformRules(dto.getTransformRules(), saved);
        if (!rules.isEmpty()) {
            transformRuleRepository.saveAll(rules);
        }

        return fluxMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<FluxResponseDTO> getAllFlux(Pageable pageable) {
        return fluxRepository.findAll(pageable).map(fluxMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public FluxResponseDTO getFluxById(Long id) {
        return fluxRepository.findById(id)
                .map(fluxMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Flux", id));
    }

    public FluxResponseDTO updateFlux(Long id, FluxRequestDTO dto) {
        Flux flux = fluxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flux", id));

        flux.setName(dto.getName());
        flux.setDescription(dto.getDescription());
        flux.setConnectorType(dto.getConnectorType());
        flux.setConfig(dto.getConfig());
        flux.setOutputFormat(dto.getOutputFormat());
        Flux saved = fluxRepository.save(flux);

        if (dto.getConnectorConfig() != null) {
            ConnectorConfig existing = connectorConfigRepository.findByFluxId(id).orElse(null);
            if (existing != null) {
                existing.setType(dto.getConnectorConfig().getType());
                existing.setHost(dto.getConnectorConfig().getHost());
                existing.setPort(dto.getConnectorConfig().getPort());
                existing.setCredential(dto.getConnectorConfig().getCredential());
                existing.setExtra(dto.getConnectorConfig().getExtra());
                connectorConfigRepository.save(existing);
            } else {
                connectorConfigRepository.save(fluxMapper.toConnectorConfig(dto.getConnectorConfig(), saved));
            }
        }

        if (dto.getTransformRules() != null) {
            transformRuleRepository.deleteAll(transformRuleRepository.findByFluxIdOrderByOrderIndex(id));
            List<TransformRule> newRules = fluxMapper.toTransformRules(dto.getTransformRules(), saved);
            if (!newRules.isEmpty()) {
                transformRuleRepository.saveAll(newRules);
            }
        }

        return fluxMapper.toResponse(saved);
    }

    public void deleteFlux(Long id) {
        Flux flux = fluxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flux", id));

        if (FluxStatus.RUNNING.equals(flux.getStatus())) {
            throw new ValidationException("Cannot delete a flux that is currently RUNNING");
        }

        connectorConfigRepository.findByFluxId(id).ifPresent(connectorConfigRepository::delete);
        transformRuleRepository.deleteAll(transformRuleRepository.findByFluxIdOrderByOrderIndex(id));
        fluxRepository.delete(flux);
    }

    public FluxResponseDTO activateFlux(Long id) {
        return changeStatus(id, FluxStatus.ACTIVE);
    }

    public FluxResponseDTO deactivateFlux(Long id) {
        Flux flux = fluxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flux", id));
        if (FluxStatus.RUNNING.equals(flux.getStatus())) {
            throw new ValidationException("Cannot deactivate a flux that is currently RUNNING");
        }
        flux.setStatus(FluxStatus.INACTIVE);
        return fluxMapper.toResponse(fluxRepository.save(flux));
    }

    public FluxResponseDTO archiveFlux(Long id) {
        return changeStatus(id, FluxStatus.ARCHIVED);
    }

    private FluxResponseDTO changeStatus(Long id, FluxStatus newStatus) {
        Flux flux = fluxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flux", id));
        flux.setStatus(newStatus);
        return fluxMapper.toResponse(fluxRepository.save(flux));
    }
}
