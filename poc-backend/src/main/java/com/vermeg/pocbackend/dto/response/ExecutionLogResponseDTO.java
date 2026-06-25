package com.vermeg.pocbackend.dto.response;

import com.vermeg.pocbackend.model.enums.LogLevel;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ExecutionLogResponseDTO {

    private Long id;
    private LogLevel level;
    private String message;
    private String step;
    private LocalDateTime loggedAt;
}
