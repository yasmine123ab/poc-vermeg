package com.vermeg.pocbackend.dto.request;

import com.vermeg.pocbackend.model.enums.ConnectorType;
import com.vermeg.pocbackend.model.enums.OutputFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class FluxRequestDTO {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private ConnectorType connectorType;

    private String config;

    @NotNull
    private OutputFormat outputFormat;

    private List<TransformRuleDTO> transformRules;

    private ConnectorConfigDTO connectorConfig;
}
