package com.vermeg.pocbackend.dto.response;

import com.vermeg.pocbackend.model.enums.ExecutionStatus;
import com.vermeg.pocbackend.model.enums.LogLevel;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ExecutionUpdateDTO {

    private Long executionId;
    private Long fluxId;
    private String fluxName;
    private ExecutionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Long durationMs;
    private String outputFilePath;
    private String errorMessage;
    private String logMessage;
    private LogLevel logLevel;
    private String logStep;
}
