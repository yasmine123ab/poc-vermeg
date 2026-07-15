package com.vermeg.pocbackend.controller;

import com.vermeg.pocbackend.dto.request.ForgotPasswordRequestDTO;
import com.vermeg.pocbackend.dto.request.LoginRequestDTO;
import com.vermeg.pocbackend.dto.request.RegisterRequestDTO;
import com.vermeg.pocbackend.dto.request.ResetPasswordRequestDTO;
import com.vermeg.pocbackend.dto.request.UpdateProfileRequestDTO;
import com.vermeg.pocbackend.dto.response.AuthResponseDTO;
import com.vermeg.pocbackend.dto.response.UserResponseDTO;
import com.vermeg.pocbackend.exception.ResourceNotFoundException;
import com.vermeg.pocbackend.model.User;
import com.vermeg.pocbackend.repository.UserRepository;
import com.vermeg.pocbackend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO dto) {
        return ResponseEntity.ok(Map.of("message", authService.forgotPassword(dto)));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO dto) {
        return ResponseEntity.ok(Map.of("message", authService.resetPassword(dto)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> me() {
        User user = currentUser();

        UserResponseDTO response = UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponseDTO> updateProfile(@Valid @RequestBody UpdateProfileRequestDTO dto) {
        User user = currentUser();
        return ResponseEntity.ok(authService.updateProfile(user.getId(), dto));
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}
