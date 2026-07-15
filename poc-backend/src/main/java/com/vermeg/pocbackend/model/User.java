package com.vermeg.pocbackend.model;

import com.vermeg.pocbackend.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private String avatarInitials;

    private String resetPasswordToken;

    private LocalDateTime resetPasswordExpiry;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean emailVerified = false;

    private LocalDateTime lastLoginAt;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
