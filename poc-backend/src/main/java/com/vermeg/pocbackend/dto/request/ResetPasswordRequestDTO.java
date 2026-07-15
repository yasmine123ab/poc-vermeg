package com.vermeg.pocbackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequestDTO {

    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 6)
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}
