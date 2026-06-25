package com.vermeg.pocbackend.dto.response;

import com.vermeg.pocbackend.model.enums.ConnectorType;
import com.vermeg.pocbackend.model.enums.FluxStatus;
import com.vermeg.pocbackend.model.enums.OutputFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FluxResponseDTO {

    private Long id;
    private String name;
    private String description;
    private FluxStatus status;
    private ConnectorType connectorType;
    private OutputFormat outputFormat;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
