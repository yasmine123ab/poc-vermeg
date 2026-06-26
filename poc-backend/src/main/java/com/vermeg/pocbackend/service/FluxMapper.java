package com.vermeg.pocbackend.service;

import com.vermeg.pocbackend.dto.request.ConnectorConfigDTO;
import com.vermeg.pocbackend.dto.request.FluxRequestDTO;
import com.vermeg.pocbackend.dto.request.TransformRuleDTO;
import com.vermeg.pocbackend.dto.response.FluxResponseDTO;
import com.vermeg.pocbackend.model.ConnectorConfig;
import com.vermeg.pocbackend.model.Flux;
import com.vermeg.pocbackend.model.TransformRule;
import com.vermeg.pocbackend.repository.ConnectorConfigRepository;
import com.vermeg.pocbackend.repository.TransformRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class FluxMapper {

    private final TransformRuleRepository transformRuleRepository;
    private final ConnectorConfigRepository connectorConfigRepository;

    public Flux toEntity(FluxRequestDTO dto) {
        return Flux.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .connectorType(dto.getConnectorType())
                .config(dto.getConfig())
                .outputFormat(dto.getOutputFormat())
                .build();
    }

    public FluxResponseDTO toResponse(Flux flux) {
        List<TransformRuleDTO> rules = transformRuleRepository
                .findByFluxIdOrderByOrderIndex(flux.getId())
                .stream()
                .map(this::toTransformRuleDTO)
                .toList();

        ConnectorConfigDTO configDTO = connectorConfigRepository
                .findByFluxId(flux.getId())
                .map(this::toConnectorConfigDTO)
                .orElse(null);

        return FluxResponseDTO.builder()
                .id(flux.getId())
                .name(flux.getName())
                .description(flux.getDescription())
                .status(flux.getStatus())
                .connectorType(flux.getConnectorType())
                .outputFormat(flux.getOutputFormat())
                .config(flux.getConfig())
                .connectorConfig(configDTO)
                .transformRules(rules)
                .createdAt(flux.getCreatedAt())
                .updatedAt(flux.getUpdatedAt())
                .build();
    }

    public ConnectorConfig toConnectorConfig(ConnectorConfigDTO dto, Flux flux) {
        if (dto == null) return null;
        return ConnectorConfig.builder()
                .flux(flux)
                .type(dto.getType() != null ? dto.getType() : flux.getConnectorType())
                .host(dto.getHost())
                .port(dto.getPort())
                .credential(dto.getCredential())
                .extra(dto.getExtra())
                .build();
    }

    public TransformRule toTransformRule(TransformRuleDTO dto, Flux flux) {
        return TransformRule.builder()
                .flux(flux)
                .orderIndex(dto.getOrderIndex())
                .ruleType(dto.getRuleType())
                .sourceField(dto.getSourceField())
                .targetField(dto.getTargetField())
                .params(dto.getParams())
                .build();
    }

    public List<TransformRule> toTransformRules(List<TransformRuleDTO> dtos, Flux flux) {
        if (dtos == null || dtos.isEmpty()) return Collections.emptyList();
        return dtos.stream().map(dto -> toTransformRule(dto, flux)).toList();
    }

    private TransformRuleDTO toTransformRuleDTO(TransformRule rule) {
        TransformRuleDTO dto = new TransformRuleDTO();
        dto.setOrderIndex(rule.getOrderIndex());
        dto.setRuleType(rule.getRuleType());
        dto.setSourceField(rule.getSourceField());
        dto.setTargetField(rule.getTargetField());
        dto.setParams(rule.getParams());
        return dto;
    }

    private ConnectorConfigDTO toConnectorConfigDTO(ConnectorConfig config) {
        ConnectorConfigDTO dto = new ConnectorConfigDTO();
        dto.setType(config.getType());
        dto.setHost(config.getHost());
        dto.setPort(config.getPort());
        dto.setCredential(config.getCredential());
        dto.setExtra(config.getExtra());
        return dto;
    }
}
