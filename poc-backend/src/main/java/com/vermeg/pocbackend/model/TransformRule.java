package com.vermeg.pocbackend.model;

import com.vermeg.pocbackend.model.enums.RuleType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transform_rule")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransformRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flux_id", nullable = false)
    private Flux flux;

    private Integer orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RuleType ruleType;

    private String sourceField;
    private String targetField;

    @Column(columnDefinition = "TEXT")
    private String params;
}
