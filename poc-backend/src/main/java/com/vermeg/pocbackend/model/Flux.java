package com.vermeg.pocbackend.model;

import com.vermeg.pocbackend.model.enums.ConnectorType;
import com.vermeg.pocbackend.model.enums.FluxStatus;
import com.vermeg.pocbackend.model.enums.OutputFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "flux")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Flux {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FluxStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectorType connectorType;

    @Column(columnDefinition = "TEXT")
    private String config;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OutputFormat outputFormat;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = FluxStatus.INACTIVE;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
