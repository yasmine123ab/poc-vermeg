package com.vermeg.pocbackend.model;

import com.vermeg.pocbackend.model.enums.LogLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "execution_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id", nullable = false)
    private Execution execution;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LogLevel level;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String step;
    private LocalDateTime loggedAt;

    @PrePersist
    public void prePersist() {
        if (loggedAt == null) loggedAt = LocalDateTime.now();
    }
}
