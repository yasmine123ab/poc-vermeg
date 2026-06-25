package com.vermeg.pocbackend.service;

import com.vermeg.pocbackend.dto.request.ConnectorConfigDTO;
import com.vermeg.pocbackend.dto.request.FluxRequestDTO;
import com.vermeg.pocbackend.dto.request.TransformRuleDTO;
import com.vermeg.pocbackend.dto.response.FluxResponseDTO;
import com.vermeg.pocbackend.model.ConnectorConfig;
import com.vermeg.pocbackend.model.Flux;
import com.vermeg.pocbackend.model.TransformRule;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class FluxMapper {

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
        return FluxResponseDTO.builder()
                .id(flux.getId())
                .name(flux.getName())
                .description(flux.getDescription())
                .status(flux.getStatus())
                .connectorType(flux.getConnectorType())
                .outputFormat(flux.getOutputFormat())
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
}
