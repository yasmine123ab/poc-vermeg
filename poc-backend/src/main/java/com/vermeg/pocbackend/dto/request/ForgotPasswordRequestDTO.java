package com.vermeg.pocbackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequestDTO {

    @NotBlank
    @Email
    private String email;
}
