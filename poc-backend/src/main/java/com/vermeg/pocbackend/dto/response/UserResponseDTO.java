package com.vermeg.pocbackend.dto.response;

import com.vermeg.pocbackend.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private Long id;

    private String username;

    private String email;

    private UserRole role;

    private boolean enabled;

    private LocalDateTime createdAt;
}
