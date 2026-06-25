package com.vermeg.pocbackend.dto.response;

import com.vermeg.pocbackend.model.enums.ExecutionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ExecutionResponseDTO {

    private Long id;
    private Long fluxId;
    private String fluxName;
    private ExecutionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Long durationMs;
    private String outputFilePath;
    private String errorMessage;
}
