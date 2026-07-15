package com.vermeg.pocbackend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequestDTO {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String phoneNumber;

    private String currentPassword;

    private String newPassword;

    private String confirmPassword;
}
