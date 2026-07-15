package com.vermeg.pocbackend.service;

import com.vermeg.pocbackend.config.JwtService;
import com.vermeg.pocbackend.dto.request.ForgotPasswordRequestDTO;
import com.vermeg.pocbackend.dto.request.LoginRequestDTO;
import com.vermeg.pocbackend.dto.request.RegisterRequestDTO;
import com.vermeg.pocbackend.dto.request.ResetPasswordRequestDTO;
import com.vermeg.pocbackend.dto.request.UpdateProfileRequestDTO;
import com.vermeg.pocbackend.dto.response.AuthResponseDTO;
import com.vermeg.pocbackend.dto.response.UserResponseDTO;
import com.vermeg.pocbackend.exception.ResourceNotFoundException;
import com.vermeg.pocbackend.exception.ValidationException;
import com.vermeg.pocbackend.model.User;
import com.vermeg.pocbackend.model.enums.UserRole;
import com.vermeg.pocbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final UserDetailsServiceImpl userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already taken: " + dto.getUsername());
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already registered: " + dto.getEmail());
        }

        User user = User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phoneNumber(dto.getPhoneNumber())
                .avatarInitials(computeAvatarInitials(dto.getFirstName(), dto.getLastName()))
                .role(dto.getRole() != null ? dto.getRole() : UserRole.ADMIN)
                .enabled(true)
                .build();
        userRepository.save(user);

        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtService.generateToken(userDetails);

        return buildAuthResponse(user, token);
    }

    public AuthResponseDTO login(LoginRequestDTO dto) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(dto.getUsername());

        if (!passwordEncoder.matches(dto.getPassword(), userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(userDetails);

        return buildAuthResponse(user, token);
    }

    public String forgotPassword(ForgotPasswordRequestDTO dto) {
        userRepository.findByEmail(dto.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setResetPasswordExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);

            try {
                emailService.sendPasswordResetEmail(user.getEmail(), token, user.getFirstName());
            } catch (Exception e) {
                log.warn("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
            }
        });

        return "Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.";
    }

    public String resetPassword(ResetPasswordRequestDTO dto) {
        User user = userRepository.findByResetPasswordToken(dto.getToken())
                .orElseThrow(() -> new ValidationException("Token de réinitialisation invalide"));

        if (user.getResetPasswordExpiry() == null || user.getResetPasswordExpiry().isBefore(LocalDateTime.now())) {
            throw new ValidationException("Token de réinitialisation expiré");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new ValidationException("Les mots de passe ne correspondent pas");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiry(null);
        userRepository.save(user);

        return "Votre mot de passe a été réinitialisé avec succès.";
    }

    public UserResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());

        if (dto.getNewPassword() != null && !dto.getNewPassword().isBlank()) {
            if (dto.getCurrentPassword() == null || !passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
                throw new ValidationException("Mot de passe actuel incorrect");
            }
            if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
                throw new ValidationException("Les mots de passe ne correspondent pas");
            }
            user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        }

        user.setAvatarInitials(computeAvatarInitials(user.getFirstName(), user.getLastName()));
        userRepository.save(user);

        return buildUserResponse(user);
    }

    private String computeAvatarInitials(String firstName, String lastName) {
        String first = firstName != null && !firstName.isBlank() ? firstName.substring(0, 1) : "";
        String last = lastName != null && !lastName.isBlank() ? lastName.substring(0, 1) : "";
        return (first + last).toUpperCase(Locale.ROOT);
    }

    private AuthResponseDTO buildAuthResponse(User user, String token) {
        return AuthResponseDTO.builder()
                .token(token)
                .type("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .expiresIn(jwtExpiration)
                .build();
    }

    private UserResponseDTO buildUserResponse(User user) {
        return UserResponseDTO.builder()
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
    }
}
