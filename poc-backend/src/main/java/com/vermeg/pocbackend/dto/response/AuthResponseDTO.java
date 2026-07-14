package com.vermeg.pocbackend.dto.response;

import com.vermeg.pocbackend.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;

    @Builder.Default
    private String type = "Bearer";

    private String username;

    private String email;

    private UserRole role;

    private long expiresIn;
}
