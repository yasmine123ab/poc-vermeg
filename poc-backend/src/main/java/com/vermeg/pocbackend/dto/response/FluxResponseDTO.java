package com.vermeg.pocbackend.dto.response;

import com.vermeg.pocbackend.dto.request.ConnectorConfigDTO;
import com.vermeg.pocbackend.dto.request.TransformRuleDTO;
import com.vermeg.pocbackend.model.enums.ConnectorType;
import com.vermeg.pocbackend.model.enums.FluxStatus;
import com.vermeg.pocbackend.model.enums.OutputFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FluxResponseDTO {

    private Long id;
    private String name;
    private String description;
    private FluxStatus status;
    private ConnectorType connectorType;
    private OutputFormat outputFormat;
    private String config;
    private ConnectorConfigDTO connectorConfig;
    private List<TransformRuleDTO> transformRules;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
