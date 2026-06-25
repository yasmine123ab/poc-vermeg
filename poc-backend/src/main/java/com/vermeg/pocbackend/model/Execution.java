package com.vermeg.pocbackend.model;

import com.vermeg.pocbackend.model.enums.ExecutionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "execution")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Execution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flux_id", nullable = false)
    private Flux flux;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExecutionStatus status;

    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String outputFilePath;
    private String errorMessage;
    private String triggeredBy;

    @PrePersist
    public void prePersist() {
        if (status == null) status = ExecutionStatus.PENDING;
    }
}
