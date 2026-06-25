package com.vermeg.pocbackend.model;

import com.vermeg.pocbackend.model.enums.ConnectorType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "connector_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectorConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flux_id", nullable = false, unique = true)
    private Flux flux;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectorType type;

    private String host;
    private Integer port;

    @Column(columnDefinition = "TEXT")
    private String credential;

    @Column(columnDefinition = "TEXT")
    private String extra;
}
